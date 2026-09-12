// ============================================================================
// BlackSentinel Forge — Free / Open-Source Edition
//
// The AI decision engine (services/ai-engine, routes/ai.ts) is paid-plan
// only and is not included in this repository's source at all. Marketplace
// items already carried their own `pricing: 'free' | '$X/mo'` field in
// their data (pre-existing) — this enforces that on install instead of it
// being decorative.
//
// Honesty note: workflows/executions/connectors/compliance/observability in
// this service are mock data — POST /workflows, for example, never calls
// prisma.workflow.create despite the schema having a real Workflow model.
// ============================================================================

export const FREE_LIMITS = {
  paidMarketplaceItemsEnabled: false,
} as const;

export const editionConfig = {
  edition: 'free' as const,
  limits: FREE_LIMITS,
};
