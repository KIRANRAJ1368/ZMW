// Test wishlist logic: normalization, toggling, duplication prevention, and persistence
function testWishlistLogic() {
  console.log('====================================================');
  console.log('🧪 TESTING WISHLIST LOGIC & PERSISTENCE');
  console.log('====================================================\n');

  let state = [];

  function isInWishlist(productId) {
    if (productId === undefined || productId === null) return false;
    return state.some((id) => String(id) === String(productId));
  }

  function toggleWishlist(productId) {
    if (productId === undefined || productId === null) return;
    const target = String(productId);
    const exists = state.some((id) => String(id) === target);
    if (exists) {
      state = state.filter((id) => String(id) !== target);
    } else {
      state = [...state, target];
    }
  }

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

  // Initial state empty
  assert(state.length === 0, 'Wishlist starts empty without stale phantom items');

  // Add numeric ID 2
  toggleWishlist(2);
  assert(isInWishlist(2) && isInWishlist("2"), 'Item 2 recognized as both number and string');
  assert(state.length === 1, 'Wishlist count is 1');

  // Toggle numeric ID 2 again -> should remove
  toggleWishlist("2");
  assert(!isInWishlist(2) && state.length === 0, 'Toggling item with string removes it cleanly');

  // Add multiple items
  toggleWishlist(1);
  toggleWishlist(2);
  toggleWishlist(5);
  assert(state.length === 3, 'Multiple items added cleanly (1, 2, 5)');

  // Duplicate toggle attempt
  toggleWishlist("1"); // removes 1
  assert(!isInWishlist(1) && state.length === 2, 'Item 1 removed, remaining count 2');

  // Persistence simulation (localStorage JSON serialize and deserialize)
  const serialized = JSON.stringify(state);
  const reloadedState = JSON.parse(serialized);
  state = reloadedState;
  assert(isInWishlist(2) && isInWishlist(5), 'Persisted state survives reload and keeps items');

  console.log('\n====================================================');
  console.log(`WISHLIST TESTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');
}

testWishlistLogic();
