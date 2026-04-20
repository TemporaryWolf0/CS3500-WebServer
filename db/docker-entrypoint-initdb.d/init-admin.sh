#!/bin/bash
set -euo pipefail

# Force a WiredTiger checkpoint so the root user created by MONGO_INITDB_ROOT_USERNAME
# is safely persisted before the entrypoint restarts mongod with auth enabled.
mongosh admin --quiet <<'EOF'
db.adminCommand({ fsync: 1 });
EOF
