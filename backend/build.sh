#!/bin/bash
set -e

echo "Setting up environment for Rust compilation..."

# Set environment variables to handle Rust compilation issues
export CARGO_HOME=/tmp/cargo
export RUSTUP_HOME=/tmp/rustup
export CARGO_TARGET_DIR=/tmp/target
export CARGO_REGISTRY_CACHE=/tmp/cargo/registry/cache

# Create necessary directories
mkdir -p $CARGO_HOME
mkdir -p $RUSTUP_HOME
mkdir -p $CARGO_TARGET_DIR
mkdir -p $CARGO_REGISTRY_CACHE

echo "Upgrading pip..."
pip install --upgrade pip

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Build completed successfully!" 