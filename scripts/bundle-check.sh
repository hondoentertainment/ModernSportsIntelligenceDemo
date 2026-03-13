#!/usr/bin/env bash
#
# Local bundle size checker — mirrors the Performance Budget Agent logic.
# Usage: bash scripts/bundle-check.sh
#
set -euo pipefail

INDEX_BUDGET=$((200 * 1024))
CHUNK_BUDGET=$((50 * 1024))

echo "Building production bundle..."
npm run build --silent

echo ""
echo "========================================"
echo "  Bundle Size Report"
echo "========================================"
echo ""

BUDGET_EXCEEDED=false

# Gzip each asset for measurement
find dist/assets -type f \( -name '*.js' -o -name '*.css' \) | while read -r file; do
  gzip -k -9 -f "$file"
done

printf "%-40s %10s %10s %10s %s\n" "File" "Raw" "Gzip" "Budget" "Status"
printf "%-40s %10s %10s %10s %s\n" "----" "---" "----" "------" "------"

TOTAL_RAW=0
TOTAL_GZ=0

while IFS= read -r file; do
  filename=$(basename "$file")
  raw_size=$(stat --format=%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null)
  gz_file="${file}.gz"
  gz_size=$(stat --format=%s "$gz_file" 2>/dev/null || stat -f%z "$gz_file" 2>/dev/null)

  raw_kb=$(echo "scale=1; $raw_size / 1024" | bc)
  gz_kb=$(echo "scale=1; $gz_size / 1024" | bc)

  TOTAL_RAW=$((TOTAL_RAW + raw_size))
  TOTAL_GZ=$((TOTAL_GZ + gz_size))

  if echo "$filename" | grep -qE '^index'; then
    budget_kb=$(echo "scale=1; $INDEX_BUDGET / 1024" | bc)
    if [ "$gz_size" -gt "$INDEX_BUDGET" ]; then
      status="OVER BUDGET"
      BUDGET_EXCEEDED=true
    else
      status="OK"
    fi
  else
    budget_kb=$(echo "scale=1; $CHUNK_BUDGET / 1024" | bc)
    if [ "$gz_size" -gt "$CHUNK_BUDGET" ]; then
      status="OVER BUDGET"
      BUDGET_EXCEEDED=true
    else
      status="OK"
    fi
  fi

  printf "%-40s %8s KB %8s KB %8s KB %s\n" "$filename" "$raw_kb" "$gz_kb" "$budget_kb" "$status"
done < <(find dist/assets -type f -name '*.js' | sort)

echo ""
echo "Total raw:  $(echo "scale=1; $TOTAL_RAW / 1024" | bc) KB"
echo "Total gzip: $(echo "scale=1; $TOTAL_GZ / 1024" | bc) KB"

# Clean up .gz files
find dist/assets -name '*.gz' -delete 2>/dev/null || true

if [ "$BUDGET_EXCEEDED" = true ]; then
  echo ""
  echo "RESULT: Budget exceeded!"
  exit 1
else
  echo ""
  echo "RESULT: All budgets met."
fi
