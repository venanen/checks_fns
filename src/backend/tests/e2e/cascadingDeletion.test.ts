import fetch from 'node-fetch';
import User from '../../models/User';
import Trip from '../../models/Trip';
import Check from '../../models/Check';
import Good from '../../models/Good';

/**
 * Test for Cascading Deletion
 *
 * This test verifies that when an entity is deleted, all related entities are also deleted:
 * 1. When a user is deleted, all their trips, checks, and goods are deleted
 * 2. When a trip is deleted, all its checks and goods are deleted
 * 3. When a check is deleted, all its goods are deleted
 */

// Base URL for API requests
const API_URL = 'http://localhost:7000/api';

// Test data
const testUser = {
  login: `test_cascade_${Date.now()}`,
  password: 'test_password'
};

/**
 * Main test function
 */
async function runCascadingDeletionTest() {
  try {
    console.log('Starting Cascading Deletion Test...');

    // Test 1: User deletion cascades to trips, checks, and goods
    await testUserDeletion();

    // Test 2: Trip deletion cascades to checks and goods
    await testTripDeletion();

    // Test 3: Check deletion cascades to goods
    await testCheckDeletion();

    console.log('Cascading Deletion Test completed successfully!');
  } catch (error) {
    console.error('Cascading Deletion Test failed:', error);
  }
}

/**
 * Test 1: User deletion cascades to trips, checks, and goods
 */
async function testUserDeletion() {
  console.log('\n--- Testing User Deletion Cascade ---');

  // Create test data
  const { userId, tripId, checkId, goodIds } = await createTestData('user_deletion_test');

  // Verify data exists before deletion
  await verifyDataExists(userId, tripId, checkId, goodIds);

  // Delete the user
  console.log(`Deleting user with ID: ${userId}`);
  const deleted = await User.delete(userId);
  console.log(`User deletion result: ${deleted}`);

  // Verify all related data is deleted
  await verifyDataDeleted(userId, tripId, checkId, goodIds);

  console.log('User deletion cascade test passed!');
}

/**
 * Test 2: Trip deletion cascades to checks and goods
 */
async function testTripDeletion() {
  console.log('\n--- Testing Trip Deletion Cascade ---');

  // Create test data
  const { userId, tripId, checkId, goodIds } = await createTestData('trip_deletion_test');

  // Verify data exists before deletion
  await verifyDataExists(userId, tripId, checkId, goodIds);

  // Delete the trip
  console.log(`Deleting trip with ID: ${tripId}`);
  const deleted = await Trip.delete(tripId);
  console.log(`Trip deletion result: ${deleted}`);

  // Verify trip, checks, and goods are deleted, but user still exists
  const userExists = await User.getById(userId) !== null;
  const tripExists = await Trip.getById(tripId) !== null;
  const checkExists = await Check.getById(checkId) !== null;
  const goodsExist = await Promise.all(goodIds.map(id => Good.getById(id) !== null));

  console.log(`After deletion - User exists: ${userExists}, Trip exists: ${tripExists}, Check exists: ${checkExists}, Goods exist: ${goodsExist.some(exists => exists)}`);

  if (!userExists) {
    throw new Error('User was incorrectly deleted during trip deletion');
  }

  if (tripExists || checkExists || goodsExist.some(exists => exists)) {
    throw new Error('Trip deletion cascade failed');
  }

  // Clean up the user
  await User.delete(userId);

  console.log('Trip deletion cascade test passed!');
}

/**
 * Test 3: Check deletion cascades to goods
 */
async function testCheckDeletion() {
  console.log('\n--- Testing Check Deletion Cascade ---');

  // Create test data
  const { userId, tripId, checkId, goodIds } = await createTestData('check_deletion_test');

  // Verify data exists before deletion
  await verifyDataExists(userId, tripId, checkId, goodIds);

  // Delete the check
  console.log(`Deleting check with ID: ${checkId}`);
  const deleted = await Check.delete(checkId);
  console.log(`Check deletion result: ${deleted}`);

  // Verify check and goods are deleted, but user and trip still exist
  const userExists = await User.getById(userId) !== null;
  const tripExists = await Trip.getById(tripId) !== null;
  const checkExists = await Check.getById(checkId) !== null;
  const goodsExist = await Promise.all(goodIds.map(id => Good.getById(id) !== null));

  console.log(`After deletion - User exists: ${userExists}, Trip exists: ${tripExists}, Check exists: ${checkExists}, Goods exist: ${goodsExist.some(exists => exists)}`);

  if (!userExists || !tripExists) {
    throw new Error('User or Trip was incorrectly deleted during check deletion');
  }

  if (checkExists || goodsExist.some(exists => exists)) {
    throw new Error('Check deletion cascade failed');
  }

  // Clean up the user and trip
  await Trip.delete(tripId);
  await User.delete(userId);

  console.log('Check deletion cascade test passed!');
}

/**
 * Helper function to create test data
 */
async function createTestData(testName: string) {
  console.log(`Creating test data for ${testName}`);

  // Create user
  const user = {
    login: `${testName}_${Date.now()}`,
    password: 'test_password'
  };

  await User.register(user.login, user.password);
  const createdUser = await User.getByLogin(user.login);
  if (!createdUser || !createdUser.USER_ID) {
    throw new Error('Failed to create test user');
  }
  const userId = createdUser.USER_ID;

  // Create trip
  const trip = {
    USER_ID: userId,
    NAME: `Test Trip for ${testName}`
  };

  const createdTrip = await Trip.create(trip);
  if (!createdTrip || !createdTrip.TRIP_ID) {
    throw new Error('Failed to create test trip');
  }
  const tripId = createdTrip.TRIP_ID;

  // Create check
  const check = {
    TRIP_ID: tripId,
    USER_ID: userId,
    CHECK_SUM: 100
  };

  const createdCheck = await Check.create(check);
  if (!createdCheck || !createdCheck.CHECK_ID) {
    throw new Error('Failed to create test check');
  }
  const checkId = createdCheck.CHECK_ID;

  // Create goods
  const goods = [
    {
      CHECK_ID: checkId,
      NAME: `Test Good 1 for ${testName}`,
      PRICE: 50,
      QUANTITY: 1
    },
    {
      CHECK_ID: checkId,
      NAME: `Test Good 2 for ${testName}`,
      PRICE: 50,
      QUANTITY: 1
    }
  ];

  const goodIds: number[] = [];
  for (const good of goods) {
    const createdGood = await Good.create(good);
    if (!createdGood || !createdGood.GOOD_ID) {
      throw new Error('Failed to create test good');
    }
    goodIds.push(createdGood.GOOD_ID);
  }

  console.log(`Created test data - User ID: ${userId}, Trip ID: ${tripId}, Check ID: ${checkId}, Good IDs: ${goodIds.join(', ')}`);

  return { userId, tripId, checkId, goodIds };
}

/**
 * Helper function to verify data exists
 */
async function verifyDataExists(userId: number, tripId: number, checkId: number, goodIds: number[]) {
  const userExists = await User.getById(userId) !== null;
  const tripExists = await Trip.getById(tripId) !== null;
  const checkExists = await Check.getById(checkId) !== null;
  const goodsExist = await Promise.all(goodIds.map(id => Good.getById(id) !== null));

  console.log(`Before deletion - User exists: ${userExists}, Trip exists: ${tripExists}, Check exists: ${checkExists}, Goods exist: ${goodsExist.every(exists => exists)}`);

  if (!userExists || !tripExists || !checkExists || !goodsExist.every(exists => exists)) {
    throw new Error('Test data verification failed - some entities do not exist');
  }
}

/**
 * Helper function to verify data is deleted
 */
async function verifyDataDeleted(userId: number, tripId: number, checkId: number, goodIds: number[]) {
  const userExists = await User.getById(userId) !== null;
  const tripExists = await Trip.getById(tripId) !== null;
  const checkExists = await Check.getById(checkId) !== null;
  const goodsExist = await Promise.all(goodIds.map(id => Good.getById(id) !== null));

  console.log(`After deletion - User exists: ${userExists}, Trip exists: ${tripExists}, Check exists: ${checkExists}, Goods exist: ${goodsExist.some(exists => exists)}`);

  if (userExists || tripExists || checkExists || goodsExist.some(exists => exists)) {
    throw new Error('Cascading deletion failed - some entities still exist');
  }
}

// Run the test
runCascadingDeletionTest();
