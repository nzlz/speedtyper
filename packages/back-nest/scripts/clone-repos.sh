#!/bin/bash

REPOS_DIR="/app/repos"
mkdir -p $REPOS_DIR

# Find and process .repos file
cd /app
if [ -f ".repos" ]; then
    echo "Found .repos file, importing repositories..."
    cd $REPOS_DIR
    vcs import < /app/.repos
else
    echo "No .repos file found in /app"
    exit 1
fi 