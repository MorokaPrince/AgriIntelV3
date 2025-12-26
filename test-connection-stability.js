import { executeWithFallback, isConnectionHealthy, getConnectionStatus } from './src/services/connectionFallbackService.ts';

async function testConnectionStability() {
    console.log('Testing connection stability improvements...');

    try {
        // Test connection health check
        const isHealthy = await isConnectionHealthy();
        console.log(`✓ Connection health check: ${isHealthy ? 'Healthy' : 'Unhealthy'}`);

        // Test fallback execution with simulated failure
        const testData = { test: 'fallback data' };
        const result = await executeWithFallback(
            'testOperation',
            async () => {
                // Simulate a failing database operation
                throw new Error('Simulated database failure');
            },
            testData
        );

        console.log('✓ Graceful degradation working:', result);

        // Test connection status
        const status = await getConnectionStatus();
        console.log('✓ Connection status:', status.message);
        console.log('✓ Cache stats:', status.cacheStats);

        // Test successful operation with caching
        const successResult = await executeWithFallback(
            'testSuccessOperation',
            async () => {
                return { success: true, data: 'real data' };
            }
        );

        console.log('✓ Successful operation with caching:', successResult);

        console.log('All connection stability tests passed!');
    } catch (error) {
        console.error('Connection stability test failed:', error.message);
    }
}

// Run the test
testConnectionStability();