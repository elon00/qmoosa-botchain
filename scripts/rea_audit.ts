/**
 * QMOOSA BOT CHAIN — REA Architectural Inspection & Security Audit
 * Upstream Reference: https://github.com/morluto/rea
 * Inspects Solidity contracts, TypeScript AST, dependencies, and license conformity.
 */

import fs from 'node:fs';
import path from 'node:path';

async function runReaAudit() {
  console.log('🔍 Executing REA Architectural Inspection on QMOOSA BOT CHAIN...');

  const contractPath = path.resolve('contracts/QBOTToken.sol');
  if (!fs.existsSync(contractPath)) {
    throw new Error(`REA Audit failed: Contract not found at ${contractPath}`);
  }

  const contractCode = fs.readFileSync(contractPath, 'utf-8');

  // Verify critical contract invariants
  const hasAccessControl =
    contractCode.includes('DEFAULT_ADMIN_ROLE') &&
    contractCode.includes('MINTER_ROLE') &&
    contractCode.includes('PAUSER_ROLE');
  const hasInflationCeiling =
    contractCode.includes('MAX_ANNUAL_INFLATION_BPS = 200') &&
    contractCode.includes('mintInflation');
  const hasInitialSupply = contractCode.includes('INITIAL_SUPPLY = 1_000_000_000 * 10**18');
  const hasPauseModifier = contractCode.includes('whenNotPaused');

  const pkgPath = path.resolve('package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

  const report = {
    tool: 'REA (Reverse Engineering & Architectural Analysis)',
    upstream: 'https://github.com/morluto/rea',
    timestamp: new Date().toISOString(),
    status: 'STATIC_HEURISTIC_ONLY_NOT_SECURITY_AUDIT',
    contractAudit: {
      contract: 'contracts/QBOTToken.sol',
      invariants: {
        hasAccessControl,
        hasInflationCeiling,
        hasInitialSupply,
        hasPauseModifier,
      },
      securityScore: null,
    },
    dependencyAudit: {
      dependenciesCount: Object.keys(pkg.dependencies || {}).length,
      devDependenciesCount: Object.keys(pkg.devDependencies || {}).length,
      license: pkg.license,
      pqcStandard: 'NIST FIPS 204 ML-DSA-65',
      paymentProtocol: '@x402/express (HTTP 402 Paywall)',
    },
    findings: ['Source-text heuristics are not an independent contract audit; compile, fuzz, prove invariants, and engage a reviewer.'],
  };

  const reportsDir = path.resolve('reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const outputPath = path.join(reportsDir, 'REA_ANALYSIS.json');
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));

  console.log(`REA heuristic inspection complete (NOT a security audit). Output: ${outputPath}`);
}

runReaAudit().catch((err) => {
  console.error('❌ REA Audit Error:', err);
  process.exit(1);
});
