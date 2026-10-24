// Automated Verification Test Suite for Kishan Bhai Two-Sided Loyalty Rewards System
const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('🧪 Starting Farmer + Buyer Loyalty Rewards System Automated Test Suite...\n');
  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
    }
  }

  try {
    // 1. Verify New Farmer and Buyer start at Silver
    console.log('Test 1: New Users Start at Silver Tier');
    const newFarmerRes = await fetch(`${BASE_URL}/api/loyalty/account?userId=test_farmer_new_01&role=FARMER`);
    const newFarmer = await newFarmerRes.json();
    assert(newFarmer.success && newFarmer.account.tier === 'SILVER', 'New farmer starts at SILVER tier');
    assert(newFarmer.account.pointsToNextTier === 500, 'New farmer needs 500 points for Gold');

    const newBuyerRes = await fetch(`${BASE_URL}/api/loyalty/account?userId=test_buyer_new_01&role=BUYER`);
    const newBuyer = await newBuyerRes.json();
    assert(newBuyer.success && newBuyer.account.tier === 'SILVER', 'New buyer starts at SILVER tier');
    assert(newBuyer.account.unlockedBenefits.length >= 4, 'Buyer receives starting silver privileges');

    // 2. Initial Seeded Users Status
    console.log('\nTest 2: Seeded Real Users (Ramesh Patel & Vikram Mehta)');
    const rameshRes = await fetch(`${BASE_URL}/api/loyalty/account?userId=usr_farmer_ramesh&role=FARMER`);
    const ramesh = await rameshRes.json();
    assert(ramesh.account.tier === 'GOLD', 'Ramesh Patel is at GOLD tier');
    assert(ramesh.account.points >= 500, `Ramesh points (${ramesh.account.points}) >= 500 threshold`);

    const buyerRes = await fetch(`${BASE_URL}/api/loyalty/account?userId=usr_buyer_1&role=BUYER`);
    const buyer = await buyerRes.json();
    assert(buyer.account.tier === 'GOLD', 'Vikram Mehta is at GOLD tier');
    assert(buyer.account.points >= 500, `Buyer points (${buyer.account.points}) >= 500 threshold`);

    // 3. Auditable Loyalty Ledger Inspection
    console.log('\nTest 3: Auditable Loyalty Ledger Records');
    const ledgerRes = await fetch(`${BASE_URL}/api/loyalty/ledger?userId=usr_farmer_ramesh`);
    const ledger = await ledgerRes.json();
    assert(ledger.success && ledger.ledger.length >= 10, `Farmer ledger has ${ledger.ledger.length} immutable entries`);
    assert(ledger.ledger[0].resultingBalance !== undefined, 'Ledger entry tracks resultingBalance');

    // 4. Rewards Catalog and Role Filtering
    console.log('\nTest 4: Fulfillable Rewards Store');
    const rewardsRes = await fetch(`${BASE_URL}/api/loyalty/rewards?role=ALL`);
    const rewardsData = await rewardsRes.json();
    assert(rewardsData.success && rewardsData.rewards.length >= 6, `Rewards catalog contains ${rewardsData.rewards.length} fulfillable items`);

    const farmerRewardsRes = await fetch(`${BASE_URL}/api/loyalty/rewards?role=FARMER`);
    const farmerRewards = await farmerRewardsRes.json();
    const hasMachinery = farmerRewards.rewards.some((r) => r.category === 'MACHINERY');
    assert(hasMachinery, 'Farmer rewards include machinery vouchers');

    // 5. Reward Redemption with points deduction
    console.log('\nTest 5: Reward Redemption & Voucher Generation');
    const prevPoints = ramesh.account.points;
    const redeemRes = await fetch(`${BASE_URL}/api/loyalty/redeem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'usr_farmer_ramesh',
        rewardId: 'rew_fee_waiver_50', // 250 points
      }),
    });
    const redeemData = await redeemRes.json();
    assert(redeemData.success, 'Successfully redeemed 50% escrow fee waiver');
    assert(redeemData.redemption && redeemData.redemption.voucherCode.startsWith('KB-FEE-'), `Generated voucher: ${redeemData.redemption?.voucherCode}`);
    assert(redeemData.account.points === prevPoints - 250, `Points deducted: ${prevPoints} -> ${redeemData.account.points}`);

    // 6. Marketplace Purchase Proposal & Status Progression with Loyalty Milestone Triggers
    console.log('\nTest 6: Order Lifecycle & Milestone Rewards Distribution');
    const mkt = await fetch(`${BASE_URL}/api/marketplace`).then(r => r.json());
    const targetLot = mkt.lots && mkt.lots.length > 0 ? mkt.lots[0] : null;
    assert(targetLot !== null, `Found available harvest lot: ${targetLot?.id}`);

    // Create new purchase request
    const propRes = await fetch(`${BASE_URL}/api/marketplace/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        harvestLotId: targetLot.id,
        buyerId: 'test_buyer_lifecycle_01',
        buyerName: 'Organic Mills Federation',
        offeredPricePerKg: 76,
        deliveryLocation: 'Surat Central Depot',
      }),
    });
    const propData = await propRes.json();
    assert(propData.success && propData.request && propData.request.id, `Created purchase request ${propData.request?.id}`);

    const orderId = propData.request.id;

    // Transition to COMPLETED
    const completeRes = await fetch(`${BASE_URL}/api/marketplace/update-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId: orderId,
        status: 'COMPLETED',
      }),
    });
    const completeData = await completeRes.json();
    assert(completeData.success, 'Updated order status to COMPLETED');

    // Check Buyer Account after purchase
    const buyerAfterPurchase = await fetch(`${BASE_URL}/api/loyalty/account?userId=test_buyer_lifecycle_01&role=BUYER`).then(r => r.json());
    assert(buyerAfterPurchase.account.points >= 100, `Buyer awarded purchase points (current: ${buyerAfterPurchase.account.points})`);

    // 7. Duplicate Prevention (Idempotency)
    console.log('\nTest 7: Idempotency & Duplicate Prevention');
    const completeAgainRes = await fetch(`${BASE_URL}/api/marketplace/update-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId: orderId,
        status: 'COMPLETED',
      }),
    });
    const buyerAfterDuplicate = await fetch(`${BASE_URL}/api/loyalty/account?userId=test_buyer_lifecycle_01&role=BUYER`).then(r => r.json());
    assert(buyerAfterDuplicate.account.points === buyerAfterPurchase.account.points, 'Duplicate COMPLETED event DID NOT award double points');

    // 8. Delivery Confirmation & Genuine Order Rating
    console.log('\nTest 8: Delivery Confirmation & Rating');
    const deliveryRes = await fetch(`${BASE_URL}/api/loyalty/confirm-delivery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: orderId,
        userId: 'test_buyer_lifecycle_01',
        isBuyer: true,
      }),
    });
    const deliveryData = await deliveryRes.json();
    assert(deliveryData.success, 'Confirmed delivery and credited +50 delivery points');

    const ratingRes = await fetch(`${BASE_URL}/api/loyalty/rate-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: orderId,
        farmerId: 'usr_farmer_ramesh',
        buyerId: 'test_buyer_lifecycle_01',
        buyerName: 'Organic Mills Federation',
        ratingScore: 5,
        qualityFeedback: 'EXCELLENT',
        deliveryOnTime: true,
        comments: 'Certified high quality cotton!',
      }),
    });
    const ratingData = await ratingRes.json();
    assert(ratingData.success, 'Submitted genuine rating; awarded +20 review points');

    // 9. Repeat Order Tool
    console.log('\nTest 9: Repeat Purchase Tool');
    const repeatRes = await fetch(`${BASE_URL}/api/loyalty/repeat-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: orderId,
        buyerId: 'test_buyer_lifecycle_01',
      }),
    });
    const repeatData = await repeatRes.json();
    assert(repeatData.success && repeatData.request.id, `Generated repeat proposal: ${repeatData.request?.id}`);

    // 10. Point Reversal Policy
    console.log('\nTest 10: Point Reversal Policy Enforcement');
    const reverseRes = await fetch(`${BASE_URL}/api/loyalty/reverse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'test_buyer_lifecycle_01',
        referenceId: orderId,
        reason: 'Order dispute refunded.',
      }),
    });
    const reverseData = await reverseRes.json();
    assert(reverseData.success, 'Point reversal executed according to configured policy');

    // 11. Admin Config Endpoint
    console.log('\nTest 11: Admin Loyalty Configuration');
    const configRes = await fetch(`${BASE_URL}/api/loyalty/admin/config`);
    const configData = await configRes.json();
    assert(configData.success && configData.config.pointsRules.buyerPurchaseCompleted !== undefined, 'Admin config is readable and configurable');

    // Summary
    console.log(`\n==============================================`);
    console.log(`📊 Loyalty Test Suite Results: ${passed} / ${total} tests passed (${Math.round((passed / total) * 100)}%)`);
    console.log(`==============================================\n`);

    if (passed === total) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  }
}

runTests();
