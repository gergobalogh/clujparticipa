#!/usr/bin/env bash
# Generate a self-signed TLS certificate for PgBouncer.
# Run once on the server before `docker compose up`.
# The cert is valid for 10 years; regenerate if the hostname changes.
set -euo pipefail

CERT_DIR="$(cd "$(dirname "$0")/.." && pwd)/pgbouncer/tls"
mkdir -p "$CERT_DIR"

# Use the server's hostname or IP as the CN so clients can set sslmode=require
# without needing to verify the cert (no SAN matching needed for require mode).
CN="${1:-clujparticipa-pgbouncer}"

openssl req -x509 -newkey rsa:4096 \
  -keyout "$CERT_DIR/server.key" \
  -out    "$CERT_DIR/server.crt" \
  -days 3650 -nodes \
  -subj "/CN=${CN}"

# 644 so the pgbouncer container (UID 70) can read it without a chown.
chmod 644 "$CERT_DIR/server.key"
chmod 644 "$CERT_DIR/server.crt"

echo "Certificates written to $CERT_DIR"
echo "  server.key  (private — keep secret)"
echo "  server.crt  (public — can be shared with clients for verify-ca mode)"
