#!/usr/bin/env bash
#
# Puts the previous release back. Deploys keep one release behind the live one
# in /opt/uarc/app.prev for exactly this.
#
set -euo pipefail
BASE=/opt/uarc

[ -d "$BASE/app.prev" ] || { echo "No previous release to roll back to."; exit 1; }

echo "live:     $(cat "$BASE/app/RELEASE" 2>/dev/null || echo unknown)"
echo "restoring $(cat "$BASE/app.prev/RELEASE" 2>/dev/null || echo unknown)"

rm -rf "$BASE/app.failed"
[ -d "$BASE/app" ] && mv "$BASE/app" "$BASE/app.failed"
mv "$BASE/app.prev" "$BASE/app"
systemctl restart uarc
echo "ROLLBACK-COMPLETE"
