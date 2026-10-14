/**
 * QMOOSA BOT CHAIN — Agent Policy Engine & Spending Controller
 * Enforces per-request limits ($0.010 QBOT) and rolling 24h daily budgets ($1.000 QBOT).
 * Also performs prompt sanitization to prevent jailbreak attacks.
 */

export interface AgentPolicyConfig {
  dailyBudgetCents: number; // in cents of QBOT, e.g. 100 = 1.00 QBOT
  perRequestMaxCents: number; // e.g. 1 = 0.01 QBOT
}

export interface SpendRecord {
  timestamp: number;
  amountCents: number;
  serviceId: string;
}

export class AgentPolicyEngine {
  private dailyLimitCents: number;
  private perRequestLimitCents: number;
  private spendingLedger: Map<string, SpendRecord[]> = new Map();

  // Known prompt injection patterns
  private promptInjectionPatterns: RegExp[] = [
    /ignore (all )?previous instructions/i,
    /system override/i,
    /bypass safety/i,
    /reveal your system prompt/i,
    /disregard constraints/i,
    /unlimited budget/i,
  ];

  constructor(dailyBudgetQbot = 1.0, perRequestMaxQbot = 0.01) {
    this.dailyLimitCents = Math.round(dailyBudgetQbot * 100);
    this.perRequestLimitCents = Math.round(perRequestMaxQbot * 100);
  }

  /**
   * Check if prompt contains injection attacks
   */
  sanitizePrompt(prompt: string): { isSafe: boolean; flaggedPattern?: string } {
    for (const pattern of this.promptInjectionPatterns) {
      if (pattern.test(prompt)) {
        return { isSafe: false, flaggedPattern: pattern.toString() };
      }
    }
    return { isSafe: true };
  }

  /**
   * Calculate total spent by an agent in the rolling 24 hours
   */
  get24hSpend(agentId: string): number {
    const records = this.spendingLedger.get(agentId) ?? [];
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return records
      .filter((r) => r.timestamp >= cutoff)
      .reduce((sum, r) => sum + r.amountCents, 0);
  }

  /**
   * Authorize a payment request within safety constraints
   */
  authorizeSpend(
    agentId: string,
    amountQbot: number,
    serviceId: string
  ): { authorized: boolean; reason?: string; remainingBudgetQbot: number } {
    const amountCents = Math.round(amountQbot * 100);

    // Rule 1: Per-request ceiling
    if (amountCents > this.perRequestLimitCents) {
      return {
        authorized: false,
        reason: `Request amount ${amountQbot} QBOT exceeds per-request limit (${this.perRequestLimitCents / 100} QBOT)`,
        remainingBudgetQbot: (this.dailyLimitCents - this.get24hSpend(agentId)) / 100,
      };
    }

    // Rule 2: 24h rolling budget
    const currentSpent = this.get24hSpend(agentId);
    if (currentSpent + amountCents > this.dailyLimitCents) {
      return {
        authorized: false,
        reason: `Request exceeds 24h daily budget of ${this.dailyLimitCents / 100} QBOT. Currently spent: ${currentSpent / 100} QBOT`,
        remainingBudgetQbot: Math.max(0, (this.dailyLimitCents - currentSpent) / 100),
      };
    }

    // Commit spending
    if (!this.spendingLedger.has(agentId)) {
      this.spendingLedger.set(agentId, []);
    }
    this.spendingLedger.get(agentId)!.push({
      timestamp: Date.now(),
      amountCents,
      serviceId,
    });

    const remaining = (this.dailyLimitCents - (currentSpent + amountCents)) / 100;
    return {
      authorized: true,
      remainingBudgetQbot: remaining,
    };
  }

  getSpendingHistory(agentId: string): SpendRecord[] {
    return [...(this.spendingLedger.get(agentId) ?? [])];
  }
}
