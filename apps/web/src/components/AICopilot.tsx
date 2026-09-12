'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Copy,
  Check,
  Loader2,
  Workflow,
  Shield,
  AlertTriangle,
  Zap,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  type?: 'text' | 'workflow-generated' | 'recommendation' | 'error';
}

const suggestions = [
  'Automate phishing response',
  'Create a ransomware containment workflow',
  'Optimize my existing automations',
  'Why did my last automation fail?',
  'Show me security recommendations',
];

const sampleResponses: Record<string, string> = {
  'phishing': `I'll create a comprehensive phishing response workflow for you.

**Workflow: Phishing Auto-Response**

1. **Email Trigger** - Monitors inbound emails via API
2. **IOC Extraction** - Extracts URLs, attachments, sender info
3. **AI Analysis** - Classifies threat level using ML model
4. **Conditional Branch** - Routes based on severity score
   - **High (>7)**: Isolate + Block + Notify
   - **Low (<=7)**: Monitor + Log
5. **Endpoint Isolation** - Network quarantine affected host
6. **IOC Blocking** - Block malicious indicators on firewall
7. **Incident Creation** - Auto-create ServiceNow ticket
8. **Team Notification** - Alert SOC via Slack

**Estimated Risk:** MEDIUM (contains isolation with approval gate)
**Dependencies:** CrowdStrike EDR, Palo Alto FW, ServiceNow, Slack
**Tests:** 2 scenarios included

Ready to deploy?`,
  
  'ransomware': `I'll build a ransomware containment workflow with maximum speed.

**Workflow: Ransomware Emergency Response**

1. **EDR Alert Trigger** - CrowdStrike/Defender detection
2. **AI Risk Assessment** - Confidence scoring
3. **Parallel Execution:**
   - Branch A: Isolate all affected endpoints
   - Branch B: Verify backup integrity
   - Branch C: Alert security team immediately
4. **Forensic Snapshot** - Capture memory dump
5. **IOC Extraction** - Extract encryption keys, C2 servers
6. **Incident Escalation** - Critical priority ticket
7. **Executive Notification** - Brief leadership

**Estimated Risk:** HIGH (immediate containment)
**Time to Complete:** ~3 minutes
**Auto-execution:** Requires approval for isolation steps`,
  
  'default': `I understand. Let me help you with that.

Based on your request, I can:

1. **Generate a workflow** with the appropriate nodes and logic
2. **Recommend connectors** from our marketplace of 50+ integrations
3. **Estimate risk** and suggest approval gates
4. **Create tests** to validate before deployment

What specific aspect would you like me to focus on?`,
};

export function AICopilot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Welcome to **Forge AI Copilot**. I'm your autonomous security automation assistant.

I can help you:
- Generate workflows from natural language
- Optimize existing automations
- Analyze security incidents
- Recommend response actions
- Create playbooks and documentation

What would you like to automate today?`,
      timestamp: new Date().toISOString(),
      type: 'text',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const lowerInput = input.toLowerCase();
    let responseContent = sampleResponses['default'];
    let responseType: Message['type'] = 'text';

    if (lowerInput.includes('phishing')) {
      responseContent = sampleResponses['phishing'];
      responseType = 'workflow-generated';
    } else if (lowerInput.includes('ransomware')) {
      responseContent = sampleResponses['ransomware'];
      responseType = 'workflow-generated';
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: responseContent,
      timestamp: new Date().toISOString(),
      type: responseType,
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="forge-card p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-forge-purple/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-forge-purple" />
          </div>
          <div>
            <h2 className="font-semibold text-forge-white">Forge AI Copilot</h2>
            <p className="text-xs text-forge-gray-medium">
              Powered by BlackSentinel AI Engine
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="forge-badge-green">
            <Sparkles className="w-3 h-3 mr-1" />
            Online
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl ${
                message.role === 'user'
                  ? 'forge-btn-primary'
                  : 'forge-card p-4'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-4 h-4 text-forge-purple" />
                  <span className="text-xs font-medium text-forge-purple">Forge AI</span>
                </div>
              )}
              <div className="text-sm whitespace-pre-wrap leading-relaxed">
                {message.content.split('\n').map((line, i) => {
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return (
                      <div key={i} className="font-bold text-forge-white mt-2 mb-1">
                        {line.replace(/\*\*/g, '')}
                      </div>
                    );
                  }
                  if (line.startsWith('- ')) {
                    return (
                      <div key={i} className="flex items-start gap-2 ml-4 text-forge-gray-light">
                        <span className="text-forge-orange mt-0.5">•</span>
                        {line.slice(2)}
                      </div>
                    );
                  }
                  return (
                    <div key={i} className={line ? 'text-forge-gray-light' : 'h-2'}>
                      {line || ''}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-forge-gray-dark/50">
                <span className="text-[10px] text-forge-gray-medium">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
                {message.role === 'assistant' && (
                  <button
                    onClick={() => copyMessage(message.id, message.content)}
                    className="text-forge-gray-medium hover:text-forge-white transition-colors"
                  >
                    {copiedId === message.id ? (
                      <Check className="w-3 h-3 text-forge-green" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="forge-card p-4">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-forge-purple" />
                <Loader2 className="w-4 h-4 text-forge-purple animate-spin" />
                <span className="text-sm text-forge-gray-medium">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setInput(suggestion)}
              className="forge-card px-3 py-2 text-xs text-forge-gray-light hover:text-forge-white hover:border-forge-orange/50 transition-all"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="forge-card p-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe what you want to automate..."
            className="flex-1 forge-input text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="forge-btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
