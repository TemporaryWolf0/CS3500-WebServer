#!/bin/bash
set -euo pipefail

# Prefer environment variables set on the container. If not present, fall back to admin.env.
# Do NOT rely on a mounted project .env file.
if [ -z "${ADMIN_USERNAME:-}" ] || [ -z "${ADMIN_EMAIL:-}" ] || [ -z "${ADMIN_PASSWORD:-}" ]; then
  # No fallback to admin.env: prompt interactively if possible, otherwise skip creation.
  :
fi

# Collect any still-missing variables
missing=()
for v in ADMIN_USERNAME ADMIN_EMAIL ADMIN_PASSWORD; do
  if [ -z "${!v:-}" ]; then
    missing+=("$v")
  fi
done

if [ ${#missing[@]} -ne 0 ]; then
  # If a TTY is available, prompt the operator interactively. Otherwise skip and instruct manual creation.
  if [ -t 0 ]; then
    echo "The following admin variables are missing: ${missing[*]}"
    for v in "${missing[@]}"; do
      if [ "$v" = "ADMIN_PASSWORD" ]; then
        read -s -p "Enter $v: " val
        echo
      else
        read -p "Enter $v: " val
      fi
      if [ -z "$val" ]; then
        echo "$v is required; aborting admin creation." >&2
        exit 0
      fi
      case "$v" in
        ADMIN_USERNAME) ADMIN_USERNAME="$val" ;;
        ADMIN_EMAIL) ADMIN_EMAIL="$val" ;;
        ADMIN_PASSWORD) ADMIN_PASSWORD="$val" ;;
      esac
    done
  else
    echo "Admin variables not set and no TTY available; skipping admin creation."
    echo "You can create an admin after startup using scripts/create-admin.sh"
    exit 0
  fi
fi

# Use root credentials created by the image to authenticate and insert app admin user
mongo "$MONGO_INITDB_DATABASE" -u "$MONGO_INITDB_ROOT_USERNAME" -p "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase "admin" <<EOF
var db = db.getSiblingDB("$MONGO_INITDB_DATABASE");
if (!db.users.findOne({username: "$ADMIN_USERNAME"})) {
  db.users.insertOne({
    username: "$ADMIN_USERNAME",
    email: "$ADMIN_EMAIL",
    password: "$ADMIN_PASSWORD",
    role: "admin",
    createdAt: new Date()
  });
}
EOF
