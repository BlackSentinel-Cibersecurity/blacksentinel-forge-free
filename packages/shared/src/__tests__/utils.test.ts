import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateId,
  generateCorrelationId,
  sleep,
  deepClone,
  pick,
  omit,
  flattenObject,
  unflattenObject,
  retry,
  chunk,
  debounce,
  formatDuration,
  formatNumber,
  calculateRiskScore,
  getRiskLevel,
} from '../utils';

describe('generateId', () => {
  it('returns a valid UUID v4 format', () => {
    const id = generateId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('generates unique IDs on successive calls', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });
});

describe('generateCorrelationId', () => {
  it('returns correct format with forge prefix', () => {
    const id = generateCorrelationId();
    expect(id).toMatch(/^forge-\d+-[a-z0-9]{6}$/);
  });

  it('generates unique correlation IDs', () => {
    const id1 = generateCorrelationId();
    const id2 = generateCorrelationId();
    expect(id1).not.toBe(id2);
  });
});

describe('sleep', () => {
  it('resolves after delay (real timers)', async () => {
    const start = Date.now();
    await sleep(50);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(40);
  });
});

describe('deepClone', () => {
  it('creates an independent copy of a nested object', () => {
    const original = { a: 1, b: { c: 2, d: [3, 4] } };
    const cloned = deepClone(original);

    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
    expect(cloned.b).not.toBe(original.b);
    expect(cloned.b.d).not.toBe(original.b.d);
  });

  it('mutations to clone do not affect original', () => {
    const original = { a: { b: 1 } };
    const cloned = deepClone(original);

    (cloned as any).a.b = 999;
    expect(original.a.b).toBe(1);
  });
});

describe('pick', () => {
  it('selects only the specified keys', () => {
    const obj = { a: 1, b: 2, c: 3, d: 4 };
    const result = pick(obj, ['a', 'c']);
    expect(result).toEqual({ a: 1, c: 3 });
  });

  it('ignores keys that do not exist', () => {
    const obj = { a: 1 } as Record<string, unknown>;
    const result = pick(obj, ['a', 'z' as any]);
    expect(result).toEqual({ a: 1 });
  });
});

describe('omit', () => {
  it('removes the specified keys', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const result = omit(obj, ['b']);
    expect(result).toEqual({ a: 1, c: 3 });
  });

  it('returns original object when omitting non-existent keys', () => {
    const obj = { a: 1, b: 2 } as Record<string, unknown>;
    const result = omit(obj, ['z' as any]);
    expect(result).toEqual({ a: 1, b: 2 });
  });
});

describe('flattenObject', () => {
  it('flattens nested objects with dot notation', () => {
    const obj = { a: { b: 1, c: { d: 2 } }, e: 3 };
    const result = flattenObject(obj);
    expect(result).toEqual({ 'a.b': 1, 'a.c.d': 2, e: 3 });
  });

  it('does not flatten arrays', () => {
    const obj = { a: { b: [1, 2] } };
    const result = flattenObject(obj);
    expect(result).toEqual({ 'a.b': [1, 2] });
  });
});

describe('unflattenObject', () => {
  it('reverses flattenObject output', () => {
    const flat = { 'a.b': 1, 'a.c.d': 2, e: 3 };
    const result = unflattenObject(flat);
    expect(result).toEqual({ a: { b: 1, c: { d: 2 } }, e: 3 });
  });

  it('handles single-level keys', () => {
    const flat = { a: 1, b: 2 };
    const result = unflattenObject(flat);
    expect(result).toEqual({ a: 1, b: 2 });
  });
});

describe('retry', () => {
  it('succeeds on first attempt without retrying', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    const result = await retry(fn, 3, 100, 2);

    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledOnce();
  });

  it('retries on failure then succeeds', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('ok');

    const result = await retry(fn, 3, 10, 2);

    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('throws after exhausting retries', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('always fails'));

    await expect(retry(fn, 2, 10, 2)).rejects.toThrow('always fails');
    expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
  });
});

describe('chunk', () => {
  it('splits array into correctly sized chunks', () => {
    const result = chunk([1, 2, 3, 4, 5], 2);
    expect(result).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('returns single chunk when size >= array length', () => {
    const result = chunk([1, 2, 3], 10);
    expect(result).toEqual([[1, 2, 3]]);
  });

  it('returns empty array for empty input', () => {
    expect(chunk([], 3)).toEqual([]);
  });
});

describe('debounce', () => {
  it('delays execution by specified delay', async () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 50);

    debounced();
    expect(fn).not.toHaveBeenCalled();

    await sleep(80);
    expect(fn).toHaveBeenCalledOnce();
  });

  it('resets timer on subsequent calls', async () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    await sleep(50);
    debounced();
    expect(fn).not.toHaveBeenCalled();

    await sleep(120);
    expect(fn).toHaveBeenCalledOnce();
  });
});

describe('formatDuration', () => {
  it('formats milliseconds correctly', () => {
    expect(formatDuration(500)).toBe('500ms');
  });

  it('formats seconds correctly', () => {
    expect(formatDuration(1500)).toBe('1.5s');
  });

  it('formats minutes and seconds correctly', () => {
    expect(formatDuration(90000)).toBe('1m 30s');
  });

  it('formats hours and minutes correctly', () => {
    expect(formatDuration(3660000)).toBe('1h 1m');
  });
});

describe('formatNumber', () => {
  it('formats millions with M suffix', () => {
    expect(formatNumber(1500000)).toBe('1.5M');
  });

  it('formats thousands with K suffix', () => {
    expect(formatNumber(2500)).toBe('2.5K');
  });

  it('returns plain number below 1000', () => {
    expect(formatNumber(999)).toBe('999');
  });
});

describe('calculateRiskScore', () => {
  it('returns a valid weighted risk score', () => {
    const score = calculateRiskScore({
      severity: 80,
      blastRadius: 60,
      assetValue: 70,
      exploitability: 50,
      exposure: 40,
    });
    // 80*0.3 + 60*0.2 + 70*0.2 + 50*0.15 + 40*0.15 = 24+12+14+7.5+6 = 63.5 -> 64
    expect(score).toBe(64);
  });

  it('returns 0 for all zero factors', () => {
    const score = calculateRiskScore({
      severity: 0,
      blastRadius: 0,
      assetValue: 0,
      exploitability: 0,
      exposure: 0,
    });
    expect(score).toBe(0);
  });

  it('returns 100 for all max factors', () => {
    const score = calculateRiskScore({
      severity: 100,
      blastRadius: 100,
      assetValue: 100,
      exploitability: 100,
      exposure: 100,
    });
    expect(score).toBe(100);
  });
});

describe('getRiskLevel', () => {
  it('returns critical for scores >= 90', () => {
    expect(getRiskLevel(90)).toBe('critical');
    expect(getRiskLevel(100)).toBe('critical');
  });

  it('returns high for scores >= 70', () => {
    expect(getRiskLevel(70)).toBe('high');
    expect(getRiskLevel(89)).toBe('high');
  });

  it('returns medium for scores >= 40', () => {
    expect(getRiskLevel(40)).toBe('medium');
    expect(getRiskLevel(69)).toBe('medium');
  });

  it('returns low for scores > 0', () => {
    expect(getRiskLevel(1)).toBe('low');
    expect(getRiskLevel(39)).toBe('low');
  });

  it('returns none for score 0', () => {
    expect(getRiskLevel(0)).toBe('none');
  });
});
