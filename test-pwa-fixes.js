/**
 * PWA Fix Testing Script
 * Tests the critical fixes for Safari service worker issues
 */

const https = require('https');
const http = require('http');

// Test URLs
const PRODUCTION_URL = 'https://goboclean-rapport.vercel.app';
const LOCAL_URL = 'http://localhost:3000';

console.log('🧪 Testing PWA fixes for Goboclean Rapport...\n');

// Test 1: Check if service worker is accessible
async function testServiceWorker(baseUrl) {
  return new Promise((resolve) => {
    const swUrl = `${baseUrl}/sw.js`;
    const client = baseUrl.startsWith('https') ? https : http;
    
    console.log(`📋 Testing service worker at: ${swUrl}`);
    
    client.get(swUrl, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Service worker accessible');
        resolve(true);
      } else {
        console.log(`❌ Service worker failed with status: ${res.statusCode}`);
        resolve(false);
      }
    }).on('error', (err) => {
      console.log(`❌ Service worker error: ${err.message}`);
      resolve(false);
    });
  });
}

// Test 2: Check if manifest.json is valid
async function testManifest(baseUrl) {
  return new Promise((resolve) => {
    const manifestUrl = `${baseUrl}/manifest.json`;
    const client = baseUrl.startsWith('https') ? https : http;
    
    console.log(`📋 Testing manifest at: ${manifestUrl}`);
    
    client.get(manifestUrl, (res) => {
      if (res.statusCode === 200) {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const manifest = JSON.parse(data);
            if (manifest.name && manifest.start_url && manifest.icons) {
              console.log('✅ Manifest is valid');
              console.log(`   - Name: ${manifest.name}`);
              console.log(`   - Start URL: ${manifest.start_url}`);
              console.log(`   - Icons: ${manifest.icons.length} icons`);
              resolve(true);
            } else {
              console.log('❌ Manifest missing required fields');
              resolve(false);
            }
          } catch (err) {
            console.log('❌ Manifest JSON parse error');
            resolve(false);
          }
        });
      } else {
        console.log(`❌ Manifest failed with status: ${res.statusCode}`);
        resolve(false);
      }
    }).on('error', (err) => {
      console.log(`❌ Manifest error: ${err.message}`);
      resolve(false);
    });
  });
}

// Test 3: Check if main page redirects properly
async function testRedirect(baseUrl) {
  return new Promise((resolve) => {
    const client = baseUrl.startsWith('https') ? https : http;
    
    console.log(`📋 Testing redirect from: ${baseUrl}`);
    
    client.get(baseUrl, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
        const location = res.headers.location;
        console.log(`✅ Redirect working (${res.statusCode} -> ${location})`);
        resolve(true);
      } else if (res.statusCode === 200) {
        console.log('✅ Page loads directly (no redirect needed)');
        resolve(true);
      } else {
        console.log(`❌ Unexpected status: ${res.statusCode}`);
        resolve(false);
      }
    }).on('error', (err) => {
      console.log(`❌ Redirect test error: ${err.message}`);
      resolve(false);
    });
  });
}

// Test 4: Check if backend API is accessible  
async function testBackendConnection() {
  return new Promise((resolve) => {
    console.log(`📋 Testing backend connection: https://api.goboclean.be`);
    
    https.get('https://api.goboclean.be/', (res) => {
      console.log(`✅ Backend responding with status: ${res.statusCode}`);
      resolve(true);
    }).on('error', (err) => {
      console.log(`❌ Backend connection error: ${err.message}`);
      resolve(false);
    });
  });
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting PWA validation tests...\n');
  
  let localTests = true;
  let productionTests = true;
  
  // Test local server
  console.log('=== LOCAL TESTS ===');
  localTests &= await testServiceWorker(LOCAL_URL);
  localTests &= await testManifest(LOCAL_URL);
  localTests &= await testRedirect(LOCAL_URL);
  
  console.log('\n=== PRODUCTION TESTS ===');
  productionTests &= await testServiceWorker(PRODUCTION_URL);
  productionTests &= await testManifest(PRODUCTION_URL);
  productionTests &= await testRedirect(PRODUCTION_URL);
  
  console.log('\n=== BACKEND TESTS ===');
  const backendOk = await testBackendConnection();
  
  console.log('\n🏁 RESULTS:');
  console.log(`Local PWA: ${localTests ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Production PWA: ${productionTests ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Backend API: ${backendOk ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = localTests && productionTests && backendOk;
  
  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED! PWA fixes are working correctly.');
    console.log('\n📱 Ready for mobile Safari testing!');
    console.log('\nNext steps:');
    console.log('1. Test on actual mobile Safari device');
    console.log('2. Test PWA install prompt');
    console.log('3. Test offline functionality');
    console.log('4. Test service worker caching');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the output above.');
  }
  
  process.exit(allPassed ? 0 : 1);
}

runTests().catch(console.error);