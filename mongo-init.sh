#!/bin/bash
set -e
NODE_ENV="${NODE_ENV:-development}"

echo "Mongo init running in NODE_ENV=$NODE_ENV"

if [ "$NODE_ENV" = "production" ]; then
  HOST="mongo"
else
  HOST="localhost"
fi

echo "Waiting for MongoDB to be ready..."
sleep 2

mongosh --host mongo:27017 --quiet --eval "
try { 
  rs.status();
  print('✓ Replica set already initialized');
  quit(0);
} catch (err) { 
  print('Initializing replica set...');
  rs.initiate({
    _id: 'rs0',
    members: [{_id: 0, host: '$HOST:27017'}]
  });
  print('✓ Replica set initialized successfully');
  quit(0);
}
" || {
  echo "Failed to initialize replica set"
  exit 1
}