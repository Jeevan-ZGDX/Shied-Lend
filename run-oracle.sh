#!/bin/bash

# Check if running in WSL
if grep -qi microsoft /proc/version; then
    echo "✓ Running in WSL"
    # Try to find the script we just created
    if [ -f "proving-service/start.sh" ]; then
        ./proving-service/start.sh
    else
        # Fallback if start.sh missing
        cd proving-service
        /usr/bin/node server.js
    fi
else
    # Native Linux
    echo "Running in Native Linux"
    cd proving-service
    node server.js
fi
