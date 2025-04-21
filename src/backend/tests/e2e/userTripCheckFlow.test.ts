import needle from 'needle';

/**
 * End-to-End Test for User, Trip, and Check Flow
 *
 * This test performs the following steps:
 * 1. Register a user
 * 2. Login user and get token
 * 3. Create a trip
 * 4. Add user with id=20 to created trip
 * 5. Add 2 checks with mocked name, sum and goods
 * 6. Delete a good
 * 7. Rename a trip
 * 8. Delete a trip
 * 9. Delete a user
 * 10. Update a check
 * 11. Get trip users
 * 12. Get checks for a trip
 * 13. Get goods for a check
 * 14. Get total sum of checks for a trip
 * 15. Get total cost of goods in a check
 */

// Base URL for API requests
const API_URL = 'http://localhost:7000/api';

// Test data
const testUser = {
  login: `test_user_${Date.now()}`,
  password: 'test_password'
};

describe('User, Trip, and Check Flow', () => {
  // Store IDs and tokens for cleanup
  let userId: number;
  let accessToken: string;
  let tripId: number;
  let checkIds: number[] = [];
  let goodIds: number[] = [];

  // Increase timeout for the entire test suite
  jest.setTimeout(30000);

  // Set up initial state before all tests
  beforeAll(async () => {
    // Register a user and get token
    const response = await needle('post', `${API_URL}/auth/register`, testUser, {
      json: true
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('accessToken');

    accessToken = response.body.accessToken;

    // Get user ID from token
    const usersResponse = await needle('get', `${API_URL}/auth/users`, null, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    expect(usersResponse.statusCode).toBe(200);
    expect(Array.isArray(usersResponse.body)).toBe(true);

    const currentUser = usersResponse.body.find((user: any) => user.login === testUser.login);
    expect(currentUser).toBeDefined();

    userId = currentUser.USER_ID;
  });

  // Clean up after all tests
  afterAll(async () => {
    await cleanupData();
  });

  /**
   * Step 1: Register a user
   */
  test('1. Register a user', () => {
    // Verify that user registration was successful in beforeAll
    expect(userId).toBeDefined();
    expect(accessToken).toBeDefined();
  });

  /**
   * Step 2: Login user and get token
   */
  test('2. Login user and get token', async () => {
    const response = await needle('post', `${API_URL}/auth/login`, testUser, {
      json: true
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('accessToken');

    accessToken = response.body.accessToken;
  });

  /**
   * Step 3: Create a trip
   */
  test('3. Create a trip', async () => {
    const tripData = {
      NAME: `Test Trip ${Date.now()}`
    };

    const response = await needle('post', `${API_URL}/trip`, tripData, {
      json: true,
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('TRIP_ID');

    tripId = response.body.TRIP_ID;
  });

  /**
   * Step 4: Add user with id=20 to created trip
   */
  test('4. Add user with id=20 to created trip', async () => {
    // Ensure trip was created in previous test
    expect(tripId).toBeDefined();

    const response = await needle('post', `${API_URL}/trip/${tripId}/user/20`, null, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    expect(response.statusCode).toBe(201);
  });

  /**
   * Step 5: Add 2 checks with mocked name, sum and goods
   */
  test('5. Add 2 checks with mocked name, sum and goods', async () => {
    // Ensure trip was created in previous test
    expect(tripId).toBeDefined();
    expect(userId).toBeDefined();

    // Create 2 checks
    for (let i = 0; i < 2; i++) {
      // Create check
      const checkData = {
        TRIP_ID: tripId,
        USER_ID: userId,
        CHECK_SUM: 100 + i * 50
      };

      const checkResponse = await needle('post', `${API_URL}/check`, checkData, {
        json: true,
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      expect(checkResponse.statusCode).toBe(201);
      expect(checkResponse.body).toHaveProperty('CHECK_ID');

      const checkId = checkResponse.body.CHECK_ID;
      checkIds.push(checkId);

      // Add goods to check
      const goodsData = [
        {
          CHECK_ID: checkId,
          NAME: `Test Good 1 for Check ${i+1}`,
          PRICE: 50 + i * 10,
          QUANTITY: 1
        },
        {
          CHECK_ID: checkId,
          NAME: `Test Good 2 for Check ${i+1}`,
          PRICE: 50 + i * 10,
          QUANTITY: 1
        }
      ];

      const goodsResponse = await needle('post', `${API_URL}/good/bulk`, goodsData, {
        json: true,
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      expect(goodsResponse.statusCode).toBe(201);
      expect(Array.isArray(goodsResponse.body)).toBe(true);

      goodsResponse.body.forEach((good: any) => {
        goodIds.push(good.GOOD_ID);
      });
    }
  });

  /**
   * Step 6: Delete a good
   */
  test('6. Delete a good', async () => {
    // Ensure we have goods to delete
    expect(goodIds.length).toBeGreaterThan(0);

    const goodIdToDelete = goodIds[0];

    const response = await needle('delete', `${API_URL}/good/${goodIdToDelete}`, null, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    expect(response.statusCode).toBe(200);

    // Verify good is deleted
    const checkResponse = await needle('get', `${API_URL}/good/${goodIdToDelete}`, null, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    expect(checkResponse.statusCode).toBe(404);

    // Remove the deleted good from our tracking array
    goodIds = goodIds.filter(id => id !== goodIdToDelete);
  });

  /**
   * Step 7: Rename a trip
   */
  test('7. Rename a trip', async () => {
    // Ensure trip exists
    expect(tripId).toBeDefined();

    const newTripName = `Updated Trip Name ${Date.now()}`;
    const updateData = {
      NAME: newTripName
    };

    const response = await needle('put', `${API_URL}/trip/${tripId}`, updateData, {
      json: true,
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    expect(response.statusCode).toBe(200);

    // Verify trip was renamed
    const getTripResponse = await needle('get', `${API_URL}/trip/${tripId}`, null, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    expect(getTripResponse.statusCode).toBe(200);
    expect(getTripResponse.body).toHaveProperty('NAME', newTripName);
  });

  /**
   * Step 8: Delete a trip
   */
  test('8. Delete a trip', async () => {
    // Create a new trip specifically for deletion
    const tripData = {
      NAME: `Trip to Delete ${Date.now()}`
    };

    const createResponse = await needle('post', `${API_URL}/trip`, tripData, {
      json: true,
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    expect(createResponse.statusCode).toBe(201);
    expect(createResponse.body).toHaveProperty('TRIP_ID');

    const tripToDeleteId = createResponse.body.TRIP_ID;

    // Delete the trip
    const deleteResponse = await needle('delete', `${API_URL}/trip/${tripToDeleteId}`, null, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if(deleteResponse.statusCode !== 200) {
      console.warn(`Error deleting trip with ID: ${tripToDeleteId}`, deleteResponse.body);
    }
    expect(deleteResponse.statusCode).toBe(200);

    // Verify trip is deleted
    const checkResponse = await needle('get', `${API_URL}/trip/${tripToDeleteId}`, null, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    expect(checkResponse.statusCode).toBe(404);
  });

  /**
   * Step 9: Delete a user
   */
  test('9. Delete a user', async () => {
    // Create a new user specifically for deletion
    const userToDelete = {
      login: `user_to_delete_${Date.now()}`,
      password: 'delete_password'
    };

    const registerResponse = await needle('post', `${API_URL}/auth/register`, userToDelete, {
      json: true
    });

    expect(registerResponse.statusCode).toBe(201);
    expect(registerResponse.body).toHaveProperty('accessToken');

    const deleteToken = registerResponse.body.accessToken;

    // Get user ID
    const usersResponse = await needle('get', `${API_URL}/auth/users`, null, {
      headers: {
        'Authorization': `Bearer ${deleteToken}`
      }
    });

    expect(usersResponse.statusCode).toBe(200);
    expect(Array.isArray(usersResponse.body)).toBe(true);

    const userToBeDeleted = usersResponse.body.find((user: any) => user.login === userToDelete.login);
    expect(userToBeDeleted).toBeDefined();

    const userToDeleteId = userToBeDeleted.USER_ID;

    // Delete the user
    const deleteResponse = await needle('delete', `${API_URL}/auth/users/${userToDeleteId}`, null, {
      headers: {
        'Authorization': `Bearer ${deleteToken}`
      }
    });

    expect(deleteResponse.statusCode).toBe(200);

    // Verify user is deleted
    const checkResponse = await needle('get', `${API_URL}/auth/users`, null, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    expect(checkResponse.statusCode).toBe(200);
    const deletedUser = checkResponse.body.find((user: any) => user.USER_ID === userToDeleteId);
    expect(deletedUser).toBeUndefined();
  });

  /**
   * Step 10: Update a check
   */
  test('10. Update a check', async () => {
    // Ensure we have checks to update
    expect(checkIds.length).toBeGreaterThan(0);

    const checkIdToUpdate = checkIds[0];
    const updatedCheckSum = 250.75;

    const updateData = {
      CHECK_SUM: updatedCheckSum
    };

    const response = await needle('put', `${API_URL}/check/${checkIdToUpdate}`, updateData, {
      json: true,
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    expect(response.statusCode).toBe(200);

    // Verify check was updated
    const getCheckResponse = await needle('get', `${API_URL}/check/${checkIdToUpdate}`, null, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    expect(getCheckResponse.statusCode).toBe(200);
    expect(getCheckResponse.body).toHaveProperty('CHECK_SUM', updatedCheckSum);
  });

  /**
   * Step 11: Get trip users
   */
  test('11. Get trip users', async () => {
    // Ensure trip exists
    expect(tripId).toBeDefined();

    const response = await needle('get', `${API_URL}/trip/${tripId}/users`, null, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    // We should have at least the current user and the user with ID=20 that was added in step 4
    expect(response.body.length).toBeGreaterThanOrEqual(2);
  });

  /**
   * Step 12: Get checks for a trip
   */
  test('12. Get checks for a trip', async () => {
    // Ensure trip exists and has checks
    expect(tripId).toBeDefined();
    expect(checkIds.length).toBeGreaterThan(0);

    const response = await needle('get', `${API_URL}/check/trip/${tripId}`, null, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    // We should have at least the checks we created
    expect(response.body.length).toBeGreaterThanOrEqual(checkIds.length);

    // Verify our check IDs are in the response
    for (const checkId of checkIds) {
      const found = response.body.some((check: any) => check.CHECK_ID === checkId);
      expect(found).toBe(true);
    }
  });

  /**
   * Step 13: Get goods for a check
   */
  test('13. Get goods for a check', async () => {
    // Ensure we have checks and goods
    expect(checkIds.length).toBeGreaterThan(0);
    expect(goodIds.length).toBeGreaterThan(0);

    const checkId = checkIds[0];

    const response = await needle('get', `${API_URL}/good/check/${checkId}`, null, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    // We should have at least one good for this check
    expect(response.body.length).toBeGreaterThan(0);
  });

  /**
   * Step 14: Get total sum of checks for a trip
   */
  test('14. Get total sum of checks for a trip', async () => {
    // Ensure trip exists and has checks
    expect(tripId).toBeDefined();
    expect(checkIds.length).toBeGreaterThan(0);

    const response = await needle('get', `${API_URL}/check/trip/${tripId}/total`, null, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('totalSum');
    expect(typeof response.body.totalSum).toBe('number');
  });

  /**
   * Step 15: Get total cost of goods in a check
   */
  test('15. Get total cost of goods in a check', async () => {
    // Ensure we have checks
    expect(checkIds.length).toBeGreaterThan(0);

    const checkId = checkIds[0];

    const response = await needle('get', `${API_URL}/good/check/${checkId}/total`, null, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('total');
    expect(typeof response.body.total).toBe('number');
  });

  /**
   * Clean up data
   */
  async function cleanupData() {
    // Delete goods
    for (const goodId of goodIds) {
      try {
        await needle('delete', `${API_URL}/good/${goodId}`, null, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
      } catch (error) {
        console.warn(`Error deleting good with ID: ${goodId}`, error);
      }
    }

    // Delete checks
    for (const checkId of checkIds) {
      try {
        await needle('delete', `${API_URL}/check/${checkId}`, null, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
      } catch (error) {
        console.warn(`Error deleting check with ID: ${checkId}`, error);
      }
    }

    // Delete trip
    if (tripId) {
      try {
        await needle('delete', `${API_URL}/trip/${tripId}`, null, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
      } catch (error) {
        console.warn(`Error deleting trip with ID: ${tripId}`, error);
      }
    }

    // Delete user
    if (userId) {
      try {
        await needle('delete', `${API_URL}/auth/users/${userId}`, null, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
      } catch (error) {
        console.warn(`Error deleting user with ID: ${userId}`, error);
      }
    }
  }
});
