# App Icons for Rapport by GoBoclean

## Required Icon Sizes

Place your PNG icon files in this folder with the following names and sizes:

### Standard Icons
- `icon-72x72.png` - 72×72 pixels
- `icon-96x96.png` - 96×96 pixels
- `icon-128x128.png` - 128×128 pixels
- `icon-144x144.png` - 144×144 pixels
- `icon-152x152.png` - 152×152 pixels (Apple Touch Icon)
- `icon-192x192.png` - 192×192 pixels (Standard PWA)
- `icon-384x384.png` - 384×384 pixels
- `icon-512x512.png` - 512×512 pixels (High-res PWA)

## Design Guidelines

### General
- Use PNG format with transparent background
- Keep the design simple and recognizable
- Include GoBoclean branding elements
- Ensure good contrast on both light and dark backgrounds

### Safe Zone (for maskable icons)
For the 192×192 and 512×512 maskable icons, keep important content within the center 80% circle to ensure it's not clipped on different devices.

Example:
```
512×512 icon = keep content within center 410×410 circle
192×192 icon = keep content within center 154×154 circle
```

### Colors
Use the GoBoclean color scheme:
- Primary: Lime Green (#84cc16)
- Supporting colors from your brand palette

## Quick Generation

You can use online tools to generate all sizes from a single high-res source:
1. Create a 1024×1024 px source image
2. Upload to: https://www.pwabuilder.com/imageGenerator
3. Download and place files in this folder

## Testing
After adding icons, verify they appear correctly:
1. Build the app: `npm run build`
2. Start production: `npm run start`
3. Open browser DevTools → Application → Manifest
4. Check that all icons load properly
