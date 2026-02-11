// Debug script to check query status
// Run this in the browser console to see what's blocking queries

console.log('🔍 Query Debug Script Loaded');

// Check React Query - run multiple times to catch state changes
function runDiagnostics() {
  console.group('🔍 Query Diagnostics');
  
  // 1. Check if React Query is available
  const queryClient = window.__REACT_QUERY_CLIENT__;
  if (!queryClient) {
    console.error('❌ React Query Client not found!');
    console.log('💡 This means QueryClientProvider might not be mounted');
    console.groupEnd();
    return;
  }
  console.log('✅ React Query Client found');
  
  // 2. Get all queries
  const queryCache = queryClient.getQueryCache();
  const allQueries = queryCache.getAll();
  console.log(`📊 Total queries: ${allQueries.length}`);
  
  if (allQueries.length === 0) {
    console.warn('⚠️ No queries registered yet');
    console.log('💡 Queries might not have been created yet');
  }
  
  // 3. Check query states
  const states = {
    idle: 0,
    loading: 0,
    error: 0,
    success: 0,
  };
  
  const fetchStates = {
    idle: 0,
    fetching: 0,
    paused: 0,
  };
  
  allQueries.forEach(q => {
    states[q.state.status]++;
    fetchStates[q.state.fetchStatus]++;
  });
  
  console.log('📊 Query States:', states);
  console.log('📊 Fetch States:', fetchStates);
  
  if (fetchStates.paused > 0) {
    console.error(`❌ ${fetchStates.paused} queries are PAUSED!`);
    console.log('💡 This is likely the problem - queries are paused');
  }
  
  // 4. Check specific queries
  console.log('\n📋 Query Details:');
  allQueries.forEach((q, i) => {
    const key = JSON.stringify(q.queryKey);
    console.log(`${i + 1}. ${key}`);
    console.log(`   Status: ${q.state.status}`);
    console.log(`   Fetch: ${q.state.fetchStatus}`);
    if (q.state.error) {
      console.log(`   Error: ${q.state.error.message}`);
    }
    if (q.options.enabled === false) {
      console.log(`   ⚠️ DISABLED: enabled = false`);
    }
  });
  
  // 5. Check network
  console.log('\n🌐 Network Status:');
  console.log(`   navigator.onLine: ${navigator.onLine}`);
  
  // 6. Check for recent API calls
  if (performance && performance.getEntriesByType) {
    const resources = performance.getEntriesByType('resource');
    const apiCalls = resources.filter(r => r.name.includes('localhost:3001') || r.name.includes('api'));
    console.log(`   Recent API calls: ${apiCalls.length}`);
    if (apiCalls.length > 0) {
      const recent = apiCalls.slice(-3);
      recent.forEach(call => {
        console.log(`   - ${call.name.split('?')[0]} (${Math.round(call.duration)}ms)`);
      });
    } else {
      console.warn('   ⚠️ No API calls found!');
    }
  }
  
  // 7. Summary
  console.log('\n📝 Summary:');
  if (fetchStates.paused > 0) {
    console.error('❌ PROBLEM: Queries are paused');
    console.log('💡 Check:');
    console.log('   1. networkMode should be "always"');
    console.log('   2. enabled should not be false');
    console.log('   3. No blocking code in providers');
  } else if (allQueries.length === 0) {
    console.warn('⚠️ No queries created yet');
    console.log('💡 Wait for components to mount');
  } else if (fetchStates.fetching > 0) {
    console.log('✅ Queries are fetching - this is good!');
  } else if (states.success > 0) {
    console.log('✅ Queries have data - working correctly!');
  } else {
    console.warn('⚠️ Queries exist but not fetching');
    console.log('💡 Check enabled conditions');
  }
  
  console.groupEnd();
}

// Run diagnostics multiple times to catch state changes
setTimeout(runDiagnostics, 2000);   // Initial check
setTimeout(runDiagnostics, 5000);   // After auth should complete
setTimeout(runDiagnostics, 10000);  // Final check

// Make it easy to re-run
window.debugQueries = () => {
  runDiagnostics();
};

console.log('💡 Run window.debugQueries() to check query status');
console.log('💡 Diagnostics will run at 2s, 5s, and 10s after page load');
