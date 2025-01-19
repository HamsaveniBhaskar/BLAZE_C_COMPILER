#!/bin/bash

# Install dependencies for GCC and Node.js
echo "Installing dependencies..."

# Install GCC
apt-get update
apt-get install -y gcc build-essential

# Install Node.js dependencies
npm install

echo "Dependencies installed successfully."

# Run the server
echo "Starting the server..."
npm start
