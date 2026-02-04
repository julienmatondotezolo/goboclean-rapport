# PWA Testing Guide - Rapport by GoBoclean

## Overview
This guide helps you test your PWA installation and landscape orientation on different devices.

## Prerequisites

✅ Icons placed in `/public/icons/` folder  
✅ Favicons placed in `/public/favicon/` folder  
✅ HTTPS enabled (required for PWA)  
✅ Production build created  

## Local Testing Setup

### 1. Build for Production
```bash
cd /Users/julienmatondo/goboclean-rapport
npm run build
```

### 2. Start Production Server
```bash
npm run start
```

The app will run at `http://localhost:3000`

> **Note**: For full PWA testing, you need HTTPS. Consider using:
> - ngrok for HTTPS tunnel: `ngrok http 3000`
> - Vercel/Netlify for quick deployment
> - Local HTTPS with mkcert

## Testing Checklist

### ✅ Manifest Validation

**Chrome/Edge DevTools:**
1. Open `http://localhost:3000` (or your HTTPS URL)
2. Open DevTools (F12 or Cmd+Option+I)
3. Go to **Application** tab
4. Click **Manifest** in left sidebar
5. Verify:
   - ✅ Name: "Rapport by GoBoclean"
   - ✅ Short name: "Rapport"
   - ✅ Orientation: "landscape"
   - ✅ Display: "standalone"
   - ✅ All 8 app icons load (no 404 errors)
   - ✅ Theme color: #84cc16

**Firefox DevTools:**
1. Open DevTools (F12)
2. Go to **Application** → **Manifest**
3. Verify same details as above

### ✅ Service Worker Registration

**In DevTools:**
1. Go to **Application** tab
2. Click **Service Workers** in left sidebar
3. Verify:
   - ✅ Service worker is registered
   - ✅ Status shows "activated and running"
   - ✅ Scope is correct

### ✅ Icons Loading

**Check each icon:**
1. In DevTools → **Application** → **Manifest**
2. Click on each icon in the list
3. Verify image loads in preview
4. Check browser console for any 404 errors

**Quick Test:**
- Visit: `http://localhost:3000/icons/icon-192x192.png`
- Should display your app icon
- Repeat for all icon sizes

### ✅ Favicon Loading

**Check browser tab:**
- Browser tab should show your favicon
- Try in different browsers

**Direct access:**
- Visit: `http://localhost:3000/favicon/favicon-32x32.png`
- Should display your favicon

## Installation Testing

### 📱 Android Testing (Chrome/Edge)

**Method 1: Browser Install Prompt**
1. Open site in Chrome on Android
2. Wait for install banner to appear (or tap menu → "Install app")
3. Tap "Install"
4. App icon appears on home screen
5. Tap icon to launch

**Method 2: Manual Install**
1. Tap menu (⋮) in Chrome
2. Select "Add to Home Screen" or "Install App"
3. Name it "Rapport"
4. Confirm

**Verify:**
- ✅ App launches in landscape mode
- ✅ No browser UI visible (standalone mode)
- ✅ Status bar shows app name
- ✅ Theme color (#84cc16) visible in status bar

### 🍎 iOS Testing (Safari)

**Installation:**
1. Open site in Safari on iOS
2. Tap **Share** button (square with arrow)
3. Scroll and tap **"Add to Home Screen"**
4. Name: "Rapport"
5. Tap **"Add"**

**Verify:**
- ✅ Icon appears on home screen
- ✅ App launches from home screen
- ✅ No Safari UI visible
- ✅ App works properly

**Note:** iOS has limited support for:
- Landscape orientation lock (device rotation settings apply)
- Install prompts (manual only)
- Some PWA features

### 💻 Desktop Testing (Chrome/Edge/Safari)

**Chrome/Edge Installation:**
1. Visit site in browser
2. Look for install icon (⊕) in address bar
3. Click icon
4. Click "Install" in popup
5. App opens in new window

**Alternative:**
1. Click menu (⋮)
2. Select "Install Rapport by GoBoclean"
3. Confirm installation

**Verify:**
- ✅ App opens in standalone window
- ✅ No browser tabs or address bar
- ✅ App icon in dock/taskbar
- ✅ Can resize and use like native app
- ✅ App persists after closing

## Orientation Testing

### Expected Behavior
- App should prefer **landscape mode**
- Device can still rotate if physically turned
- Orientation is a "preference" not a "lock"

### Test Scenarios

**Tablet (recommended device):**
1. Open app
2. Hold device in landscape
3. Verify UI is optimized for landscape
4. Try rotating to portrait
5. App should work in both orientations

**Phone:**
1. Open app
2. Landscape orientation may be preferred but not forced
3. UI should be responsive

**Desktop:**
1. Orientation setting doesn't apply
2. Responsive design handles window size

## Feature Testing

### ✅ Offline Support

**Test offline functionality:**
1. Open app with internet connection
2. Navigate through pages
3. Turn off WiFi/mobile data
4. Refresh app
5. Verify:
   - ✅ App still loads
   - ✅ Previously viewed pages accessible
   - ✅ Cached data available

### ✅ Install Prompt Component

**Test custom install prompt:**
1. Open app in browser (not installed)
2. Wait 30 seconds
3. Custom install prompt should appear at bottom
4. Click "Install" → Should trigger native install
5. Click "Plus tard" → Should dismiss

**Dismiss behavior:**
1. Dismiss prompt
2. Close and reopen browser
3. Prompt should not appear again (localStorage check)

### ✅ App Shortcuts

**Test shortcuts (Android only):**
1. Long-press app icon on home screen
2. Should see shortcuts:
   - "Nouveau Rapport" → Creates new report
   - "Dashboard" → Opens dashboard
3. Tap shortcut to verify navigation

## Performance Testing

### Lighthouse Audit

**Run PWA audit:**
1. Open DevTools
2. Go to **Lighthouse** tab
3. Select:
   - ✅ Performance
   - ✅ Progressive Web App
   - ✅ Best Practices
4. Click **"Analyze page load"**

**Target Scores:**
- PWA Score: 100/100 ✅
- Performance: 90+ ✅
- Best Practices: 90+ ✅

**Common PWA checks:**
- ✅ Installable
- ✅ Offline capable
- ✅ Fast load times
- ✅ Valid manifest
- ✅ HTTPS
- ✅ Service worker

## Troubleshooting

### Install Prompt Not Showing

**Check:**
- ✅ Using HTTPS (required)
- ✅ Service worker registered
- ✅ All manifest icons present
- ✅ Running production build (not dev)
- ✅ Wait 30 seconds after page load
- ✅ Clear browser data and try again

**Force show in DevTools:**
1. DevTools → Application → Manifest
2. Click "Add to home screen" link at bottom

### Icons Not Loading (404 Errors)

**Fix:**
- Check file paths match manifest exactly
- Verify files are in `/public/icons/` and `/public/favicon/`
- Check filename case sensitivity
- Rebuild app: `npm run build`
- Clear cache: Hard reload (Cmd+Shift+R / Ctrl+Shift+R)

### App Not Opening in Landscape

**Remember:**
- Orientation is a preference, not a lock
- Device settings may override
- iOS has limited orientation control
- Test on tablet for best landscape experience
- Portrait still works, UI is responsive

### Service Worker Not Registering

**Check:**
- Running in production mode (`npm run start`, not `npm run dev`)
- Service worker is disabled in dev mode (check `next.config.js`)
- HTTPS is required for service workers (except localhost)

**Debug:**
```bash
# Check service worker in DevTools console
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Registered:', registrations);
});
```

### App Not Offline

**Verify:**
1. Service worker is active
2. Cache is populated (visit pages first)
3. Network requests are being intercepted
4. Check DevTools → Application → Cache Storage

## Testing on Multiple Devices

### Recommended Test Matrix

| Device Type | OS | Browser | Priority |
|-------------|----|---------|----|
| Tablet | Android 10+ | Chrome | ⭐⭐⭐ High |
| Tablet | iOS 14+ | Safari | ⭐⭐⭐ High |
| Phone | Android 10+ | Chrome | ⭐⭐ Medium |
| Phone | iOS 14+ | Safari | ⭐⭐ Medium |
| Desktop | Windows | Chrome | ⭐ Low |
| Desktop | macOS | Safari | ⭐ Low |

### Remote Testing Tools

**BrowserStack** (paid):
- Test on real devices remotely
- Multiple OS/browser combinations
- https://www.browserstack.com/

**LambdaTest** (freemium):
- Similar to BrowserStack
- Free tier available
- https://www.lambdatest.com/

**PWA Builder** (free):
- Validate your PWA
- Test installability
- https://www.pwabuilder.com/

## Production Deployment

Once testing is complete:

1. ✅ All icons present and loading
2. ✅ Manifest validates correctly
3. ✅ Service worker registers
4. ✅ Installable on target devices
5. ✅ Offline mode works
6. ✅ Landscape orientation preferred
7. ✅ Lighthouse PWA score 100/100

**Deploy to:**
- Vercel (recommended for Next.js)
- Netlify
- Your own server with HTTPS

## Quick Commands

```bash
# Development (PWA disabled)
npm run dev

# Production build
npm run build

# Production server
npm run start

# Test manifest (after starting server)
curl http://localhost:3000/manifest.json

# Test icons (after starting server)
curl http://localhost:3000/icons/icon-192x192.png

# Check service worker registration
# Open browser console and run:
navigator.serviceWorker.getRegistrations()
```

## Support Resources

- **PWA Documentation**: https://web.dev/progressive-web-apps/
- **Next.js PWA**: https://ducanh-next-pwa.vercel.app/
- **Manifest Docs**: https://developer.mozilla.org/en-US/docs/Web/Manifest
- **Service Workers**: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- **Chrome DevTools**: https://developer.chrome.com/docs/devtools/progressive-web-apps/

---

**Happy Testing! 🚀**

Once everything works, your users can install "Rapport by GoBoclean" as a native-like app with landscape orientation for the best field work experience.
