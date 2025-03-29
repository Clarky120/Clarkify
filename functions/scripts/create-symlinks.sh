#!/bin/bash
set -e

echo "Creating symlinks for core package..."

# Remove any existing symlink to avoid conflicts
if [ -L core ]; then
    rm core
fi

# Create the symlink only if it doesn't exist
if [ ! -d core ]; then
    ln -s ../core core
    echo "Symlink created successfully!"
else
    echo "Directory 'core' already exists. Skipping symlink creation."
fi
