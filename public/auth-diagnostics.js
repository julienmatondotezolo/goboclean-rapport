// Auth diagnostics script
console.log('🔍 Auth Diagnostics Script Loaded');

function runAuthDiagnostics() {
  console.group('🔐 Auth Diagnostics');
  
  // Check Supabase client
  if (typeof window.supabase === 'undefined') {
    console.log('ℹ️ Supabase client not exposed to window (this is normal)');
  }
  
  // Check React Query
  const queryClient = window.__REACT_QUERY_CLIENT__;
  if (!queryClient) {
    console.error('❌ React Query Client not found');
    console.groupEnd();
    return;
  }
  
  // Get all queries
  const queryCache = queryClient.getQueryCache();
  const allQueries = queryCache.getAll();
  
  console.log(`📊 Total queries: ${allQueries.length}`);
  
  // Check which queries are enabled/disabled
  const enabledQueries = allQueries.filter(q => q.options.enabled !== false);
  const disabledQueries = allQueries.filter(q => q.options.enabled === false);
  
  console.log(`✅ Enabled queries: ${enabledQueries.length}`);
  console.log(`⏸️  Disabled queries: ${disabledQueries.length}`);
  
  if (disabledQueries.length > 0) {
    console.log('\n⏸️  Disabled Queries:');
    disabledQueries.forEach(q => {
      console.log(`   - ${JSON.stringify(q.queryKey)}`);
    });
    console.log('\n💡 If all queries are disabled, check:');
    console.log('   1. Is user object populated in useAuth?');
    console.log('   2. Check console for "Profile loaded successfully" message');
    console.log('   3. Check for profile fetch errors');
  }
  
  // Check for queries that should be fetching
  const pendingQueries = allQueries.filter(q => 
    q.state.status === 'pending' && 
    q.state.fetchStatus === 'idle' &&
    q.options.enabled !== false
  );
  
  if (pendingQueries.length > 0) {
    console.warn(`\n⚠️ ${pendingQueries.length} queries are pending but not fetching:`);
    pendingQueries.forEach(q => {
      console.log(`   - ${JSON.stringify(q.queryKey)}`);
    });
    console.log('\n💡 This might indicate a React Query configuration issue');
  }
  
  // Check for successful queries
  const successQueries = allQueries.filter(q => q.state.status === 'success');
  if (successQueries.length > 0) {
    console.log(`\n✅ ${successQueries.length} queries have data:`);
    successQueries.forEach(q => {
      console.log(`   - ${JSON.stringify(q.queryKey)}`);
    });
  }
  
  // Check for error queries
  const errorQueries = allQueries.filter(q => q.state.status === 'error');
  if (errorQueries.length > 0) {
    console.error(`\n❌ ${errorQueries.length} queries have errors:`);
    errorQueries.forEach(q => {
      console.error(`   - ${JSON.stringify(q.queryKey)}: ${q.state.error?.message}`);
    });
  }
  
  // Check localStorage for auth data
  console.log('\n💾 LocalStorage Check:');
  const authKeys = Object.keys(localStorage).filter(k => 
    k.includes('auth') || k.includes('supabase') || k.includes('token')
  );
  if (authKeys.length > 0) {
    console.log(`   Found ${authKeys.length} auth-related keys`);
    authKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value && value.length > 100) {
        console.log(`   - ${key}: [${value.length} chars]`);
      } else {
        console.log(`   - ${key}: ${value}`);
      }
    });
  } else {
    console.log('   No auth-related keys found');
  }
  
  console.groupEnd();
}

// Run diagnostics after a delay to let auth complete
setTimeout(runAuthDiagnostics, 3000);
setTimeout(runAuthDiagnostics, 6000);

// Make it easy to re-run
window.authDiagnostics = runAuthDiagnostics;

console.log('💡 Run window.authDiagnostics() to check auth status');
console.log('💡 Diagnostics will run at 3s and 6s after page load');
