import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ConwayGrid, TransactionAutomaton } from '../../src/core/conway.js';

describe('Lane 1: Conway Automaton Engine & 10-State Automaton', () => {
  it('correctly oscillates a blinker with period 2', () => {
    // Horizontal blinker at (2,1), (2,2), (2,3)
    const initial: Array<[number, number]> = [
      [2, 1],
      [2, 2],
      [2, 3],
    ];
    let grid = new ConwayGrid(6, 6, initial);

    assert.equal(grid.getPopulation(), 3);
    assert.equal(grid.getCell(2, 2), 1);

    // Step 1: should become vertical
    grid = grid.step();
    assert.equal(grid.getPopulation(), 3);
    assert.equal(grid.getCell(1, 2), 1);
    assert.equal(grid.getCell(2, 2), 1);
    assert.equal(grid.getCell(3, 2), 1);
    assert.equal(grid.getCell(2, 1), 0);
    assert.equal(grid.getCell(2, 3), 0);

    // Step 2: returns to horizontal
    grid = grid.step();
    assert.equal(grid.getPopulation(), 3);
    assert.equal(grid.getCell(2, 1), 1);
    assert.equal(grid.getCell(2, 2), 1);
    assert.equal(grid.getCell(2, 3), 1);
  });

  it('rejects invalid board dimensions', () => {
    assert.throws(() => new ConwayGrid(0, 10), /Grid dimensions must be positive integers/);
    assert.throws(() => new ConwayGrid(10, -5), /Grid dimensions must be positive integers/);
  });

  it('executes valid 10-state deterministic transaction automaton transitions', () => {
    const automaton = new TransactionAutomaton('CREATED');
    assert.equal(automaton.getState(), 'CREATED');

    automaton.transitionTo('MEMPOOL');
    assert.equal(automaton.getState(), 'MEMPOOL');

    automaton.transitionTo('MINED');
    assert.equal(automaton.getState(), 'MINED');

    automaton.transitionTo('CONFIRMED');
    assert.equal(automaton.getState(), 'CONFIRMED');

    automaton.transitionTo('SETTLED');
    assert.equal(automaton.getState(), 'SETTLED');

    automaton.transitionTo('PQC_SIGNED');
    assert.equal(automaton.getState(), 'PQC_SIGNED');

    automaton.transitionTo('RECONCILED');
    assert.equal(automaton.getState(), 'RECONCILED');

    automaton.transitionTo('FINALIZED');
    assert.equal(automaton.getState(), 'FINALIZED');

    automaton.transitionTo('ARCHIVED');
    assert.equal(automaton.getState(), 'ARCHIVED');

    automaton.transitionTo('CLOSED');
    assert.equal(automaton.getState(), 'CLOSED');
    assert.equal(automaton.isTerminal(), true);
    assert.equal(automaton.getHistory().length, 10);
  });

  it('rejects illegal automaton state transitions', () => {
    const automaton = new TransactionAutomaton('CREATED');
    assert.throws(
      () => automaton.transitionTo('FINALIZED'),
      /Invalid automaton transition: Cannot transition from CREATED to FINALIZED/
    );
  });
});
