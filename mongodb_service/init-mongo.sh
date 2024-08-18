#!/bin/bash
set -e

mongo <<EOF
use admin
db.createUser({
  user: '$MONGODB_ROOT_USERNAME',
  pwd: '$MONGODB_ROOT_PASSWORD',
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})

use $MONGODB_DATABASE
db.createUser({
  user: '$MONGODB_ROOT_USERNAME',
  pwd: '$MONGODB_ROOT_PASSWORD',
  roles: [ { role: "readWrite", db: "$MONGODB_DATABASE" } ]
})
EOF