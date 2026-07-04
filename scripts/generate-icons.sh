#!/bin/bash

# Icon generation script for Jumia PWA
# This creates PNG icons from SVG for various sizes

cd "$(dirname "$0")/../public"

echo "📱 Generating PWA icons for Jumia..."

# Create icons using ImageMagick (if available)
if command -v convert &> /dev/null; then
    echo "✓ ImageMagick found, generating PNG icons..."
    
    # Generate regular icons
    convert -background "#ea580c" -fill white -font Arial-Bold -pointsize 120 -gravity center \
        -size 192x192 label:"J" -background "#ea580c" -flatten \
        -draw "roundrectangle 0,0 192,192 24,24" icon-192x192.png
    
    convert -background "#ea580c" -fill white -font Arial-Bold -pointsize 320 -gravity center \
        -size 512x512 label:"J" -background "#ea580c" -flatten \
        -draw "roundrectangle 0,0 512,512 64,64" icon-512x512.png
    
    # Generate maskable icons (with safe zone)
    convert -background "#ea580c" -fill white -font Arial-Bold -pointsize 100 -gravity center \
        -size 192x192 label:"J" -background "#ea580c" -flatten icon-maskable-192x192.png
    
    convert -background "#ea580c" -fill white -font Arial-Bold -pointsize 270 -gravity center \
        -size 512x512 label:"J" -background "#ea580c" -flatten icon-maskable-512x512.png
    
    echo "✅ PNG icons generated successfully!"
    ls -lh icon-*.png
else
    echo "❌ ImageMagick not found. Please install it or provide PNG icons manually:"
    echo ""
    echo "Required icons:"
    echo "  - icon-192x192.png (192x192)"
    echo "  - icon-512x512.png (512x512)"
    echo "  - icon-maskable-192x192.png (192x192)"
    echo "  - icon-maskable-512x512.png (512x512)"
    echo ""
    echo "You can:"
    echo "  1. Install ImageMagick: sudo apt-get install imagemagick"
    echo "  2. Use an online tool like https://realfavicongenerator.net/"
    echo "  3. Provide your own Jumia logo PNG files"
    exit 1
fi
