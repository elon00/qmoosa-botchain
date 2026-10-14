/**
 * QMOOSA BOT CHAIN — EIP-681 Standard QR Payment Generator & Anti-Hijacking Parser
 * Formats standard payment URIs specifically for BOT Chain Testnet (Chain ID 968).
 * Rejects wrong chains and validates addresses.
 */

import QRCode from 'qrcode';

export interface EIP681PaymentRequest {
  targetAddress: string;
  chainId: number;
  amountQbot?: string;
  valueWei?: bigint;
  tokenContract?: string;
}

export class QRPaymentEngine {
  public static readonly BOTCHAIN_TESTNET_CHAIN_ID = 968;

  /**
   * Generate an EIP-681 compliant URI for BOT Chain Testnet
   */
  static generateEip681Uri(request: EIP681PaymentRequest): string {
    const chainId = request.chainId ?? this.BOTCHAIN_TESTNET_CHAIN_ID;
    if (chainId !== this.BOTCHAIN_TESTNET_CHAIN_ID) {
      throw new Error(
        `Invalid Chain ID: EIP-681 request must target BOT Chain Testnet (968), received ${chainId}`
      );
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(request.targetAddress)) {
      throw new Error(`Invalid target EVM address: ${request.targetAddress}`);
    }

    if (request.tokenContract) {
      if (!/^0x[a-fA-F0-9]{40}$/.test(request.tokenContract)) {
        throw new Error(`Invalid token contract address: ${request.tokenContract}`);
      }
      const amountWei = request.valueWei ?? BigInt(Math.round(Number(request.amountQbot ?? 0) * 1e18));
      return `ethereum:pay-${request.tokenContract}@${chainId}/transfer?address=${request.targetAddress}&uint256=${amountWei.toString()}`;
    }

    const valueStr = request.valueWei ? `?value=${request.valueWei.toString()}` : '';
    return `ethereum:${request.targetAddress}@${chainId}${valueStr}`;
  }

  /**
   * Parse and validate an EIP-681 URI with anti-hijacking safety checks
   */
  static parseAndValidate(uri: string): EIP681PaymentRequest {
    if (!uri.startsWith('ethereum:')) {
      throw new Error('Invalid scheme: URI must begin with "ethereum:"');
    }

    const withoutScheme = uri.slice('ethereum:'.length);

    // ERC-20 transfer pattern: pay-<tokenContract>@<chainId>/transfer?address=<to>&uint256=<amount>
    if (withoutScheme.startsWith('pay-')) {
      const match = withoutScheme.match(
        /^pay-(0x[a-fA-F0-9]{40})@(\d+)\/transfer\?address=(0x[a-fA-F0-9]{40})&uint256=(\d+)$/
      );
      if (!match) {
        throw new Error('Malformed ERC-20 EIP-681 payment URI');
      }

      const [, tokenContract, chainIdStr, targetAddress, valueWeiStr] = match;
      const chainId = parseInt(chainIdStr!, 10);

      if (chainId !== this.BOTCHAIN_TESTNET_CHAIN_ID) {
        throw new Error(`Security rejection: URI targets chain ${chainId}, expected BOT Chain (968)`);
      }

      return {
        targetAddress: targetAddress!,
        chainId,
        tokenContract,
        valueWei: BigInt(valueWeiStr!),
      };
    }

    // Native token payment pattern: <recipient>@<chainId>?value=<amount>
    const match = withoutScheme.match(/^(0x[a-fA-F0-9]{40})@(\d+)(?:\?value=(\d+))?$/);
    if (!match) {
      throw new Error('Malformed native EIP-681 payment URI');
    }

    const [, targetAddress, chainIdStr, valueWeiStr] = match;
    const chainId = parseInt(chainIdStr!, 10);

    if (chainId !== this.BOTCHAIN_TESTNET_CHAIN_ID) {
      throw new Error(`Security rejection: URI targets chain ${chainId}, expected BOT Chain (968)`);
    }

    return {
      targetAddress: targetAddress!,
      chainId,
      valueWei: valueWeiStr ? BigInt(valueWeiStr) : undefined,
    };
  }

  /**
   * Render ASCII QR Code for CLI / Terminal output
   */
  static async renderTerminalQr(uri: string): Promise<string> {
    return new Promise((resolve, reject) => {
      QRCode.toString(uri, { type: 'terminal', small: true }, (err, str) => {
        if (err) reject(err);
        else resolve(str);
      });
    });
  }

  /**
   * Render PNG Base64 Data URL for Web UI
   */
  static async renderDataUrl(uri: string): Promise<string> {
    return QRCode.toDataURL(uri, { errorCorrectionLevel: 'M', margin: 2 });
  }
}
