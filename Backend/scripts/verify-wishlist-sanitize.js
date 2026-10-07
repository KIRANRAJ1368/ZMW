function testWishlistSanitizationAndLogic() {
  console.log('====================================================');
  console.log('🧪 TESTING WISHLIST PURGE & SANITIZATION LOGIC');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Initial State Filter Test: Discard legacy mock IDs
  function parseInitialWishlist(rawSaved) {
    if (!rawSaved) return [];
    try {
      const parsed = JSON.parse(rawSaved);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map(String)
        .filter((id) => {
          if (!id) return false;
          const clean = id.trim().toLowerCase();
          if (clean.startsWith('zmw-')) return false;
          return /^\d+$/.test(clean);
        });
    } catch {
      return [];
    }
  }

  // Test: User has old mock IDs in localStorage
  const legacyMockStorage1 = JSON.stringify(['zmw-001']);
  assert(parseInitialWishlist(legacyMockStorage1).length === 0, 'Legacy ID "zmw-001" is stripped out (Count: 0)');

  const legacyMockStorage2 = JSON.stringify(['zmw-002', 'zmw-005', 'zmw-m01']);
  assert(parseInitialWishlist(legacyMockStorage2).length === 0, 'Legacy IDs ["zmw-002", "zmw-005", "zmw-m01"] all stripped out (Count: 0)');

  const mixedStorage = JSON.stringify(['zmw-001', '2', 'invalid_str', '15']);
  const mixedResult = parseInitialWishlist(mixedStorage);
  assert(mixedResult.length === 2 && mixedResult.includes('2') && mixedResult.includes('15'), 'Mixed storage retains only valid numeric database IDs [2, 15]');

  // 2. Active Catalog Cross-Verification (Auto-Prune)
  const activeCatalogMap = new Map([
    ['2', { id: 2, name: 'T-Shirt 2' }],
    ['5', { id: 5, name: 'Polo 5' }]
  ]);

  let currentWishlist = ['2', '999']; // 999 does not exist in catalog
  function autoPruneWishlist(list, catalogMap) {
    return list.filter((id) => {
      const str = String(id).trim();
      if (!str || str.toLowerCase().startsWith('zmw-') || !/^\d+$/.test(str)) return false;
      return catalogMap.has(str);
    });
  }

  const pruned = autoPruneWishlist(currentWishlist, activeCatalogMap);
  assert(pruned.length === 1 && pruned[0] === '2', 'Orphaned ID 999 is pruned out; only valid product 2 remains');

  // 3. Badge Count Match Test
  function computeWishlistCount(list, catalogMap) {
    return list.filter((id) => catalogMap.has(String(id))).length;
  }
  assert(computeWishlistCount(pruned, activeCatalogMap) === 1, 'Navbar badge count reflects exactly 1 for valid saved product');
  assert(computeWishlistCount([], activeCatalogMap) === 0, 'Empty wishlist yields badge count 0');

  console.log('\n====================================================');
  console.log(`TOTAL SANITIZATION TESTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) process.exit(1);
}

testWishlistSanitizationAndLogic();
