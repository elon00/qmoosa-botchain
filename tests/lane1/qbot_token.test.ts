import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { QBOTTokenModel, QBOT_TOKEN_CONFIG } from '../../src/contracts/qbot.js';

describe('Lane 1: QBOT Strategic Tokenomics & ERC-20 Invariants', () => {
  const admin = '0x1111111111111111111111111111111111111111';
  const treasury = '0x2222222222222222222222222222222222222222';
  const user = '0x3333333333333333333333333333333333333333';

  it('initializes with exactly 1,000,000,000 QBOT in treasury', () => {
    const token = new QBOTTokenModel(admin, treasury);
    const expected = 1_000_000_000n * 10n ** 18n;
    assert.equal(token.totalSupply(), expected);
    assert.equal(token.balanceOf(treasury), expected);
    assert.equal(token.balanceOf(user), 0n);
  });

  it('permits minting within the 2% annual inflation ceiling', () => {
    const token = new QBOTTokenModel(admin, treasury);
    const now = BigInt(Math.floor(Date.now() / 1000));
    // 2% of 1B = 20M QBOT
    const maxAllowed = token.maxMintableInCurrentPeriod(now);
    assert.equal(maxAllowed, 20_000_000n * 10n ** 18n);

    // Mint 10M
    const mintAmount = 10_000_000n * 10n ** 18n;
    token.mintInflation(admin, user, mintAmount, now);
    assert.equal(token.balanceOf(user), mintAmount);
    assert.equal(token.maxMintableInCurrentPeriod(now), 10_000_000n * 10n ** 18n);
  });

  it('reverts if minting exceeds the 2% annual inflation ceiling', () => {
    const token = new QBOTTokenModel(admin, treasury);
    const now = BigInt(Math.floor(Date.now() / 1000));
    const excessAmount = 25_000_000n * 10n ** 18n; // 2.5%

    assert.throws(
      () => token.mintInflation(admin, user, excessAmount, now),
      /QBOT: mint amount exceeds 2% annual inflation ceiling/
    );
  });

  it('reverts if non-minter tries to mint', () => {
    const token = new QBOTTokenModel(admin, treasury);
    const now = BigInt(Math.floor(Date.now() / 1000));
    const mintAmount = 1_000n * 10n ** 18n;

    assert.throws(
      () => token.mintInflation(user, user, mintAmount, now),
      /QBOT: caller lacks required role/
    );
  });

  it('enforces emergency pause and unpause controls', () => {
    const token = new QBOTTokenModel(admin, treasury);
    assert.equal(token.isPaused(), false);

    token.pause(admin);
    assert.equal(token.isPaused(), true);

    // Transfers are blocked when paused
    assert.throws(
      () => token.transfer(treasury, user, 100n),
      /QBOT: token transfers are paused/
    );

    token.unpause(admin);
    assert.equal(token.isPaused(), false);
    assert.equal(token.transfer(treasury, user, 100n), true);
    assert.equal(token.balanceOf(user), 100n);
  });

  it('burn decreases balance and total supply accurately', () => {
    const token = new QBOTTokenModel(admin, treasury);
    const burnAmount = 500_000n * 10n ** 18n;
    const initialSupply = token.totalSupply();

    token.burn(treasury, burnAmount);
    assert.equal(token.totalSupply(), initialSupply - burnAmount);
    assert.equal(token.balanceOf(treasury), initialSupply - burnAmount);
  });
});
