import { defineConfig, devices } from '@playwright/test';

/**
 * OPTIMIZED PLAYWRIGHT CONFIGURATION FOR E2E AUTHENTICATION
 * 
 * Configured for bulletproof E2E testing with fast authentication,
 * reliable mission workflows, and comprehensive error handling.
 */

export default defineConfig({
  testDir: './e2e',
  
  // Test execution settings
  fullyParallel: false, // Sequential execution for mission workflow tests
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0, // Retry on CI, fail-fast locally
  workers: process.env.CI ? 2 : 1, // Limited workers for auth session isolation
  
  // Timeouts optimized for fast auth
  timeout: 120_000, // 2 minutes max per test (reduced from 3)
  maxFailures: 5, // Allow more failures for debugging
  
  expect: {
    timeout: 10_000, // Faster expectations with reliable auth
  },
  
  // Enhanced reporting
  reporter: [
    ['list', { printSteps: true }], 
    ['html', { 
      open: 'never', 
      outputFolder: 'playwright-report',
      host: 'localhost',
      port: 9323,
    }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }], // For CI integration
  ],
  
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    
    // Enhanced debugging options
    trace: process.env.CI ? 'retain-on-failure' : 'on-first-retry',
    screenshot: 'only-on-failure',
    video: process.env.CI ? 'retain-on-failure' : 'off', // Reduce local storage
    
    // Locale and performance settings
    locale: 'fr',
    timezoneId: 'Europe/Brussels',
    
    // Optimized timeouts for fast auth
    actionTimeout: 10_000, // Reduced from 15s
    navigationTimeout: 15_000, // Reduced from 20s
    
    // Reliability settings
    ignoreHTTPSErrors: true,
    bypassCSP: true,
    
    // Headers for debugging
    extraHTTPHeaders: {
      'X-Test-Run': 'playwright-e2e-optimized',
      'X-Auth-Mode': 'fast-token-injection',
    },
    
    // Optimized for auth performance
    storageState: undefined, // Clean slate for each test
  },
  
  // Test environment setup
  globalSetup: './e2e/global-setup.ts', // Will create this
  globalTeardown: './e2e/global-teardown.ts', // Will create this
  
  projects: [
    // Fast authentication tests
    {
      name: 'fast-auth-tests',
      use: {
        ...devices['Desktop Chrome'],
        browserName: 'chromium',
        viewport: { width: 1280, height: 800 },
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-features=TranslateUI',
            '--disable-ipc-flooding-protection',
            '--disable-blink-features=AutomationControlled',
          ],
        },
      },
      testMatch: [
        '**/fast-auth-demo.spec.ts',
        '**/auth-*.spec.ts',
        '**/test-*-auth*.spec.ts',
      ],
    },
    
    // Mission workflow tests (priority)
    {
      name: 'mission-workflow',
      use: {
        ...devices['Desktop Chrome'],
        browserName: 'chromium',
        viewport: { width: 1280, height: 800 },
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-features=VizDisplayCompositor',
            '--disable-blink-features=AutomationControlled',
            '--mute-audio', // Prevent audio issues in headless
          ],
        },
      },
      testMatch: [
        '**/complete-mission-workflow-fixed.spec.ts',
        '**/mission-*.spec.ts',
        '**/workflow-*.spec.ts',
      ],
      dependencies: ['fast-auth-tests'], // Run auth tests first
    },
    
    // Comprehensive E2E tests
    {
      name: 'comprehensive-e2e',
      use: {
        ...devices['Desktop Chrome'],
        browserName: 'chromium',
        viewport: { width: 1280, height: 800 },
      },
      testIgnore: [
        '**/fast-auth-demo.spec.ts',
        '**/complete-mission-workflow-fixed.spec.ts',
        '**/complete-mission-workflow.spec.ts', // Ignore old version
      ],
      dependencies: ['mission-workflow'],
    },
    
    // Mobile testing (subset)
    {
      name: 'mobile-critical',
      use: {
        ...devices['iPhone 12'],
        browserName: 'chromium',
      },
      testMatch: [
        '**/fast-auth-demo.spec.ts',
        '**/login-*.spec.ts',
        '**/auth-guard.spec.ts',
      ],
    },
    
    // Firefox testing (auth compatibility)
    {
      name: 'firefox-auth',
      use: {
        ...devices['Desktop Firefox'],
        browserName: 'firefox',
      },
      testMatch: [
        '**/fast-auth-demo.spec.ts',
      ],
    },
  ],
  
  /* Development server configuration */
  webServer: process.env.SKIP_DEV_SERVER ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
    env: {
      // Optimize Next.js for testing
      NODE_ENV: 'test',
      NEXT_TELEMETRY_DISABLED: '1',
      // Supabase configuration for tests
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      // Test user credentials
      ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@goboclean.be',
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'GoBo2026!Admin',
      WORKER_EMAIL: process.env.WORKER_EMAIL || 'worker@goboclean.be',
      WORKER_PASSWORD: process.env.WORKER_PASSWORD || 'GoBo2026!Worker',
    },
  },
});