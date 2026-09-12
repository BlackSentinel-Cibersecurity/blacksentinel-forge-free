# ============================================================================
# BlackSentinel Forge - Deployment & Delivery Guide
# ============================================================================

## Quick Start (5 minutes)

```bash
# 1. Clone and install
cd blacksentinel-forge
npm install

# 2. Configure
cp .env.example .env

# 3. Start with Docker (recommended)
./forge docker:up

# 4. Access
# Frontend:  http://localhost:3000
# API:       http://localhost:8080
# Health:    http://localhost:8080/health
```

---

## Deployment Options

### Option 1: Docker Compose (Single Server)
**Best for:** Small teams, proof of concept, single-server deployments

```bash
./forge docker:build
./forge docker:up
```

**Requirements:**
- Docker 24+
- Docker Compose v2
- 8GB RAM minimum
- 20GB disk space

**Architecture:**
```
┌─────────────────────────────────────────┐
│              Single Server              │
├─────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│  │  Web    │  │  API    │  │  Postgres│ │
│  │  :3000  │  │  :8080  │  │  :5432  │ │
│  └─────────┘  └─────────┘  └─────────┘ │
│  ┌─────────┐  ┌─────────┐              │
│  │  Redis  │  │  Engine │              │
│  │  :6379  │  │  :8081  │              │
│  └─────────┘  └─────────┘              │
└─────────────────────────────────────────┘
```

**Estimated cost:** $50-200/month (cloud VM)

---

### Option 2: Kubernetes (Production)
**Best for:** Enterprise, high availability, auto-scaling

```bash
# Configure
export REGISTRY=your-registry.com
export TAG=latest

# Build and push images
docker build -t $REGISTRY/forge-api:latest -f services/api-gateway/Dockerfile .
docker build -t $REGISTRY/forge-web:latest -f apps/web/Dockerfile .
docker push $REGISTRY/forge-api:latest
docker push $REGISTRY/forge-web:latest

# Deploy
./forge deploy
```

**Requirements:**
- Kubernetes 1.28+
- 3+ worker nodes
- Load balancer
- Ingress controller
- 16GB+ RAM total

**Architecture:**
```
┌─────────────────────────────────────────────────────┐
│                   Kubernetes Cluster                 │
├─────────────────────────────────────────────────────┤
│  Namespace: blacksentinel-forge                     │
│                                                     │
│  Deployments (auto-scaled 2-10):                    │
│  ├── api-gateway (2 replicas)                       │
│  ├── workflow-engine (2 replicas)                   │
│  ├── ai-engine (1-3 replicas)                       │
│  └── web (2 replicas)                               │
│                                                     │
│  StatefulSets:                                      │
│  ├── postgres (1 primary + replicas)                │
│  └── redis (1 primary + replicas)                   │
│                                                     │
│  Services:                                          │
│  ├── LoadBalancer (web)                             │
│  ├── ClusterIP (api, engine, ai)                    │
│  └── ClusterIP (postgres, redis)                    │
│                                                     │
│  Ingress:                                           │
│  ├── api.yourdomain.com → api-gateway               │
│  └── yourdomain.com → web                           │
└─────────────────────────────────────────────────────┘
```

**Estimated cost:** $500-2000/month (cloud managed K8s)

---

### Option 3: SaaS (Multi-Tenant)
**Best for:** ISVs, MSPs, selling as a service

```bash
# Deploy once, serve many
# Add tenant management layer
# Implement billing integration
# Add tenant isolation
```

**Architecture:**
```
┌─────────────────────────────────────────────────────┐
│                  SaaS Platform                       │
├─────────────────────────────────────────────────────┤
│  Global Infrastructure:                              │
│  ├── API Gateway (rate limiting, auth)               │
│  ├── Tenant Router (multi-tenant routing)            │
│  └── Billing Service (Stripe/Paddle)                 │
│                                                     │
│  Per-Tenant:                                         │
│  ├── Database (schema-per-tenant or row-level)       │
│  ├── Redis Namespace                                 │
│  ├── Workflow Engine (shared or dedicated)           │
│  └── AI Engine (shared)                              │
│                                                     │
│  Tenant Tiers:                                       │
│  ├── Free: 100 executions/month, 5 workflows        │
│  ├── Pro: 10K executions/month, 100 workflows       │
│  └── Enterprise: Unlimited                           │
└─────────────────────────────────────────────────────┘
```

**Revenue model:**
- Free tier → paid conversion
- Per-seat pricing
- Usage-based pricing
- Enterprise contracts

---

### Option 4: On-Premise (Air-Gapped)
**Best for:** Government, defense, regulated industries

```bash
# 1. Export all artifacts
./forge build
docker save blacksentinel-forge | gzip > forge-images.tar.gz

# 2. Transfer to air-gapped network
scp forge-images.tar.gz user@internal-server:/opt/forge/

# 3. Import and deploy
docker load < forge-images.tar.gz
docker-compose up -d
```

**Requirements:**
- All Docker images pre-pulled
- No external network access needed
- Manual certificate management
- Offline license key

---

### Option 5: White-Label / OEM
**Best for:** Resellers, system integrators, consulting firms

```bash
# Customize branding
# Rebrand as your own product
# Sell as part of your security offering
```

**Customization points:**
- Logo and brand colors
- Custom domain
- Custom connectors
- Custom playbooks
- API white-labeling

---

## Delivery Models

### 1. Self-Hosted (Open Source)
- Users deploy on their own infrastructure
- Community support
- Free tier available
- Premium support plans

### 2. Managed Cloud (SaaS)
- Fully managed by you
- SLA guarantees
- Automatic updates
- 24/7 support

### 3. Hybrid
- Core platform managed
- User-specific customizations
- Shared infrastructure
- Dedicated resources for enterprise

### 4. Marketplace Distribution
- AWS Marketplace
- Azure Marketplace
- Google Cloud Marketplace
- Private marketplace

---

## Pricing Strategies

### Per-Execution
```
Free:     $0/month    (100 executions)
Starter:  $99/month   (1,000 executions)
Pro:      $499/month  (10,000 executions)
Enterprise: Custom     (unlimited)
```

### Per-Seat
```
Free:     $0/month    (1 user)
Team:     $49/user/month (up to 10)
Business: $99/user/month (up to 50)
Enterprise: Custom     (unlimited)
```

### Platform Fee + Usage
```
Platform: $299/month (base)
Usage:    $0.01 per execution
Storage:  $0.10 per GB
```

---

## Security Checklist for Delivery

- [ ] JWT secrets rotated for each tenant
- [ ] Database connections encrypted (TLS)
- [ ] API rate limiting configured
- [ ] CORS origins restricted
- [ ] MFA enabled for admin accounts
- [ ] Audit logging enabled
- [ ] Secret rotation policies configured
- [ ] Network policies applied (K8s)
- [ ] WAF configured (if public-facing)
- [ ] DDoS protection enabled
- [ ] Backup strategy implemented
- [ ] Disaster recovery plan tested
- [ ] Penetration testing completed
- [ ] SOC 2 compliance verified
- [ ] Data retention policies configured

---

## Monitoring & Alerting

### Required Metrics
- API response time (p50, p95, p99)
- Error rate (4xx, 5xx)
- Workflow execution success rate
- Queue depth
- Database connection pool usage
- Memory/CPU utilization
- Active WebSocket connections
- Authentication failures

### Alert Thresholds
- Error rate > 1% → Critical
- Response time p95 > 2s → Warning
- Queue depth > 1000 → Warning
- CPU > 80% → Warning
- Memory > 85% → Critical
- Disk > 90% → Critical

---

## Support & SLA

### Tier 1 (Free)
- Community forum
- Documentation
- 48h response time

### Tier 2 (Pro)
- Email support
- 24h response time
- Monthly health checks

### Tier 3 (Enterprise)
- Dedicated support engineer
- 1h response time (critical)
- 4h response time (high)
- Quarterly architecture reviews
- Custom feature development
