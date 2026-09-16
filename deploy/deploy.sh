#!/usr/bin/env bash
#
# Deploys a release of the conference site.
#
#   /opt/uarc/bin/deploy.sh /opt/uarc/incoming/uarc-release.tar.gz <commit>
#
# The previous script unpacked each release over the top of the last one and
# kept the old .next build folder between runs. That meant files deleted from
# the code lived on, and compiled pages from earlier builds sat alongside new
# ones. On 16 September the live site was found serving the 20 to 22 October
# dates weeks after they were corrected, from a build folder holding both.
#
# This one never builds in place. Every release is unpacked into a fresh
# directory, built there from nothing, and only swapped in once the build has
# passed and the new server has answered a request. The previous release is
# kept beside it, so a bad deploy is undone with one command:
#
#   /opt/uarc/bin/rollback.sh
#
set -euo pipefail

BUNDLE="${1:?usage: deploy.sh <bundle.tar.gz> <commit>}"
COMMIT="${2:-unknown}"
BASE=/opt/uarc
NEW="$BASE/app.new"
LOG=/var/log/uarc-deploy.log

exec > >(tee "$LOG") 2>&1
trap 'echo "DEPLOY-FAILED at line $LINENO. The live site was not touched."' ERR

echo "== deploying $COMMIT at $(date -u '+%Y-%m-%d %H:%M UTC')"

rm -rf "$NEW"
mkdir -p "$NEW"
tar -xzf "$BUNDLE" -C "$NEW" --no-same-owner
echo "$COMMIT" > "$NEW/RELEASE"

# Dependencies are only reinstalled when the lockfile changes; otherwise the
# current release's are copied, which takes seconds rather than minutes.
if [ -d "$BASE/app/node_modules" ] && cmp -s "$NEW/package-lock.json" "$BASE/app/package-lock.json"; then
  echo "== lockfile unchanged, reusing node_modules"
  cp -a "$BASE/app/node_modules" "$NEW/node_modules"
fi

chown -R uarc:uarc "$NEW"

sudo -u uarc -H bash -euo pipefail <<'BUILD'
set -a; . /opt/uarc/shared.env; set +a
cd /opt/uarc/app.new
# shared.env sets NODE_ENV=production, and with that set npm silently skips
# devDependencies. TypeScript is one. Without it Next.js cannot read the @/
# path aliases from tsconfig.json, so every "@/..." import fails to resolve
# and the build dies with "Module not found". That is what broke the server
# build on 16 September, and very likely why somebody had earlier switched off
# type errors and linting on the live copy. Install dev packages explicitly,
# and refuse to build without TypeScript rather than fail confusingly.
if [ ! -f node_modules/typescript/package.json ]; then
  npm ci --include=dev --no-audit --no-fund
fi
test -f node_modules/typescript/package.json || { echo "TypeScript missing after install"; exit 1; }
npx prisma generate
npx prisma migrate deploy
npm run build
BUILD

test -f "$NEW/.next/BUILD_ID"
echo "== build passed, swapping releases"

rm -rf "$BASE/app.prev"
[ -d "$BASE/app" ] && mv "$BASE/app" "$BASE/app.prev"
mv "$NEW" "$BASE/app"

systemctl restart uarc

# Do not call it done until the new server actually answers.
for i in $(seq 1 30); do
  if curl -fsS -o /dev/null http://127.0.0.1:3000/; then
    echo "== new release answering after ${i}s"
    echo "DEPLOY-COMPLETE $COMMIT"
    exit 0
  fi
  sleep 1
done

echo "== new release did not answer; rolling back"
/opt/uarc/bin/rollback.sh
echo "DEPLOY-FAILED new release did not start; previous release restored"
exit 1
