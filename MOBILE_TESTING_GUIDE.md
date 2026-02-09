# 📱 Mobile Safari PWA Testing Guide

## Critical Tests for Safari PWA

### 1. Basic PWA Installation
1. Open Safari on iOS device
2. Navigate to: https://goboclean-rapport.vercel.app
3. Tap the Share button (square with arrow)
4. Look for "Add to Home Screen" option
5. ✅ Should show PWA icon and name "Rapport by GoBoclean"
6. Install the PWA

### 2. Service Worker Functionality
1. Open the installed PWA
2. Go to Settings → Privacy & Security → Website Data
3. Look for goboclean-rapport.vercel.app
4. ✅ Should show cached data/service worker active

### 3. Offline Functionality Test
1. Open the PWA
2. Navigate through a few pages (login, dashboard if accessible)
3. Turn OFF WiFi and cellular data
4. Try navigating or refreshing
5. ✅ Should show cached content, not browser error page

### 4. Redirect Handling (Critical Fix)
1. Open PWA or Safari directly to: https://goboclean-rapport.vercel.app
2. ✅ Should redirect to /fr without errors
3. ✅ No "Response served by service worker has redirections" error
4. ✅ No infinite redirect loops

### 5. Background App Switching
1. Open the PWA
2. Switch to another app
3. Return to PWA after 30+ seconds
4. ✅ Should resume properly, no crashes

### 6. Push Notifications (if implemented)
1. Grant notification permissions in PWA
2. Test notification delivery
3. ✅ Should receive and display correctly

### 7. Form Functionality
1. Try login form with credentials
2. Test any form submissions
3. ✅ Should work without service worker interference

## Previous Error Symptoms (Should be FIXED)
- ❌ "Response served by service worker has redirections"
- ❌ PWA crashing on startup
- ❌ Infinite redirect loops
- ❌ Service worker registration failures
- ❌ Cached redirects causing loops

## If Issues Persist

### Debug Steps:
1. **Clear PWA Cache**:
   - Settings → Safari → Clear History and Website Data
   - Or: Settings → General → iPhone Storage → Safari → Website Data

2. **Check Developer Console** (if using Safari Web Inspector):
   - Look for service worker registration errors
   - Check network requests for failed redirects
   - Verify manifest.json loads correctly

3. **Test in Private Browsing**:
   - Open private tab in Safari
   - Navigate to PWA URL
   - Should work without cached service worker

### Emergency Recovery:
If PWA still crashes, access: https://goboclean-rapport.vercel.app/clear-db.html
This will clear all stored data and reset the PWA state.

## Success Criteria ✅

- [ ] PWA installs without errors
- [ ] No redirect error messages
- [ ] Service worker registers successfully  
- [ ] Offline caching works
- [ ] App doesn't crash on Safari
- [ ] Login/forms work correctly
- [ ] Background/foreground switching stable

## Contact Info
If issues persist, report with:
- iOS version
- Safari version  
- Exact error messages
- Steps to reproduce
- Screenshot of error (if possible)