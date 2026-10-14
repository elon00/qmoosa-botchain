# QMOOSA BOT CHAIN — Upstream Sandbox Tools

This directory contains upstream engineering and research tools used for deep architectural inspection, static code analysis, and recursive self-improvement loops:

## 1. REA (Reverse Engineering & Analysis)
- **Source:** [https://github.com/morluto/rea](https://github.com/morluto/rea)
- **License:** MIT License
- **Purpose:** Evidence-based reverse engineering, smart contract AST analysis, dependency graphing, and static verification.
- **Security Boundary:** Read-only inspection within the sandbox. REA possesses no authority over deployment keys, private seeds, or blockchain transactions.
- **Execution Script:** `npm run rea:audit` (`scripts/rea_audit.ts`)

## 2. Raven RSI (Recursive Self-Improvement)
- **Source:** [https://github.com/EverMind-AI/Raven](https://github.com/EverMind-AI/Raven)
- **License:** Apache 2.0 License
- **Purpose:** Autonomous recursive self-improvement agent framework for prompt optimization, test-driven refactoring, and code mutation benchmarking.
- **Security Boundary:** Pre-alpha isolation. Raven cannot spend mainnet funds, sign transactions, or push unreviewed modifications to production branches.
- **Execution Script:** `npm run raven:rsi` (`scripts/raven_rsi.ts`)
