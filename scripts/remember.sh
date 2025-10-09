#!/bin/bash

# Check if ./dist directory exists
if [ ! -d "./dist" ]; then
    echo "❌ Error: ./dist directory not found!"
    echo "Please build the project before proceeding."
    exit 1
fi

cat << "EOF"
🚨 REMINDER: Build your code before deployment!

⚠️  IMPORTANT: The content of ./dist folder may vary depending on the target architecture of your build.

📋 Available build commands for each architecture:
- Monolith: npm run monolith:build
- Layered: npm run layered:build
- Hexagonal: npm run hexagonal:build
- Clean: npm run clean:build


EOF
