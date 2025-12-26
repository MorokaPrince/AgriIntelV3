/**
 * Test connection stability scenarios without requiring TypeScript compilation
 * This simulates the graceful degradation behavior
 */

console.log('🔧 Testing Connection Stability Improvements');
console.log('==========================================\n');

// Simulate the fallback cache behavior
const fallbackCache = {};
const FALLBACK_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Simulate connection health check
 */
function simulateConnectionHealthCheck() {
    // Simulate 50% chance of connection failure for testing
    const isHealthy = Math.random() > 0.5;
    console.log(`🔄 Connection health: ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);
    return isHealthy;
}

/**
 * Simulate executeWithFallback behavior
 */
async function simulateExecuteWithFallback(operationName, operation, fallbackData) {
    const isHealthy = simulateConnectionHealthCheck();

    if (!isHealthy) {
        console.warn(`💾 Using cached data for ${operationName} - MongoDB connection unstable`);

        // Check if we have cached data
        if (fallbackCache[operationName]) {
            const cachedData = fallbackCache[operationName];

            // Check if cached data is still valid
            if (Date.now() - cachedData.timestamp < cachedData.ttl) {
                console.log(`📦 Returning cached data for ${operationName}`);
                return cachedData.data;
            } else {
                console.log(`🗑️ Cache expired for ${operationName} - removing stale data`);
                delete fallbackCache[operationName];
            }
        }

        // If we have fallback data, use it
        if (fallbackData) {
            console.log(`📦 Using provided fallback data for ${operationName}`);
            return fallbackData;
        }

        // If no cached data and no fallback, throw error
        throw new Error(`No cached data available for ${operationName} and MongoDB connection is unstable`);
    }

    // Execute the operation if connection is healthy
    try {
        const result = await operation();

        // Cache the result for future use
        fallbackCache[operationName] = {
            timestamp: Date.now(),
            data: result,
            ttl: FALLBACK_TTL
        };

        console.log(`💾 Cached result for ${operationName}`);
        return result;
    } catch (error) {
        console.error(`❌ Operation ${operationName} failed:`, error.message);

        // Try to return cached data if available
        if (fallbackCache[operationName]) {
            const cachedData = fallbackCache[operationName];
            console.warn(`💾 Fallback: Returning cached data for ${operationName}`);
            return cachedData.data;
        }

        // If we have fallback data, use it
        if (fallbackData) {
            console.warn(`💾 Fallback: Using provided fallback data for ${operationName}`);
            return fallbackData;
        }

        // If no fallback available, rethrow the error
        throw error;
    }
}

/**
 * Test scenarios
 */
async function runConnectionTests() {
    console.log('🧪 Running Connection Stability Tests...\n');

    // Test 1: Successful operation with caching
    console.log('Test 1: Successful operation with caching');
    try {
        const result1 = await simulateExecuteWithFallback(
            'successOperation',
            async () => ({ success: true, data: 'real data' }),
            { fallback: 'fallback data' }
        );
        console.log('✅ Result:', result1);
    } catch (error) {
        console.error('❌ Test 1 failed:', error.message);
    }
    console.log();

    // Test 2: Failed operation with fallback
    console.log('Test 2: Failed operation with fallback');
    try {
        const result2 = await simulateExecuteWithFallback(
            'failedOperation',
            async () => { throw new Error('Database connection failed'); },
            { fallback: 'fallback data' }
        );
        console.log('✅ Result:', result2);
    } catch (error) {
        console.error('❌ Test 2 failed:', error.message);
    }
    console.log();

    // Test 3: Failed operation with cached data
    console.log('Test 3: Failed operation with cached data');
    // First, cache some data
    await simulateExecuteWithFallback(
        'cachedOperation',
        async () => ({ cached: true, data: 'original data' }),
        { fallback: 'fallback data' }
    );

    // Then simulate failure to use cached data
    try {
        const result3 = await simulateExecuteWithFallback(
            'cachedOperation',
            async () => { throw new Error('Database connection failed'); },
            { fallback: 'fallback data' }
        );
        console.log('✅ Result:', result3);
    } catch (error) {
        console.error('❌ Test 3 failed:', error.message);
    }
    console.log();

    // Test 4: Multiple operations to test cache management
    console.log('Test 4: Multiple operations and cache management');
    for (let i = 0; i < 3; i++) {
        try {
            const result = await simulateExecuteWithFallback(
                `multiOperation_${i}`,
                async () => ({ operation: i, data: `data ${i}` }),
                { fallback: `fallback ${i}` }
            );
            console.log(`✅ Operation ${i} result:`, result);
        } catch (error) {
            console.error(`❌ Operation ${i} failed:`, error.message);
        }
    }
    console.log();

    console.log('🎉 All connection stability tests completed!');
    console.log('Cache stats:', Object.keys(fallbackCache).length, 'cached operations');
}

// Run the tests
runConnectionTests().catch(console.error);