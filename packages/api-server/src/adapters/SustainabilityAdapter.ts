import { BaseAdapter, type AdapterContext } from './BaseAdapter.js';
import type { AgentInfo, StreamEvent } from '../types.js';

export class SustainabilityAdapter extends BaseAdapter {
  readonly agentInfo: AgentInfo = {
    id: 'sustainability-agent',
    name: 'Sustainability',
    description: 'Carbon footprint analysis, green IT recommendations, ESG reports, and energy optimization',
    category: 'ESG',
    modes: [
      { id: 'carbon-footprint', label: 'Carbon Footprint', description: 'Analyze carbon footprint' },
      { id: 'green-it', label: 'Green IT', description: 'Green IT recommendations' },
      { id: 'sustainability-report', label: 'Report', description: 'Generate sustainability reports' },
      { id: 'energy-opt', label: 'Energy Optimization', description: 'Optimize energy usage' },
      { id: 'esg', label: 'ESG Analysis', description: 'ESG compliance analysis' },
    ],
  };

  async processMessage(
    context: AdapterContext,
    onEvent: (event: StreamEvent) => void
  ): Promise<string> {
    const { topic, mode, additionalContext } = context;

    this.emitStage(onEvent, 0, 'Data Analysis', 'running');
    this.emitThinking(onEvent, `Analyzing sustainability data for ${mode}...\n`);
    await this.delay(600);
    this.emitStage(onEvent, 0, 'Data Analysis', 'completed');

    this.emitStage(onEvent, 1, 'Report Generation', 'running');

    const response = this.generateResponse(mode, topic, additionalContext);
    await this.simulateStreaming(response, onEvent);

    this.emitStage(onEvent, 1, 'Report Generation', 'completed');
    this.emitDone(onEvent);

    return response;
  }

  private generateResponse(mode: string, topic: string, context?: string): string {
    const responses: Record<string, string> = {
      'carbon-footprint': `## Carbon Footprint Analysis: ${topic}

### Executive Summary

| Metric | Value | YoY Change |
|--------|-------|------------|
| Total Emissions | 12,450 tCO2e | -8% |
| Scope 1 | 2,100 tCO2e | -5% |
| Scope 2 | 4,850 tCO2e | -12% |
| Scope 3 | 5,500 tCO2e | -6% |

### Emissions Breakdown

#### Scope 1: Direct Emissions (17%)
| Source | tCO2e | % of Total |
|--------|-------|------------|
| Fleet vehicles | 1,200 | 10% |
| On-site generators | 600 | 5% |
| Refrigerants | 300 | 2% |

#### Scope 2: Indirect Emissions (39%)
| Source | tCO2e | % of Total |
|--------|-------|------------|
| Electricity | 3,800 | 31% |
| Heating/Cooling | 850 | 7% |
| Steam | 200 | 2% |

#### Scope 3: Value Chain (44%)
| Source | tCO2e | % of Total |
|--------|-------|------------|
| Business travel | 1,800 | 14% |
| Employee commuting | 1,500 | 12% |
| Purchased goods | 1,200 | 10% |
| Waste | 500 | 4% |
| Other | 500 | 4% |

### Reduction Opportunities

| Initiative | Potential Reduction | Investment | Payback |
|------------|--------------------|-----------:|---------|
| Renewable energy | 2,500 tCO2e | $150K | 3 years |
| Fleet electrification | 800 tCO2e | $500K | 5 years |
| Remote work policy | 1,000 tCO2e | $20K | <1 year |
| Energy efficiency | 600 tCO2e | $80K | 2 years |

### Carbon Intensity Metrics

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| tCO2e/Employee | 4.2 | 3.5 | ⚠️ |
| tCO2e/Revenue ($M) | 12.5 | 10.0 | ⚠️ |
| tCO2e/Sq ft | 0.05 | 0.04 | ✅ |

### Recommendations

1. **Immediate (0-6 months):** Implement remote work policy
2. **Short-term (6-12 months):** Procure renewable energy
3. **Medium-term (1-2 years):** Begin fleet electrification
4. **Long-term (2-5 years):** Achieve carbon neutrality

${context ? `\n**Analysis Context:** ${context}` : ''}`,

      'green-it': `## Green IT Recommendations: ${topic}

### Current IT Environmental Impact

| Category | Current | Industry Avg | Gap |
|----------|---------|--------------|-----|
| Data Center PUE | 1.8 | 1.4 | -0.4 |
| Server Utilization | 35% | 60% | -25% |
| Device Lifecycle | 3 years | 5 years | -2 years |
| E-waste Recycled | 60% | 85% | -25% |

### Recommendations

#### 1. Data Center Optimization 🏢
**Priority: High | Investment: $200K | Savings: $80K/year**

- Implement hot/cold aisle containment
- Deploy AI-based cooling optimization
- Consolidate underutilized servers
- Target PUE: 1.4

#### 2. Cloud Migration Strategy ☁️
**Priority: High | Investment: $500K | Savings: $150K/year**

| Workload | Current | Recommended | CO2 Reduction |
|----------|---------|-------------|---------------|
| Development | On-prem | Cloud | 40% |
| Testing | On-prem | Cloud | 50% |
| Production | Hybrid | Cloud-first | 30% |

#### 3. Device Lifecycle Management 💻
**Priority: Medium | Investment: $50K | Savings: $100K/year**

- Extend laptop lifecycle to 5 years
- Implement device refurbishment program
- Partner with certified e-waste recyclers
- Deploy power management policies

#### 4. Virtual Meeting Infrastructure 🎥
**Priority: Medium | Investment: $100K | Savings: 500 tCO2e/year**

- Enhance video conferencing capabilities
- Reduce business travel by 30%
- Implement virtual event platform

#### 5. Green Software Practices 💚
**Priority: Low | Investment: $30K | Impact: 10% efficiency**

- Code efficiency reviews
- Optimize database queries
- Implement dark mode defaults
- Reduce data transfer overhead

### Implementation Roadmap

| Phase | Timeline | Focus | Investment |
|-------|----------|-------|------------|
| 1 | Q1-Q2 | Quick wins | $100K |
| 2 | Q3-Q4 | Cloud migration | $400K |
| 3 | Y2 | Full optimization | $380K |

### Projected Impact

- **Energy reduction:** 35%
- **Carbon reduction:** 2,000 tCO2e/year
- **Cost savings:** $330K/year
- **ROI:** 3-year payback

${context ? `\n**IT Context:** ${context}` : ''}`,

      'sustainability-report': `## Sustainability Report: ${topic}

### About This Report
**Reporting Period:** FY 2024
**Framework:** GRI Standards, SASB, TCFD
**Assurance:** Limited third-party assurance

---

### Message from Leadership

Our commitment to sustainability continues to drive meaningful progress across environmental, social, and governance dimensions. This year marks significant achievements in our journey toward a more sustainable future.

---

### Sustainability Highlights

| Area | Achievement | YoY Change |
|------|-------------|------------|
| Carbon Emissions | 12,450 tCO2e | -8% |
| Renewable Energy | 45% | +15% |
| Waste Diversion | 78% | +5% |
| Water Usage | -12% | Improved |
| Supplier Sustainability | 65% assessed | +20% |

---

### Environmental Performance

#### Climate Action
- **Science-Based Targets:** Committed to 1.5°C pathway
- **Net Zero:** Target year 2040
- **Renewable Energy:** 45% of electricity (target: 100% by 2030)

#### Resource Efficiency
| Resource | Metric | Progress |
|----------|--------|----------|
| Energy | kWh/employee | -10% |
| Water | gallons/sq ft | -12% |
| Paper | reams/employee | -25% |

#### Waste Management
- Zero waste to landfill target: 90% achieved
- E-waste recycling: 100%
- Circular economy initiatives: 3 pilots launched

---

### Social Performance

#### Workforce
| Metric | FY24 | FY23 |
|--------|------|------|
| Employee Satisfaction | 78% | 72% |
| Gender Diversity | 42% women | 38% |
| Training Hours/Employee | 45 | 38 |
| Turnover Rate | 12% | 15% |

#### Community Impact
- Volunteer hours: 15,000
- Charitable giving: $2.5M
- STEM education: 500 students reached

---

### Governance

#### Board Oversight
- ESG Committee meets quarterly
- Sustainability KPIs linked to executive compensation
- Regular stakeholder engagement

#### Ethics & Compliance
- Zero material compliance breaches
- 100% employees trained on code of conduct
- Whistleblower hotline: 12 reports, 100% resolved

---

### Goals & Targets

| Goal | Target | Timeline | Status |
|------|--------|----------|--------|
| Carbon neutral (Scope 1&2) | 100% | 2030 | On track |
| Net zero (all scopes) | 100% | 2040 | On track |
| Renewable energy | 100% | 2030 | 45% done |
| Zero waste | 95% | 2028 | 78% done |
| Gender parity (leadership) | 50% | 2030 | 35% done |

${context ? `\n**Report Notes:** ${context}` : ''}`,

      'energy-opt': `## Energy Optimization Plan: ${topic}

### Current Energy Profile

| Metric | Value | Benchmark | Status |
|--------|-------|-----------|--------|
| Total Consumption | 8.5 GWh/year | - | Baseline |
| Cost | $1.2M/year | - | - |
| Carbon Intensity | 0.45 kgCO2/kWh | 0.35 | ⚠️ |
| Peak Demand | 2.1 MW | - | - |

### Consumption Breakdown

| Category | % of Total | Annual kWh | Cost |
|----------|------------|------------|------|
| HVAC | 45% | 3,825,000 | $540K |
| Lighting | 20% | 1,700,000 | $240K |
| IT/Data Center | 25% | 2,125,000 | $300K |
| Other | 10% | 850,000 | $120K |

### Optimization Opportunities

#### Immediate Actions (0-3 months)
| Action | Investment | Annual Savings | Payback |
|--------|------------|----------------|---------|
| LED retrofit | $50K | $45K | 1.1 years |
| Occupancy sensors | $25K | $20K | 1.3 years |
| HVAC scheduling | $10K | $30K | 4 months |
| Power management | $5K | $15K | 4 months |

#### Short-term (3-12 months)
| Action | Investment | Annual Savings | Payback |
|--------|------------|----------------|---------|
| BMS upgrade | $150K | $80K | 1.9 years |
| VFD motors | $100K | $50K | 2 years |
| Insulation | $75K | $35K | 2.1 years |
| Solar PV (500kW) | $400K | $100K | 4 years |

#### Long-term (1-3 years)
| Action | Investment | Annual Savings | Payback |
|--------|------------|----------------|---------|
| Battery storage | $300K | $60K | 5 years |
| Geothermal HVAC | $500K | $120K | 4.2 years |
| Full electrification | $250K | $50K | 5 years |

### Implementation Plan

**Phase 1: Quick Wins (Q1)**
- Deploy occupancy sensors
- Implement power management
- Optimize HVAC schedules
- Investment: $40K | Savings: $65K

**Phase 2: Infrastructure (Q2-Q3)**
- Complete LED retrofit
- Install BMS upgrade
- Begin solar installation
- Investment: $600K | Savings: $225K

**Phase 3: Advanced Systems (Y2)**
- Battery storage deployment
- VFD motor upgrades
- Continuous optimization
- Investment: $475K | Savings: $170K

### Projected Results

| Year | Investment | Savings | Net | Cumulative |
|------|------------|---------|-----|------------|
| 1 | $640K | $290K | -$350K | -$350K |
| 2 | $475K | $460K | -$15K | -$365K |
| 3 | $0 | $460K | $460K | $95K |
| 4 | $0 | $460K | $460K | $555K |
| 5 | $0 | $460K | $460K | $1,015K |

### Energy Reduction Target

🎯 **Goal:** 30% reduction in energy consumption by 2027

Current: 8.5 GWh → Target: 5.95 GWh

${context ? `\n**Optimization Context:** ${context}` : ''}`,

      esg: `## ESG Analysis: ${topic}

### ESG Score Overview

| Dimension | Score | Rating | Trend |
|-----------|-------|--------|-------|
| **Environmental** | 72/100 | B+ | ↗️ |
| **Social** | 68/100 | B | → |
| **Governance** | 78/100 | A- | ↗️ |
| **Overall ESG** | 73/100 | B+ | ↗️ |

### Environmental Assessment

#### Strengths ✅
- Committed to Science-Based Targets
- 45% renewable energy adoption
- Active climate disclosure (CDP B rating)

#### Improvement Areas ⚠️
- Scope 3 emissions not fully measured
- Biodiversity strategy lacking
- Water stress assessment needed

#### Recommendations
1. Complete Scope 3 inventory
2. Develop biodiversity policy
3. Conduct water risk assessment

### Social Assessment

#### Strengths ✅
- Strong health & safety record (0.5 TRIR)
- Diversity initiatives showing progress
- Employee engagement above industry average

#### Improvement Areas ⚠️
- Supply chain labor audits limited
- Living wage commitment not universal
- Community investment below peers

#### Recommendations
1. Expand supplier audits to tier 2
2. Implement living wage policy
3. Increase community investment to 1% of profit

### Governance Assessment

#### Strengths ✅
- Independent board majority (75%)
- ESG-linked executive compensation
- Strong ethics program

#### Improvement Areas ⚠️
- Board diversity could improve
- Climate competence gaps
- Lobbying disclosure limited

#### Recommendations
1. Add climate expertise to board
2. Enhance political spending disclosure
3. Target 40% board gender diversity

### Peer Comparison

| Company | E Score | S Score | G Score | Overall |
|---------|---------|---------|---------|---------|
| **Our Company** | 72 | 68 | 78 | 73 |
| Peer 1 | 78 | 72 | 75 | 75 |
| Peer 2 | 65 | 70 | 80 | 72 |
| Peer 3 | 70 | 65 | 72 | 69 |
| Industry Avg | 68 | 67 | 74 | 70 |

### Regulatory Compliance

| Regulation | Status | Gap |
|------------|--------|-----|
| CSRD (EU) | Preparing | Moderate |
| SEC Climate | Monitoring | Low |
| ISSB Standards | Aligning | Moderate |
| TCFD | Compliant | None |

### Action Priority Matrix

| Priority | Action | Impact | Effort |
|----------|--------|--------|--------|
| 1 | Scope 3 emissions | High | High |
| 2 | Supply chain audits | High | Medium |
| 3 | Board diversity | Medium | Low |
| 4 | Water assessment | Medium | Medium |
| 5 | Community investment | Medium | Low |

${context ? `\n**ESG Context:** ${context}` : ''}`,
    };

    return responses[mode] || responses['carbon-footprint'];
  }
}
