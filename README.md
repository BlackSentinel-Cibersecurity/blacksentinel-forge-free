# BlackSentinel Forge — Free / Open-Source Edition

> **This is the free, limited edition.** The AI decision engine is
> **not included in this repository's source at all** (not just
> disabled behind a flag) — see blacksentinel.io for the full platform.
> Marketplace items already tagged non-free in their own data can be
> browsed here but not installed without upgrading.

**Autonomous Security Automation & Orchestration Platform**

Forge is not a traditional SOAR. It is a new category of product — an Autonomous Security Orchestration Platform that serves as the operational brain of the entire BlackSentinel ecosystem.

---

## Architecture

```
blacksentinel-forge/
├── apps/
│   └── web/                    # Next.js 14 Frontend (Command Center)
├── packages/
│   └── shared/                 # Shared types, utils, constants
├── services/
│   ├── api-gateway/            # Express API Gateway + Auth
│   ├── workflow-engine/        # Distributed Workflow Execution Engine
│   ├── ai-engine/              # AI Decision Engine + Copilot
│   ├── event-bus/              # Event Orchestration & Pub/Sub
│   └── connector-service/      # Connector SDK & Marketplace
├── infrastructure/
│   ├── docker/                 # Docker Compose
│   └── kubernetes/             # K8s Manifests
└── package.json                # Monorepo root
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS, Zustand, ReactFlow |
| Backend | Node.js, Express, TypeScript, Zod |
| Database | PostgreSQL (Prisma ORM) |
| Cache/Queue | Redis (BullMQ) |
| AI | Custom decision engine with confidence scoring |
| Auth | JWT + RBAC + ABAC + MFA |
| Infra | Docker, Kubernetes, Terraform |

## Quick Start

### Prerequisites
- Node.js >= 20
- PostgreSQL 16
- Redis 7
- Docker (optional)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Setup Database
```bash
npx prisma generate --workspace=services/api-gateway
npx prisma migrate dev --workspace=services/api-gateway
npm run db:seed
```

### 4. Start Development
```bash
npm run dev
```

This starts all services concurrently:
- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8080
- **Workflow Engine**: internal service
- **AI Engine**: internal service

### Docker Quick Start
```bash
docker-compose up -d
```

## Modules

### Workflow Designer
Visual drag-and-drop editor for building automation workflows with an infinite canvas, version control, and real-time collaboration.

### AI Decision Engine
Autonomous decision-making system that evaluates risk, confidence, and context to determine optimal response actions.

### Intelligent Automation Engine
Distributed execution engine supporting parallel runs, priority queues, retries, dependencies, and automatic recovery.

### Event Orchestration
React to events from SIEM, EDR, IAM, Cloud, Kubernetes, Webhooks, Cron, and manual triggers.

### Connector Marketplace
50+ pre-built integrations with AWS, Azure, GCP, CrowdStrike, ServiceNow, Slack, Splunk, and more.

### AI Security Copilot
Natural language interface for generating workflows, analyzing incidents, and optimizing automations.

### Human Approval Center
Multi-level approval workflows with delegation, expiration, parallel approval, and full audit trail.

### Compliance Automation
Automated evidence collection, control assessment, and report generation for SOC2, ISO27001, NIST, PCI-DSS, HIPAA.

### Secret Integration
Native integration with BlackSentinel Vault for secure secret management with automatic rotation.

### Observability
Full tracing, metrics, logging, and alerting across all automation workflows.

## API Reference

All API endpoints are prefixed with `/api/v1/`.

| Module | Endpoint | Methods |
|--------|----------|---------|
| Auth | `/auth/login`, `/auth/register` | POST |
| Workflows | `/workflows` | GET, POST, PUT, DELETE |
| Executions | `/executions` | GET |
| Connectors | `/connectors` | GET, POST |
| AI | `/ai/generate-workflow`, `/ai/make-decision` | POST |
| Approvals | `/approvals` | GET, POST |
| Events | `/events` | GET, POST |
| Dashboard | `/dashboard/stats` | GET |
| Playbooks | `/playbooks` | GET, POST |
| Secrets | `/secrets` | GET, POST, PUT, DELETE |
| Compliance | `/compliance/frameworks` | GET |
| Observability | `/observability/metrics`, `/observability/traces` | GET |
| Team | `/team` | GET, POST, PUT, DELETE |
| Settings | `/settings/general` | GET, PUT |
| Marketplace | `/marketplace` | GET, POST |
| Audit | `/audit` | GET |

## Security

- Zero Trust architecture
- JWT authentication with refresh tokens
- RBAC + ABAC permission model
- Multi-factor authentication support
- SSO integration (SAML/OIDC)
- Immutable audit logging
- Workflow signing and integrity validation
- Adaptive approval gates
- Rate limiting and DDoS protection
- Encrypted secrets via BlackSentinel Vault

## Deployment

### Kubernetes
```bash
kubectl apply -f infrastructure/kubernetes/namespace.yaml
kubectl apply -f infrastructure/kubernetes/secrets.yaml
kubectl apply -f infrastructure/kubernetes/configmap.yaml
kubectl apply -f infrastructure/kubernetes/
```

### Environment Variables
See `.env.example` for all required configuration.

## License

Proprietary - BlackSentinel Security, Inc.
