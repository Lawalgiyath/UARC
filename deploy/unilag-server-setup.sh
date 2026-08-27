#!/usr/bin/env bash
#
# Puts the conference site on the university's own server.
#
#   Ubuntu 22.04, conference.unilag.edu.ng, 196.45.51.86
#
# Run it as root, on the server, from a directory containing this repository:
#
#     bash deploy/unilag-server-setup.sh
#
# Why this exists as a script rather than a list of commands in an email: it is
# idempotent, so it can be re-run after a failure without making a mess, and it
# refuses to start until the things it cannot fix itself are true. Setting a
# conference registration system up by hand at eleven at night is how a
# database ends up with no password.
#
# WHAT IT DOES NOT DO
#
# It does not touch anything already being served. If it finds an existing site
# in nginx it leaves it alone and adds ours alongside, because there is an
# existing conference site on this host and losing it is not an acceptable
# outcome of installing a new one.
#
# WHAT YOU MUST DO FIRST
#
#   1. Open ports 80 and 443 to the internet. As of 27 August only port 22
#      answers from outside, which means Let's Encrypt cannot reach this host
#      to issue a certificate, and nobody can read the site once it is running.
#      This script cannot do it: the block is upstream of the machine, in the
#      university firewall.
#   2. Put the real secrets in /opt/uarc/shared.env (see the template it
#      writes on first run). Nothing here invents a password.
#
set -euo pipefail

APP_USER="uarc"
APP_DIR="/opt/uarc/app"
SHARED_ENV="/opt/uarc/shared.env"
DOMAIN="conference.unilag.edu.ng"
PORT="3000"
DB_NAME="uarc"
DB_USER="uarc"

log()  { printf "\n\033[1m==> %s\033[0m\n" "$*"; }
warn() { printf "\033[33m    ! %s\033[0m\n" "$*"; }
die()  { printf "\033[31m    x %s\033[0m\n" "$*" >&2; exit 1; }

[[ $EUID -eq 0 ]] || die "Run this as root."

# ---------------------------------------------------------------- preflight
log "Checking what is already here"

if command -v nginx >/dev/null 2>&1; then
  existing=$(ls /etc/nginx/sites-enabled/ 2>/dev/null | grep -v "^${DOMAIN}$" || true)
  if [[ -n "$existing" ]]; then
    warn "nginx already serves: $(echo "$existing" | tr '\n' ' ')"
    warn "Those are left untouched. Ours is added as a separate server block."
  fi
fi

if ss -lntp 2>/dev/null | grep -q ":${PORT} "; then
  die "Something already listens on ${PORT}. Stop it, or change PORT in this script."
fi

# ------------------------------------------------------------------ packages
log "Installing Node.js 20, PostgreSQL, nginx and certbot"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq

if ! command -v node >/dev/null 2>&1 || [[ "$(node -v | cut -d. -f1 | tr -d v)" -lt 20 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y -qq nodejs
fi
apt-get install -y -qq postgresql postgresql-contrib nginx certbot python3-certbot-nginx ufw git

log "Versions"
echo "    node $(node -v), npm $(npm -v), $(psql --version), $(nginx -v 2>&1)"

# ---------------------------------------------------------------------- user
if ! id -u "$APP_USER" >/dev/null 2>&1; then
  log "Creating the ${APP_USER} service account"
  # No login shell: this account exists to own files and run one service, and
  # nothing about the conference needs a person to log in as it.
  adduser --system --group --home /opt/uarc --shell /usr/sbin/nologin "$APP_USER"
fi
mkdir -p /opt/uarc
chown "$APP_USER:$APP_USER" /opt/uarc

# ------------------------------------------------------------------ database
log "Setting up PostgreSQL"
systemctl enable --now postgresql

if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1; then
  # The password is generated here and written only to the env file, so it is
  # never typed, never in shell history, and never in this script.
  DB_PASS="$(openssl rand -base64 30 | tr -d '/+=' | head -c 32)"
  sudo -u postgres psql -qc "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';"
  sudo -u postgres psql -qc "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"
  echo "    database and role created"
  NEW_DB_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}?schema=public"
else
  echo "    role ${DB_USER} already exists, leaving it alone"
  NEW_DB_URL=""
fi

# ------------------------------------------------------------------- secrets
if [[ ! -f "$SHARED_ENV" ]]; then
  log "Writing the environment template"
  cat > "$SHARED_ENV" <<TEMPLATE
# Secrets for the conference site. This file is the only place they live.
# Nothing in the repository contains them, and nothing should.

# Written by the setup script when it created the database:
DATABASE_URL="${NEW_DB_URL}"

NEXT_PUBLIC_SITE_URL="https://${DOMAIN}"
NODE_ENV="production"

# Fill these in. The site starts without them but cannot send mail, take
# uploads or let the Secretariat sign in.
ADMIN_EMAIL=""
# Generate with: npm run hash-password -- "the password"
# Paste the RAW hash here, no backslashes.
ADMIN_PASSWORD_HASH=""
# Generate with: openssl rand -hex 32
SESSION_SECRET=""

SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
MAIL_FROM_NAME="19th UNILAG Annual Research Conference"
MAIL_FROM_ADDRESS=""
MAIL_REPLY_TO=""

CLOUDINARY_CLOUD_NAME=""
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Remita, when the university releases the credentials. Blank means the site
# hands delegates a prefilled link to the payment portal instead, which works.
REMITA_MERCHANT_ID=""
REMITA_SERVICE_TYPE_ID=""
REMITA_API_KEY=""
REMITA_ENV="live"
TEMPLATE
  chmod 600 "$SHARED_ENV"
  chown "$APP_USER:$APP_USER" "$SHARED_ENV"
  warn "Template written to ${SHARED_ENV}. Fill it in, then run this script again."
  [[ -n "$NEW_DB_URL" ]] && echo "    DATABASE_URL is already filled in for you."
  exit 0
fi

# shellcheck disable=SC1090
set -a; source "$SHARED_ENV"; set +a
[[ -n "${DATABASE_URL:-}" ]] || die "DATABASE_URL is empty in ${SHARED_ENV}."
[[ -n "${SESSION_SECRET:-}" ]] || die "SESSION_SECRET is empty in ${SHARED_ENV}."
[[ -n "${ADMIN_PASSWORD_HASH:-}" ]] || die "ADMIN_PASSWORD_HASH is empty in ${SHARED_ENV}."

# ----------------------------------------------------------------- the app
log "Installing the application into ${APP_DIR}"
mkdir -p "$APP_DIR"
# Copy the working tree rather than cloning, so this works whether the code
# arrived by git, scp or a memory stick.
tar --exclude=node_modules --exclude=.next --exclude=.git -cf - . | tar -xf - -C "$APP_DIR"
chown -R "$APP_USER:$APP_USER" /opt/uarc

log "Installing dependencies and building"
cd "$APP_DIR"
sudo -u "$APP_USER" -H env "PATH=$PATH" npm ci --omit=dev --no-audit --no-fund
sudo -u "$APP_USER" -H env "PATH=$PATH" DATABASE_URL="$DATABASE_URL" npx prisma generate
sudo -u "$APP_USER" -H env "PATH=$PATH" DATABASE_URL="$DATABASE_URL" npx prisma migrate deploy
# The build needs dev dependencies; install them, build, then drop them again.
sudo -u "$APP_USER" -H env "PATH=$PATH" npm ci --no-audit --no-fund
sudo -u "$APP_USER" -H env "PATH=$PATH" npm run build
sudo -u "$APP_USER" -H env "PATH=$PATH" npm prune --omit=dev

# --------------------------------------------------------------- the service
log "Installing the systemd service"
cat > /etc/systemd/system/uarc.service <<UNIT
[Unit]
Description=19th UNILAG Annual Research Conference website
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=${APP_USER}
Group=${APP_USER}
WorkingDirectory=${APP_DIR}
EnvironmentFile=${SHARED_ENV}
Environment=PORT=${PORT}
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5

# The service reads its own directory and talks to Postgres on localhost. It
# has no business anywhere else on this machine, and this is what stops a bug
# in a dependency from becoming a bad day for the whole server.
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=${APP_DIR}/.next
ProtectKernelTunables=true
ProtectControlGroups=true
RestrictSUIDSGID=true

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable --now uarc
sleep 4
systemctl is-active --quiet uarc || { journalctl -u uarc -n 40 --no-pager; die "The service did not start."; }
echo "    uarc.service is running on 127.0.0.1:${PORT}"

# ------------------------------------------------------------------- nginx
log "Configuring nginx for ${DOMAIN}"
cat > "/etc/nginx/sites-available/${DOMAIN}" <<NGINX
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    # Receipts and abstracts are uploaded through this proxy.
    client_max_body_size 12M;

    location / {
        proxy_pass http://127.0.0.1:${PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        # The application rate limits by IP, so it has to see the real one.
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 60s;
    }
}
NGINX

ln -sf "/etc/nginx/sites-available/${DOMAIN}" "/etc/nginx/sites-enabled/${DOMAIN}"
nginx -t || die "nginx configuration is invalid; nothing was reloaded."
systemctl reload nginx

# ------------------------------------------------------------------ firewall
log "Opening the web ports on the host firewall"
ufw allow OpenSSH >/dev/null 2>&1 || true
ufw allow 'Nginx Full' >/dev/null 2>&1 || true
ufw --force enable >/dev/null 2>&1 || true
ufw status | sed 's/^/    /'

# ----------------------------------------------------------------------- TLS
log "Requesting a certificate"
if curl -fsS -m 15 -o /dev/null "http://${DOMAIN}/" 2>/dev/null; then
  certbot --nginx -d "${DOMAIN}" --non-interactive --agree-tos \
          --register-unsafely-without-email --redirect \
    && echo "    HTTPS is on, and renews itself." \
    || warn "certbot failed. The site is up on http:// until this is sorted."
else
  warn "${DOMAIN} does not answer on port 80 from this machine."
  warn "Let's Encrypt has to reach it over the public internet to issue a"
  warn "certificate, so ask the network team to open 80 and 443, then run:"
  warn "    certbot --nginx -d ${DOMAIN} --redirect"
fi

log "Done"
cat <<SUMMARY

    Site        https://${DOMAIN}
    Service     systemctl status uarc
    Logs        journalctl -u uarc -f
    Secrets     ${SHARED_ENV}
    Database    postgresql, local, database "${DB_NAME}"

    To deploy a change: copy the new code over ${APP_DIR}, then
        cd ${APP_DIR} && npm ci && npm run build && systemctl restart uarc

    Still to do, and not by this script:
      - Back the database up. A conference register with no backup is one
        disk failure away from nobody having a registration.
            sudo -u postgres pg_dump ${DB_NAME} | gzip > /var/backups/uarc-\$(date +%F).sql.gz
      - Change the root password, and turn off root password login:
            PermitRootLogin prohibit-password   in /etc/ssh/sshd_config

SUMMARY
