#!/bin/bash

# Verify TypeScript imports and type safety
# Exit with non-zero code if verification fails

set -e

echo "[INFO] Verifying TypeScript types and imports..."

# Run TypeScript compiler to check all files
if npm run type-check; then
  echo "[OK] TypeScript type check passed"
else
  echo "[ERROR] TypeScript type check failed"
  exit 1
fi

# Optional: run ESLint to catch import order/unused imports
if command -v npm &> /dev/null; then
  if npm run lint; then
    echo "[OK] ESLint passed"
  else
    echo "[WARN] ESLint found issues (not failing)"
  fi
fi

echo "[OK] All import verifications passed"
exit 0
