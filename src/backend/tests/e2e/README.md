# End-to-End Tests

This directory contains end-to-end tests for the application. These tests interact with the API endpoints to test the full flow of the application.

## Available Tests

### User, Trip, and Check Flow Test

File: `userTripCheckFlow.test.ts`

This test performs the following steps:
1. Register a user
2. Login user and get token
3. Create a trip
4. Add user with id=7 to created trip
5. Add 2 checks with mocked name, sum and goods
6. Clean up data through delete user, trip, check and goods

## Running the Tests

Make sure the application is running on `http://localhost:3000` before running the tests.

To run the User, Trip, and Check Flow test:

```bash
npm run test:e2e
```

## Test Output

The test will output progress messages to the console. A successful test will end with:

```
E2E Test completed successfully!
```

If there are any errors, they will be displayed in the console, and the test will attempt to clean up any created data.

## Notes

- The tests create real data in the database and then clean it up afterward.
- If a test fails, it will attempt to clean up any data it created.
- The tests use a timestamp in the user login and trip name to ensure uniqueness.
- The tests require a user with ID 7 to exist in the database for the "Add user to trip" step.
