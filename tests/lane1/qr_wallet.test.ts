import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { QRPaymentEngine } from '../../src/wallet/qr.js';

describe('Lane 1: EIP-681 Dynamic QR Code & Anti-Hijacking Validation', () => {
  const target = '0xC3376296a18ef364eA19287203EEd7a87f18e738';
  const token = '0x9680000000000000000000000000000000000402';

  it('generates valid EIP-681 URI for native BOT Chain Testnet transfer', () => {
    const uri = QRPaymentEngine.generateEip681Uri({
      targetAddress: target,
      chainId: 968,
      valueWei: 1_000_000_000_000_000n, // 0.001 tBOT
    });
    assert.equal(uri, `ethereum:${target}@968?value=1000000000000000`);
  });

  it('generates valid EIP-681 URI for ERC-20 QBOT transfer', () => {
    const uri = QRPaymentEngine.generateEip681Uri({
      targetAddress: target,
      chainId: 968,
      tokenContract: token,
      valueWei: 2_000_000_000_000_000n, // 0.002 QBOT
    });
    assert.equal(
      uri,
      `ethereum:pay-${token}@968/transfer?address=${target}&uint256=2000000000000000`
    );
  });

  it('parses valid native and ERC-20 payment URIs', () => {
    const nativeUri = `ethereum:${target}@968?value=5000000000000000`;
    const parsedNative = QRPaymentEngine.parseAndValidate(nativeUri);
    assert.equal(parsedNative.targetAddress, target);
    assert.equal(parsedNative.chainId, 968);
    assert.equal(parsedNative.valueWei, 5_000_000_000_000_000n);

    const tokenUri = `ethereum:pay-${token}@968/transfer?address=${target}&uint256=1000000000000000`;
    const parsedToken = QRPaymentEngine.parseAndValidate(tokenUri);
    assert.equal(parsedToken.targetAddress, target);
    assert.equal(parsedToken.tokenContract, token);
    assert.equal(parsedToken.chainId, 968);
    assert.equal(parsedToken.valueWei, 1_000_000_000_000_000n);
  });

  it('rejects URIs targeting wrong chains (e.g. Ethereum mainnet 1, BSC 56, Polygon 137)', () => {
    assert.throws(
      () => QRPaymentEngine.generateEip681Uri({ targetAddress: target, chainId: 1 }),
      /Invalid Chain ID: EIP-681 request must target BOT Chain Testnet \(968\)/
    );

    const hijackedUri = `ethereum:${target}@1?value=1000`;
    assert.throws(
      () => QRPaymentEngine.parseAndValidate(hijackedUri),
      /Security rejection: URI targets chain 1, expected BOT Chain \(968\)/
    );
  });

  it('renders QR code as base64 data URL', async () => {
    const uri = `ethereum:${target}@968?value=1000`;
    const dataUrl = await QRPaymentEngine.renderDataUrl(uri);
    assert.match(dataUrl, /^data:image\/png;base64,/);
  });
});
