#!/bin/bash

set -e

echo "🌱 EcoSync Project Initialization"
echo "=================================="
echo ""

# Install base packages
echo "📦 Installing Framer Motion, lucide-react, react-leaflet, and utilities..."
npm install lucide-react framer-motion react-leaflet leaflet.heat sonner clsx tailwind-merge

echo ""
echo "🎨 Checking and installing shadcn components..."

# Array of required shadcn components
declare -a components=(
  "button"
  "card"
  "badge"
  "dialog"
  "input"
  "label"
  "textarea"
  "sidebar"
  "scroll-area"
  "progress"
  "accordion"
  "alert"
  "popover"
  "select"
  "dropdown-menu"
  "sheet"
  "toast"
  "toaster"
)

# Check for each component and install if missing
for component in "${components[@]}"; do
  if [ ! -f "src/components/ui/$component.tsx" ]; then
    echo "Installing shadcn component: $component"
    npx shadcn-ui@latest add "$component" --yes
  else
    echo "✓ Component $component already exists"
  fi
done

echo ""
echo "✅ All dependencies installed!"
echo ""
echo "🚀 Starting development server..."
echo ""

npm run dev
