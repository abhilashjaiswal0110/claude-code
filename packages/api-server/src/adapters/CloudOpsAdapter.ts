import { BaseAdapter, type AdapterContext } from './BaseAdapter.js';
import type { AgentInfo, StreamEvent } from '../types.js';

export class CloudOpsAdapter extends BaseAdapter {
  readonly agentInfo: AgentInfo = {
    id: 'cloud-ops-agent',
    name: 'Cloud Operations',
    description: 'Cost optimization, incident response, capacity planning, architecture review, and migration assessment',
    category: 'Ops',
    modes: [
      { id: 'cost-opt', label: 'Cost Optimization', description: 'Optimize cloud costs' },
      { id: 'incident-response', label: 'Incident Response', description: 'Handle cloud incidents' },
      { id: 'capacity', label: 'Capacity Planning', description: 'Plan capacity needs' },
      { id: 'arch-review', label: 'Architecture Review', description: 'Review cloud architecture' },
      { id: 'migration', label: 'Migration', description: 'Assess migration readiness' },
    ],
  };

  async processMessage(
    context: AdapterContext,
    onEvent: (event: StreamEvent) => void
  ): Promise<string> {
    const { topic, mode, additionalContext } = context;

    this.emitStage(onEvent, 0, 'Infrastructure Analysis', 'running');
    this.emitThinking(onEvent, `Analyzing cloud infrastructure for ${mode}...\n`);
    await this.delay(600);
    this.emitStage(onEvent, 0, 'Infrastructure Analysis', 'completed');

    this.emitStage(onEvent, 1, 'Report Generation', 'running');

    const response = this.generateResponse(mode, topic, additionalContext);
    await this.simulateStreaming(response, onEvent);

    this.emitStage(onEvent, 1, 'Report Generation', 'completed');
    this.emitDone(onEvent);

    return response;
  }

  private generateResponse(mode: string, topic: string, context?: string): string {
    const responses: Record<string, string> = {
      'cost-opt': `## Cloud Cost Optimization: ${topic}

### Executive Summary

| Metric | Current | Optimized | Savings |
|--------|---------|-----------|---------|
| Monthly Spend | $125,000 | $87,500 | $37,500 (30%) |
| Annual Spend | $1.5M | $1.05M | $450K |
| Cost/Transaction | $0.012 | $0.008 | 33% |

### Cost Breakdown by Service

| Service | Monthly Cost | % of Total | Optimization |
|---------|-------------|------------|--------------|
| Compute (EC2/VMs) | $55,000 | 44% | High |
| Database (RDS/SQL) | $28,000 | 22% | Medium |
| Storage (S3/Blob) | $18,000 | 14% | Medium |
| Network/CDN | $12,000 | 10% | Low |
| Other Services | $12,000 | 10% | Low |

### Optimization Recommendations

#### 1. Right-sizing Instances 💰
**Potential Savings: $18,000/month**

| Current | Recommended | Monthly Savings |
|---------|-------------|-----------------|
| 20x m5.2xlarge | 20x m5.xlarge | $8,000 |
| 10x r5.4xlarge | 10x r5.2xlarge | $6,000 |
| 5x c5.9xlarge | 5x c5.4xlarge | $4,000 |

**Evidence:**
- Average CPU utilization: 25%
- Average memory utilization: 35%
- Peak utilization: 60%

#### 2. Reserved Instances/Savings Plans 💰
**Potential Savings: $12,000/month**

| Commitment | Coverage | Discount | Annual Savings |
|------------|----------|----------|----------------|
| 1-year RI | Compute | 35% | $92,000 |
| 3-year RI | Database | 50% | $84,000 |
| Savings Plan | Mixed | 30% | $45,000 |

#### 3. Storage Optimization 💰
**Potential Savings: $5,500/month**

| Action | Current | Optimized | Savings |
|--------|---------|-----------|---------|
| Lifecycle policies | $12,000 | $8,000 | $4,000 |
| Compression | $6,000 | $4,500 | $1,500 |

#### 4. Spot/Preemptible Instances 💰
**Potential Savings: $8,000/month**

Suitable workloads for spot:
- Batch processing jobs
- Development environments
- CI/CD pipelines
- Data analytics

### Implementation Roadmap

| Phase | Actions | Savings | Timeline |
|-------|---------|---------|----------|
| 1 | Right-sizing | $18K/mo | Week 1-2 |
| 2 | Storage optimization | $5.5K/mo | Week 3-4 |
| 3 | RIs/Savings Plans | $12K/mo | Month 2 |
| 4 | Spot instances | $8K/mo | Month 2-3 |

### Monitoring & Governance

**Recommended Tools:**
- AWS Cost Explorer / Azure Cost Management
- Third-party: CloudHealth, Spot.io
- Custom dashboards with alerts

**Governance Rules:**
- Mandatory tagging for all resources
- Quarterly optimization reviews
- Budget alerts at 80%/100%

${context ? `\n**Cost Context:** ${context}` : ''}`,

      'incident-response': `## Cloud Incident Response: ${topic}

### Incident Summary

| Field | Value |
|-------|-------|
| Incident ID | INC-2024-0156 |
| Severity | P1 - Critical |
| Status | Active |
| Started | ${new Date().toISOString()} |
| Duration | 45 minutes |
| Affected Services | API Gateway, Backend Services |

### Impact Assessment

| Metric | Impact |
|--------|--------|
| Users Affected | ~15,000 (estimated) |
| Error Rate | 45% of requests |
| Revenue Impact | $5,000/hour (estimated) |
| SLA Status | At risk |

### Timeline

| Time | Event |
|------|-------|
| T-0 | First alert triggered (API latency >5s) |
| T+2m | On-call engineer engaged |
| T+5m | Incident declared P1 |
| T+10m | War room established |
| T+15m | Root cause identified |
| T+30m | Mitigation in progress |
| T+45m | Partial recovery |

### Root Cause (Preliminary)

**Issue:** Database connection pool exhaustion caused by:
1. Unexpected traffic spike (3x normal)
2. Slow query introduced in recent deployment
3. Connection leak in microservice X

### Current Actions

| Action | Owner | Status |
|--------|-------|--------|
| Scale database read replicas | DBA Team | ✅ Complete |
| Rollback microservice X | Backend Team | ⏳ In Progress |
| Enable rate limiting | Platform Team | ✅ Complete |
| Customer communication | Support | ✅ Sent |

### Mitigation Steps

\`\`\`bash
# 1. Scale read replicas
aws rds modify-db-cluster --db-cluster-id prod-cluster \\
  --scaling-configuration MinCapacity=4,MaxCapacity=16

# 2. Enable connection pooling
kubectl set env deployment/api-gateway \\
  DB_POOL_SIZE=100 DB_MAX_OVERFLOW=50

# 3. Rate limiting
aws apigateway update-stage --rest-api-id xxx \\
  --stage-name prod --patch-operations op=replace,path=/throttle/rateLimit,value=1000
\`\`\`

### Communication Template

**Status Page Update:**
> We are experiencing degraded performance affecting API services. Our team is actively working on resolution. ETA: 30 minutes.

**Customer Email:**
> We are aware of the service disruption and are working to resolve it as quickly as possible. We apologize for any inconvenience.

### Post-Incident Actions

- [ ] Complete RCA document within 48 hours
- [ ] Schedule post-mortem meeting
- [ ] Update runbooks with learnings
- [ ] Review monitoring gaps
- [ ] Implement preventive measures

${context ? `\n**Incident Notes:** ${context}` : ''}`,

      capacity: `## Capacity Planning: ${topic}

### Current Capacity Status

| Resource | Current Usage | Capacity | Headroom |
|----------|--------------|----------|----------|
| Compute | 65% | 100 vCPUs | 35% |
| Memory | 72% | 512 GB | 28% |
| Storage | 55% | 10 TB | 45% |
| Network | 40% | 10 Gbps | 60% |
| Database | 78% | 1000 IOPS | 22% |

### Growth Projections

| Metric | Current | 6 Months | 12 Months | 24 Months |
|--------|---------|----------|-----------|-----------|
| Users | 50,000 | 75,000 | 120,000 | 200,000 |
| Requests/day | 5M | 8M | 15M | 30M |
| Data volume | 5 TB | 8 TB | 15 TB | 35 TB |
| Transactions | 100K/day | 160K/day | 300K/day | 600K/day |

### Capacity Requirements

#### Compute Requirements

| Timeline | Current | Required | Action |
|----------|---------|----------|--------|
| Now | 100 vCPUs | 100 vCPUs | None |
| 6 months | - | 150 vCPUs | +50 vCPUs |
| 12 months | - | 250 vCPUs | +100 vCPUs |
| 24 months | - | 450 vCPUs | +200 vCPUs |

**Recommendation:** Implement auto-scaling with min 60%, max 90% utilization targets

#### Database Requirements

| Timeline | Current | Required | Action |
|----------|---------|----------|--------|
| Now | 1000 IOPS | 1000 IOPS | Monitor closely |
| 6 months | - | 2000 IOPS | Upgrade tier |
| 12 months | - | 4000 IOPS | Add read replicas |
| 24 months | - | 8000 IOPS | Consider sharding |

**Recommendation:** Plan database upgrade for Q2, read replicas for Q4

#### Storage Requirements

| Timeline | Current | Required | Growth Rate |
|----------|---------|----------|-------------|
| Now | 5 TB | 5 TB | Baseline |
| 6 months | - | 8 TB | 60% |
| 12 months | - | 15 TB | 200% |
| 24 months | - | 35 TB | 600% |

**Recommendation:** Implement tiered storage, archive data older than 1 year

### Cost Projections

| Timeline | Monthly Cost | Increase |
|----------|-------------|----------|
| Current | $125,000 | Baseline |
| 6 months | $165,000 | +32% |
| 12 months | $220,000 | +76% |
| 24 months | $350,000 | +180% |

### Optimization Strategies

1. **Auto-scaling**: Reduce over-provisioning by 20%
2. **Spot instances**: Use for non-critical workloads
3. **Reserved capacity**: Commit to base load
4. **Tiered storage**: Move cold data to cheaper tiers

### Action Items

| Priority | Action | Timeline | Owner |
|----------|--------|----------|-------|
| High | Implement auto-scaling | Q1 | Platform |
| High | Database capacity review | Q1 | DBA |
| Medium | Storage tiering | Q2 | Platform |
| Medium | Reserve capacity planning | Q2 | FinOps |
| Low | Network capacity review | Q3 | Network |

${context ? `\n**Planning Context:** ${context}` : ''}`,

      'arch-review': `## Architecture Review: ${topic}

### Architecture Overview

| Aspect | Current State | Target State | Gap |
|--------|---------------|--------------|-----|
| Pattern | Monolith + Services | Microservices | Medium |
| Deployment | Manual | GitOps/IaC | High |
| Observability | Basic | Full stack | Medium |
| Security | Perimeter | Zero Trust | High |
| Resilience | Active-Passive | Active-Active | Medium |

### Component Analysis

#### Application Layer

| Component | Technology | Health | Scalability | Recommendation |
|-----------|------------|--------|-------------|----------------|
| API Gateway | Kong | ✅ Good | ✅ High | Maintain |
| Auth Service | Custom | ⚠️ Fair | ⚠️ Medium | Migrate to OAuth2/OIDC |
| Core API | Node.js | ✅ Good | ✅ High | Add rate limiting |
| Legacy Module | .NET Framework | ❌ Poor | ❌ Low | Modernize |

#### Data Layer

| Component | Technology | Health | Concerns |
|-----------|------------|--------|----------|
| Primary DB | PostgreSQL | ✅ Good | Connection pooling |
| Cache | Redis | ✅ Good | Cluster mode needed |
| Search | Elasticsearch | ⚠️ Fair | Version upgrade needed |
| Queue | RabbitMQ | ✅ Good | HA configuration |

### Well-Architected Review

#### Reliability
| Criterion | Score | Notes |
|-----------|-------|-------|
| Fault tolerance | 3/5 | Single points of failure exist |
| Disaster recovery | 2/5 | RPO/RTO not well defined |
| Monitoring | 3/5 | Gaps in alerting |
| Auto-healing | 2/5 | Manual intervention required |

#### Security
| Criterion | Score | Notes |
|-----------|-------|-------|
| Identity & Access | 3/5 | Needs centralization |
| Data protection | 4/5 | Encryption at rest/transit |
| Network security | 3/5 | Segmentation needed |
| Compliance | 4/5 | SOC2 compliant |

#### Performance
| Criterion | Score | Notes |
|-----------|-------|-------|
| Response time | 4/5 | P99 < 500ms |
| Scalability | 3/5 | Manual scaling |
| Caching | 4/5 | Well implemented |
| Database | 3/5 | Query optimization needed |

#### Cost Optimization
| Criterion | Score | Notes |
|-----------|-------|-------|
| Right-sizing | 2/5 | Over-provisioned |
| Utilization | 3/5 | 40% average |
| Reserved capacity | 2/5 | No commitments |
| Waste reduction | 3/5 | Orphaned resources |

### Key Recommendations

| Priority | Recommendation | Impact | Effort |
|----------|----------------|--------|--------|
| 1 | Implement IaC (Terraform) | High | Medium |
| 2 | Modernize legacy module | High | High |
| 3 | Add auto-scaling | High | Low |
| 4 | Implement zero trust | Medium | High |
| 5 | Upgrade Elasticsearch | Medium | Medium |

### Architecture Target State

\`\`\`
┌─────────────────────────────────────────────────┐
│                  CDN / WAF                       │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│            API Gateway (Kong)                    │
│         Rate Limiting │ Auth │ Routing           │
└─────────────────────┬───────────────────────────┘
                      │
    ┌─────────────────┼─────────────────┐
    │                 │                 │
┌───▼───┐       ┌─────▼─────┐      ┌───▼───┐
│Service│       │ Service   │      │Service│
│   A   │       │    B      │      │   C   │
└───┬───┘       └─────┬─────┘      └───┬───┘
    │                 │                 │
    └────────┬────────┴────────┬───────┘
             │                 │
      ┌──────▼──────┐   ┌──────▼──────┐
      │ PostgreSQL  │   │    Redis    │
      │  (Primary)  │   │  (Cluster)  │
      └─────────────┘   └─────────────┘
\`\`\`

${context ? `\n**Review Context:** ${context}` : ''}`,

      migration: `## Cloud Migration Assessment: ${topic}

### Migration Scope

| Item | Count | Complexity |
|------|-------|------------|
| Applications | 25 | Mixed |
| Databases | 8 | High |
| Servers | 45 | Medium |
| Storage (TB) | 50 | Medium |
| Integrations | 30 | High |

### Application Portfolio Analysis

| Application | Strategy | Priority | Effort | Risk |
|-------------|----------|----------|--------|------|
| CRM System | Rehost | High | Low | Low |
| ERP Core | Replatform | High | High | Medium |
| Legacy Portal | Refactor | Medium | High | High |
| Analytics | Rehost | Medium | Low | Low |
| Custom Apps (15) | Rehost | Low | Medium | Low |
| End-of-life (5) | Retire | Low | - | - |

### 6R Strategy Distribution

| Strategy | Count | Description |
|----------|-------|-------------|
| Rehost (Lift & Shift) | 15 | Move as-is to cloud |
| Replatform | 5 | Minor optimizations |
| Refactor | 3 | Significant changes |
| Repurchase | 1 | Replace with SaaS |
| Retire | 5 | Decommission |
| Retain | 1 | Keep on-premises |

### Readiness Assessment

#### Technical Readiness
| Criterion | Score | Status |
|-----------|-------|--------|
| Application compatibility | 75% | ✅ Ready |
| Database compatibility | 80% | ✅ Ready |
| Network requirements | 60% | ⚠️ Work needed |
| Security compliance | 70% | ⚠️ Work needed |
| Skills/Training | 50% | ⚠️ Work needed |

#### Organizational Readiness
| Criterion | Score | Status |
|-----------|-------|--------|
| Executive sponsorship | 90% | ✅ Ready |
| Change management | 60% | ⚠️ Work needed |
| Operations team | 55% | ⚠️ Work needed |
| Budget approval | 80% | ✅ Ready |

### Migration Phases

#### Phase 1: Foundation (Months 1-2)
- Landing zone setup
- Network connectivity
- Identity integration
- Security baseline

#### Phase 2: Pilot (Months 3-4)
- Migrate 3 low-risk applications
- Validate migration playbooks
- Training and documentation

#### Phase 3: Core Migration (Months 5-9)
- Wave 1: Development environments
- Wave 2: Non-critical production
- Wave 3: Critical workloads
- Wave 4: Databases

#### Phase 4: Optimization (Months 10-12)
- Cost optimization
- Performance tuning
- Decommission legacy
- Operations handover

### Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Data migration errors | Medium | High | Validation scripts |
| Extended downtime | Low | High | Parallel running |
| Performance issues | Medium | Medium | Load testing |
| Security gaps | Low | High | Security review |
| Budget overrun | Medium | Medium | Buffer 20% |

### Cost Analysis

| Category | On-Premises | Cloud (Y1) | Cloud (Y2+) |
|----------|-------------|------------|-------------|
| Infrastructure | $800K | $600K | $500K |
| Licensing | $300K | $200K | $200K |
| Operations | $400K | $300K | $250K |
| **Total** | **$1.5M** | **$1.1M** | **$950K** |

**Migration Investment:** $500K (one-time)
**Break-even:** Month 18
**5-Year Savings:** $2.2M

### Success Criteria

| Metric | Target |
|--------|--------|
| Migration completion | 95% of applications |
| Downtime per app | < 4 hours |
| Post-migration issues | < 5% |
| Cost reduction | 30% by Y2 |
| Performance | No degradation |

${context ? `\n**Migration Context:** ${context}` : ''}`,
    };

    return responses[mode] || responses['cost-opt'];
  }
}
