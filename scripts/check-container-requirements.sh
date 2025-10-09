#!/bin/bash

# Check if dist folder exists
if [ ! -d "./dist" ]; then
    echo "Error: ./dist folder not found. Please build the project first."
    exit 1
fi

# Check if Dockerfile exists in root
if [ ! -f "./Dockerfile" ]; then
    echo "Error: Dockerfile not found in root directory."
    exit 1
fi

echo "All requirements met: ./dist folder and Dockerfile found."
exit 0
