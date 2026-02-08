#!/bin/bash
# Force use of WSL Node.js, not Windows Node

# Find WSL node (exclude /mnt/c which are Windows paths)
NODE_BIN=$(which node | grep -v "/mnt/c" | head -n1)

# If not found via which, try common locations
if [ -z "$NODE_BIN" ]; then
    if [ -f "/usr/bin/node" ]; then
        NODE_BIN="/usr/bin/node"
    elif [ -f "/usr/local/bin/node" ]; then
        NODE_BIN="/usr/local/bin/node"
    fi
fi

if [ -z "$NODE_BIN" ]; then
    echo "❌ WSL Node.js not found. Installing..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    NODE_BIN=$(which node)
fi

echo "Using Node: $NODE_BIN"
$NODE_BIN --version

# Start server using WSL node directly
cd "$(dirname "$0")"
$NODE_BIN server.js
