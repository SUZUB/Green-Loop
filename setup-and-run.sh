#!/usr/bin/env bash
set -e

echo "🚀 Starting EcoSync Green-Loop setup..."

npm install

npm install lucide-react framer-motion react-leaflet leaflet leaflet.heat sonner clsx tailwind-merge

npm run lint || true

# Clean the Vite cache (if exists)
rm -rf node_modules/.vite dist .vite

npm run dev
