#!/usr/bin/env bash
#
# Local code health analysis — mirrors the Code Health Agent logic.
# Usage: bash scripts/code-health.sh
#
set -euo pipefail

echo "========================================"
echo "  Code Health Report"
echo "========================================"
echo ""

# ── Codebase metrics ──
TOTAL_FILES=$(find . -name '*.ts' -o -name '*.tsx' | grep -v node_modules | grep -v dist | wc -l)
TOTAL_LINES=$(find . \( -name '*.ts' -o -name '*.tsx' \) -not -path '*/node_modules/*' -not -path '*/dist/*' -exec cat {} + | wc -l)
COMPONENT_COUNT=$(find ./components -name '*.tsx' 2>/dev/null | wc -l)
SERVICE_COUNT=$(find ./lib -name '*Service.ts' -o -name '*service.ts' 2>/dev/null | wc -l)
PAGE_COUNT=$(find ./pages -name '*.tsx' 2>/dev/null | wc -l)
TEST_COUNT=$(find ./tests -name '*.test.ts' -o -name '*.test.tsx' 2>/dev/null | wc -l)
HOOK_COUNT=$(find ./lib -name 'use*.ts' 2>/dev/null | wc -l)

printf "%-30s %s\n" "TypeScript/TSX files:" "$TOTAL_FILES"
printf "%-30s %s\n" "Total lines of code:" "$TOTAL_LINES"
printf "%-30s %s\n" "Components:" "$COMPONENT_COUNT"
printf "%-30s %s\n" "Services:" "$SERVICE_COUNT"
printf "%-30s %s\n" "Pages:" "$PAGE_COUNT"
printf "%-30s %s\n" "Custom hooks:" "$HOOK_COUNT"
printf "%-30s %s\n" "Test files:" "$TEST_COUNT"

echo ""
echo "── Large Files (> 500 lines) ──"
echo ""

LARGE_COUNT=0
while IFS= read -r file; do
  lines=$(wc -l < "$file")
  if [ "$lines" -gt 500 ]; then
    printf "  %6d lines  %s\n" "$lines" "${file#./}"
    LARGE_COUNT=$((LARGE_COUNT + 1))
  fi
done < <(find . \( -name '*.ts' -o -name '*.tsx' \) -not -path '*/node_modules/*' -not -path '*/dist/*' | sort)

if [ "$LARGE_COUNT" -eq 0 ]; then
  echo "  (none — all files are under 500 lines)"
fi

echo ""
echo "── Summary ──"
echo ""
echo "  Files over 500 lines: $LARGE_COUNT"
echo "  Test-to-source ratio: $TEST_COUNT tests / $((SERVICE_COUNT + PAGE_COUNT)) sources"
