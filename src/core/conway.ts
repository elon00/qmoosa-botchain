/**
 * QMOOSA BOT CHAIN — Deterministic Conway Automaton & State Engine
 * Implements standard B3/S23 Game of Life rules and a 10-state deterministic transaction automaton.
 */

export class ConwayGrid {
  private width: number;
  private height: number;
  private grid: Uint8Array;

  constructor(width: number, height: number, initialCells?: Array<[number, number]>) {
    if (width <= 0 || height <= 0) {
      throw new Error('Grid dimensions must be positive integers');
    }
    this.width = width;
    this.height = height;
    this.grid = new Uint8Array(width * height);

    if (initialCells) {
      for (const [x, y] of initialCells) {
        this.setCell(x, y, 1);
      }
    }
  }

  getCell(x: number, y: number): number {
    const wx = (x % this.width + this.width) % this.width;
    const wy = (y % this.height + this.height) % this.height;
    return this.grid[wy * this.width + wx]!;
  }

  setCell(x: number, y: number, state: number): void {
    const wx = (x % this.width + this.width) % this.width;
    const wy = (y % this.height + this.height) % this.height;
    this.grid[wy * this.width + wx] = state ? 1 : 0;
  }

  countNeighbors(x: number, y: number): number {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        count += this.getCell(x + dx, y + dy);
      }
    }
    return count;
  }

  /**
   * Standard Conway B3/S23 step
   * Birth: Dead cell with exactly 3 live neighbors becomes live (B3)
   * Survival: Live cell with 2 or 3 live neighbors stays live (S23)
   * All other live cells die; all other dead cells stay dead.
   */
  step(): ConwayGrid {
    const next = new ConwayGrid(this.width, this.height);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const live = this.getCell(x, y) === 1;
        const neighbors = this.countNeighbors(x, y);

        if (live && (neighbors === 2 || neighbors === 3)) {
          next.setCell(x, y, 1);
        } else if (!live && neighbors === 3) {
          next.setCell(x, y, 1);
        } else {
          next.setCell(x, y, 0);
        }
      }
    }
    return next;
  }

  getPopulation(): number {
    let sum = 0;
    for (let i = 0; i < this.grid.length; i++) {
      sum += this.grid[i]!;
    }
    return sum;
  }

  getSnapshot(): number[][] {
    const snapshot: number[][] = [];
    for (let y = 0; y < this.height; y++) {
      const row: number[] = [];
      for (let x = 0; x < this.width; x++) {
        row.push(this.getCell(x, y));
      }
      snapshot.push(row);
    }
    return snapshot;
  }
}

/**
 * 10-State Deterministic Transaction Automaton
 */
export type AutomatonState =
  | 'CREATED'
  | 'MEMPOOL'
  | 'MINED'
  | 'CONFIRMED'
  | 'SETTLED'
  | 'PQC_SIGNED'
  | 'RECONCILED'
  | 'FINALIZED'
  | 'ARCHIVED'
  | 'CLOSED';

export const VALID_TRANSITIONS: Record<AutomatonState, AutomatonState[]> = {
  CREATED: ['MEMPOOL', 'CLOSED'],
  MEMPOOL: ['MINED', 'CLOSED'],
  MINED: ['CONFIRMED', 'CLOSED'],
  CONFIRMED: ['SETTLED', 'CLOSED'],
  SETTLED: ['PQC_SIGNED', 'CLOSED'],
  PQC_SIGNED: ['RECONCILED'],
  RECONCILED: ['FINALIZED'],
  FINALIZED: ['ARCHIVED'],
  ARCHIVED: ['CLOSED'],
  CLOSED: [],
};

export class TransactionAutomaton {
  private currentState: AutomatonState;
  private history: Array<{ state: AutomatonState; timestamp: string; note?: string }>;

  constructor(initialState: AutomatonState = 'CREATED') {
    this.currentState = initialState;
    this.history = [{ state: initialState, timestamp: new Date().toISOString() }];
  }

  getState(): AutomatonState {
    return this.currentState;
  }

  getHistory(): Array<{ state: AutomatonState; timestamp: string; note?: string }> {
    return [...this.history];
  }

  transitionTo(nextState: AutomatonState, note?: string): void {
    const allowed = VALID_TRANSITIONS[this.currentState];
    if (!allowed.includes(nextState)) {
      throw new Error(
        `Invalid automaton transition: Cannot transition from ${this.currentState} to ${nextState}`
      );
    }
    this.currentState = nextState;
    this.history.push({ state: nextState, timestamp: new Date().toISOString(), note });
  }

  isTerminal(): boolean {
    return this.currentState === 'CLOSED';
  }
}
