import {
  BaseAdapter,
  HRAdapter,
  ITOpsAdapter,
  MarketingAdapter,
  RecruitmentAdapter,
  PresalesAdapter,
  LearningDevAdapter,
  LinkedInAdapter,
  SustainabilityAdapter,
  CloudOpsAdapter,
} from '../adapters/index.js';
import type { AgentInfo } from '../types.js';

class AgentService {
  private adapters: Map<string, BaseAdapter> = new Map();

  constructor() {
    this.registerAdapters();
  }

  private registerAdapters(): void {
    const adapterClasses = [
      HRAdapter,
      ITOpsAdapter,
      MarketingAdapter,
      RecruitmentAdapter,
      PresalesAdapter,
      LearningDevAdapter,
      LinkedInAdapter,
      SustainabilityAdapter,
      CloudOpsAdapter,
    ];

    for (const AdapterClass of adapterClasses) {
      const adapter = new AdapterClass();
      this.adapters.set(adapter.agentInfo.id, adapter);
    }
  }

  getAll(): AgentInfo[] {
    return Array.from(this.adapters.values()).map((adapter) => adapter.agentInfo);
  }

  getById(id: string): AgentInfo | undefined {
    return this.adapters.get(id)?.agentInfo;
  }

  getAdapter(id: string): BaseAdapter | undefined {
    return this.adapters.get(id);
  }

  hasAgent(id: string): boolean {
    return this.adapters.has(id);
  }
}

export const agentService = new AgentService();
