/**
 * QMOOSA BOT CHAIN — QBOT Strategic Tokenomics Model & Invariant Engine
 * Enforces ERC-20 rules, role authority, and the 2% annual inflation ceiling.
 */

export const QBOT_TOKEN_CONFIG = {
  name: 'Qmoosa BotChain Utility Token',
  symbol: 'QBOT',
  decimals: 18,
  initialSupply: 1_000_000_000n * 10n ** 18n, // 1 Billion QBOT
  maxAnnualInflationBps: 200n, // 2.00%
  bpsDenominator: 10_000n,
  inflationPeriodSeconds: 365n * 24n * 3600n,
};

export interface TokenomicsState {
  totalSupply: bigint;
  currentPeriodStart: bigint;
  periodStartSupply: bigint;
  mintedInCurrentPeriod: bigint;
  paused: boolean;
  balances: Map<string, bigint>;
  allowances: Map<string, Map<string, bigint>>;
  roles: Map<string, Set<string>>;
}

export class QBOTTokenModel {
  private state: TokenomicsState;

  constructor(initialAdmin: string, initialTreasury: string) {
    this.state = {
      totalSupply: 0n,
      currentPeriodStart: BigInt(Math.floor(Date.now() / 1000)),
      periodStartSupply: QBOT_TOKEN_CONFIG.initialSupply,
      mintedInCurrentPeriod: 0n,
      paused: false,
      balances: new Map(),
      allowances: new Map(),
      roles: new Map([
        ['DEFAULT_ADMIN_ROLE', new Set([initialAdmin.toLowerCase()])],
        ['MINTER_ROLE', new Set([initialAdmin.toLowerCase()])],
        ['PAUSER_ROLE', new Set([initialAdmin.toLowerCase()])],
      ]),
    };

    // Mint initial supply
    this.mintInternal(initialTreasury.toLowerCase(), QBOT_TOKEN_CONFIG.initialSupply);
  }

  hasRole(role: string, account: string): boolean {
    return this.state.roles.get(role)?.has(account.toLowerCase()) ?? false;
  }

  grantRole(caller: string, role: string, account: string): void {
    if (!this.hasRole('DEFAULT_ADMIN_ROLE', caller)) {
      throw new Error('QBOT: caller lacks required role');
    }
    if (!this.state.roles.has(role)) {
      this.state.roles.set(role, new Set());
    }
    this.state.roles.get(role)!.add(account.toLowerCase());
  }

  revokeRole(caller: string, role: string, account: string): void {
    if (!this.hasRole('DEFAULT_ADMIN_ROLE', caller)) {
      throw new Error('QBOT: caller lacks required role');
    }
    this.state.roles.get(role)?.delete(account.toLowerCase());
  }

  maxMintableInCurrentPeriod(currentTimestamp: bigint): bigint {
    const baseSupply =
      currentTimestamp >= this.state.currentPeriodStart + QBOT_TOKEN_CONFIG.inflationPeriodSeconds
        ? this.state.totalSupply
        : this.state.periodStartSupply;

    const maxAnnual =
      (baseSupply * QBOT_TOKEN_CONFIG.maxAnnualInflationBps) /
      QBOT_TOKEN_CONFIG.bpsDenominator;

    if (currentTimestamp >= this.state.currentPeriodStart + QBOT_TOKEN_CONFIG.inflationPeriodSeconds) {
      return maxAnnual;
    }
    if (this.state.mintedInCurrentPeriod >= maxAnnual) {
      return 0n;
    }
    return maxAnnual - this.state.mintedInCurrentPeriod;
  }

  mintInflation(caller: string, to: string, amount: bigint, currentTimestamp: bigint): void {
    if (this.state.paused) {
      throw new Error('QBOT: token transfers are paused');
    }
    if (!this.hasRole('MINTER_ROLE', caller)) {
      throw new Error('QBOT: caller lacks required role');
    }
    if (to === '0x0000000000000000000000000000000000000000') {
      throw new Error('QBOT: mint to zero address');
    }

    // Roll over if 365 days elapsed
    if (currentTimestamp >= this.state.currentPeriodStart + QBOT_TOKEN_CONFIG.inflationPeriodSeconds) {
      this.state.currentPeriodStart = currentTimestamp;
      this.state.periodStartSupply = this.state.totalSupply;
      this.state.mintedInCurrentPeriod = 0n;
    }

    const maxAllowed =
      (this.state.periodStartSupply * QBOT_TOKEN_CONFIG.maxAnnualInflationBps) /
      QBOT_TOKEN_CONFIG.bpsDenominator;

    if (this.state.mintedInCurrentPeriod + amount > maxAllowed) {
      throw new Error('QBOT: mint amount exceeds 2% annual inflation ceiling');
    }

    this.state.mintedInCurrentPeriod += amount;
    this.mintInternal(to.toLowerCase(), amount);
  }

  pause(caller: string): void {
    if (!this.hasRole('PAUSER_ROLE', caller)) {
      throw new Error('QBOT: caller lacks required role');
    }
    this.state.paused = true;
  }

  unpause(caller: string): void {
    if (!this.hasRole('PAUSER_ROLE', caller)) {
      throw new Error('QBOT: caller lacks required role');
    }
    this.state.paused = false;
  }

  burn(from: string, amount: bigint): void {
    if (this.state.paused) {
      throw new Error('QBOT: token transfers are paused');
    }
    const currentBal = this.balanceOf(from);
    if (currentBal < amount) {
      throw new Error('QBOT: burn amount exceeds balance');
    }
    this.state.balances.set(from.toLowerCase(), currentBal - amount);
    this.state.totalSupply -= amount;
  }

  transfer(from: string, to: string, amount: bigint): boolean {
    if (this.state.paused) {
      throw new Error('QBOT: token transfers are paused');
    }
    const fromBal = this.balanceOf(from);
    if (fromBal < amount) {
      throw new Error('QBOT: transfer amount exceeds balance');
    }
    this.state.balances.set(from.toLowerCase(), fromBal - amount);
    const toBal = this.balanceOf(to);
    this.state.balances.set(to.toLowerCase(), toBal + amount);
    return true;
  }

  balanceOf(account: string): bigint {
    return this.state.balances.get(account.toLowerCase()) ?? 0n;
  }

  totalSupply(): bigint {
    return this.state.totalSupply;
  }

  isPaused(): boolean {
    return this.state.paused;
  }

  private mintInternal(account: string, amount: bigint): void {
    this.state.totalSupply += amount;
    const current = this.balanceOf(account);
    this.state.balances.set(account.toLowerCase(), current + amount);
  }
}
