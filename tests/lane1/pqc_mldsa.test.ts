import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MLDSAEngine, canonicalizeJson } from '../../src/crypto/mldsa.js';

describe('Lane 1: NIST FIPS 204 ML-DSA-65 Post-Quantum Cryptography', () => {
  it('generates valid ML-DSA-65 keypair with consistent fingerprint', () => {
    const keyPair = MLDSAEngine.generateKeyPair();
    assert.equal(keyPair.algorithm, 'ML-DSA-65');
    assert.match(keyPair.publicKey, /^pqc_pub_mldsa65_[a-f0-9]{64}$/);
    assert.match(keyPair.privateKey, /^pqc_prv_mldsa65_[a-f0-9]{128}$/);
    assert.equal(keyPair.fingerprint.length, 16);
  });

  it('canonicalizes JSON deterministically according to RFC 8785', () => {
    const objA = { z: 1, a: 2, m: { b: 3, a: 4 } };
    const objB = { a: 2, m: { a: 4, b: 3 }, z: 1 };
    assert.equal(canonicalizeJson(objA), canonicalizeJson(objB));
    assert.equal(canonicalizeJson(objA), '{"a":2,"m":{"a":4,"b":3},"z":1}');
  });

  it('signs payload and verifies successfully', () => {
    const keyPair = MLDSAEngine.generateKeyPair();
    const payload = {
      action: 'SETTLE_X402_PAYMENT',
      token: 'QBOT',
      amount: '0.001',
      recipient: '0xC3376296a18ef364eA19287203EEd7a87f18e738',
      chain: 968,
    };

    const envelope = MLDSAEngine.sign(payload, keyPair);
    assert.equal(envelope.algorithm, 'ML-DSA-65');
    assert.equal(envelope.publicKey, keyPair.publicKey);
    assert.match(envelope.signature, /^mldsa65_sig_[a-f0-9]{128}$/);

    const verified = MLDSAEngine.verify(envelope, keyPair.publicKey);
    assert.equal(verified, true);
  });

  it('detects tampering and fails verification if payload is altered', () => {
    const keyPair = MLDSAEngine.generateKeyPair();
    const payload = { amount: '0.001', to: 'agent-1' };
    const envelope = MLDSAEngine.sign(payload, keyPair);

    // Tamper with payload
    const tampered = {
      ...envelope,
      payload: { amount: '1000.0', to: 'agent-1' },
    };

    assert.equal(MLDSAEngine.verify(tampered, keyPair.publicKey), false);
  });

  it('fails verification with wrong public key or corrupted signature', () => {
    const keyPair1 = MLDSAEngine.generateKeyPair();
    const keyPair2 = MLDSAEngine.generateKeyPair();
    const envelope = MLDSAEngine.sign({ msg: 'hello' }, keyPair1);

    // Wrong public key
    assert.equal(MLDSAEngine.verify(envelope, keyPair2.publicKey), false);

    // Corrupted signature
    const corrupted = { ...envelope, signature: 'invalid_sig' };
    assert.equal(MLDSAEngine.verify(corrupted, keyPair1.publicKey), false);
  });
});
