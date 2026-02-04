# Icon Sizes Guide for Rapport by GoBoclean PWA

## Quick Reference

### App Icons Location: `/public/icons/`

Create these PNG files with transparent backgrounds:

| Filename | Size | Purpose |
|----------|------|---------|
| `icon-72x72.png` | 72×72 px | Small Android icon |
| `icon-96x96.png` | 96×96 px | Standard Android icon |
| `icon-128x128.png` | 128×128 px | High-res Android icon |
| `icon-144x144.png` | 144×144 px | Android tablet icon |
| `icon-152x152.png` | 152×152 px | Apple Touch Icon (iPad) |
| `icon-192x192.png` | 192×192 px | Standard PWA icon (Android) |
| `icon-384x384.png` | 384×384 px | High-res PWA icon |
| `icon-512x512.png` | 512×512 px | Maximum PWA icon (splash screens) |

### Favicon Location: `/public/favicon/`

Create these PNG files:

| Filename | Size | Purpose |
|----------|------|---------|
| `favicon-16x16.png` | 16×16 px | Browser tab (small) |
| `favicon-32x32.png` | 32×32 px | Browser tab (standard) |
| `favicon.ico` | 16×16 + 32×32 | Optional legacy format |

## Design Specifications

### Color Scheme
Use the GoBoclean brand colors:
- **Primary**: Lime Green `#84cc16`
- **Background**: White or transparent
- **Text/Details**: Dark gray or black for contrast

### Safe Zones for Maskable Icons

For icons that will be used as maskable (192×192 and 512×512), keep all important content within a safe zone:

```
For 512×512 icon:
- Total canvas: 512×512 px
- Safe zone: Center circle with diameter 410 px (80% of total)
- Content should stay within this circle

For 192×192 icon:
- Total canvas: 192×192 px
- Safe zone: Center circle with diameter 154 px (80% of total)
- Content should stay within this circle
```

This ensures your icon won't be clipped on devices that apply circular or rounded masks.

### Icon Design Tips

1. **Simplicity**: Keep the design simple and recognizable at small sizes
2. **Contrast**: Ensure good visibility on both light and dark backgrounds
3. **Branding**: Include recognizable GoBoclean elements (logo, colors)
4. **No text**: Avoid small text that becomes illegible at small sizes
5. **Padding**: Leave some breathing room around the edges (especially for maskable icons)

## Step-by-Step Icon Creation

### Option 1: Professional Design Tool (Figma, Illustrator, etc.)

1. **Create Master Icon**
   - Canvas size: 1024×1024 px
   - Design your icon with GoBoclean branding
   - Keep content within center 820×820 px circle for maskable versions
   - Use vector shapes for crisp scaling

2. **Export Sizes**
   - Export each required size as PNG with transparent background
   - Use "Export As..." and select specific dimensions
   - Save with exact filenames as listed above

3. **Place Files**
   - Move app icons to `/public/icons/`
   - Move favicons to `/public/favicon/`

### Option 2: Online Generator Tools

#### PWA Builder (Recommended)
1. Visit: https://www.pwabuilder.com/imageGenerator
2. Upload your 1024×1024 px master icon
3. Select "PWA Image Generator"
4. Download the generated package
5. Rename files to match required names
6. Place in correct folders

#### Favicon.io
1. Visit: https://favicon.io/
2. Upload your logo or create from text
3. Download favicon package
4. Extract and place in `/public/favicon/`

#### RealFaviconGenerator
1. Visit: https://realfavicongenerator.net/
2. Upload master image
3. Customize for different platforms
4. Download package
5. Extract and organize files

### Option 3: Command Line (ImageMagick)

If you have ImageMagick installed:

```bash
# Navigate to your source image directory
cd /path/to/source

# Generate app icons
convert master-1024.png -resize 72x72 icon-72x72.png
convert master-1024.png -resize 96x96 icon-96x96.png
convert master-1024.png -resize 128x128 icon-128x128.png
convert master-1024.png -resize 144x144 icon-144x144.png
convert master-1024.png -resize 152x152 icon-152x152.png
convert master-1024.png -resize 192x192 icon-192x192.png
convert master-1024.png -resize 384x384 icon-384x384.png
convert master-1024.png -resize 512x512 icon-512x512.png

# Generate favicons
convert master-1024.png -resize 16x16 favicon-16x16.png
convert master-1024.png -resize 32x32 favicon-32x32.png

# Move to correct directories
mv icon-*.png /path/to/goboclean-rapport/public/icons/
mv favicon-*.png /path/to/goboclean-rapport/public/favicon/
```

## Testing Your Icons

### 1. Build Production Version
```bash
cd /Users/julienmatondo/goboclean-rapport
npm run build
npm run start
```

### 2. Check in Browser DevTools

**Chrome/Edge:**
1. Open DevTools (F12)
2. Go to "Application" tab
3. Click "Manifest" in left sidebar
4. Verify all icons are listed and loading correctly
5. Check that orientation is set to "landscape"

**Firefox:**
1. Open DevTools (F12)
2. Go to "Application" tab
3. Click "Manifest" in left sidebar

### 3. Test Installation

**On Android:**
1. Open site in Chrome
2. Look for install prompt
3. Install the app
4. Check home screen icon
5. Verify app opens in landscape mode

**On iOS:**
1. Open site in Safari
2. Tap Share button
3. Tap "Add to Home Screen"
4. Check home screen icon
5. Verify app opens properly

**On Desktop:**
1. Look for install icon in address bar
2. Click to install
3. Check app icon in dock/taskbar
4. Verify standalone window

## Troubleshooting

### Icons not showing
- ✅ Verify files are in correct directories
- ✅ Check filenames match exactly (case-sensitive)
- ✅ Ensure files are PNG format
- ✅ Clear browser cache and reload
- ✅ Check browser console for 404 errors

### Install prompt not appearing
- ✅ Must be served over HTTPS
- ✅ Service worker must be registered
- ✅ All required icons must be present
- ✅ Try in production build, not development

### Wrong orientation
- ✅ Check `manifest.json` has `"orientation": "landscape"`
- ✅ Some devices may override orientation preference
- ✅ iOS has limited orientation control

### Blurry icons
- ✅ Use PNG format, not JPG
- ✅ Export at exact required sizes (don't rely on browser scaling)
- ✅ Use high-quality source image (1024×1024 minimum)

## Example Icon Checklist

Use this checklist when preparing your icons:

- [ ] Created 1024×1024 px master icon
- [ ] GoBoclean branding included
- [ ] Design works on light and dark backgrounds
- [ ] Safe zone observed for maskable icons (center 80%)
- [ ] Exported all 8 app icon sizes
- [ ] Placed app icons in `/public/icons/` folder
- [ ] Exported 2 favicon sizes (16×16, 32×32)
- [ ] Placed favicons in `/public/favicon/` folder
- [ ] Tested in production build
- [ ] Verified icons in browser DevTools
- [ ] Tested installation on target device
- [ ] Confirmed landscape orientation works

## Resources

- **PWA Builder Image Generator**: https://www.pwabuilder.com/imageGenerator
- **Favicon Generator**: https://favicon.io/
- **RealFaviconGenerator**: https://realfavicongenerator.net/
- **ImageMagick**: https://imagemagick.org/
- **Figma**: https://www.figma.com/
- **Web App Manifest Spec**: https://www.w3.org/TR/appmanifest/
