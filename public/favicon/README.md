# Favicon Files for Rapport by GoBoclean

## Required Files

Place your favicon files in this folder:

### Required Sizes
- `favicon-16x16.png` - 16×16 pixels (browser tab, small)
- `favicon-32x32.png` - 32×32 pixels (browser tab, standard)
- `favicon.ico` - Optional combined ICO file (contains both 16×16 and 32×32)

## Design Guidelines

### Favicon Design
- Keep it simple - favicons are very small
- Use recognizable branding element (e.g., "G" or simplified logo)
- Ensure good contrast
- Test on both light and dark browser themes

### Colors
- Primary: Lime Green (#84cc16)
- Use solid colors for better visibility at small sizes
- Avoid fine details that won't be visible

## Generation Tools

### Online Tools
- **Favicon.io**: https://favicon.io/
  - Can convert PNG to ICO
  - Generate from text or emoji
  
- **RealFaviconGenerator**: https://realfavicongenerator.net/
  - Comprehensive favicon package
  - Preview on different platforms

### Manual Creation
1. Design a 32×32 pixel icon in your image editor
2. Save as PNG with transparent background
3. Create 16×16 version (scaled down or simplified)
4. Optionally combine into `.ico` format

## Testing
1. Add files to this folder
2. Restart dev server or rebuild
3. Check browser tab for favicon
4. Test on different browsers (Chrome, Firefox, Safari, Edge)

## File Format Notes

- **PNG**: Modern browsers support PNG favicons
- **ICO**: Legacy format, contains multiple sizes in one file
- **SVG**: Some browsers support SVG favicons (not included in basic setup)

Place your favicon files here and they'll automatically be used by the app.
