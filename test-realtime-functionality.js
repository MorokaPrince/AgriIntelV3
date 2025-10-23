import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

class RealTimeDataTester {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';
    this.testResults = {
      connectivity: [],
      performance: [],
      caching: [],
      polling: []
    };
  }

  async testEndpointConnectivity() {
    console.log('🔗 TESTING ENDPOINT CONNECTIVITY');
    console.log('================================');

    const endpoints = [
      { name: 'Animals', path: '/animals', params: { limit: 10 } },
      { name: 'Health Records', path: '/health', params: { limit: 10 } },
      { name: 'Financial Records', path: '/financial', params: { limit: 10 } },
      { name: 'Feed Records', path: '/feeding', params: { limit: 10 } },
      { name: 'Breeding Records', path: '/breeding', params: { limit: 10 } },
      { name: 'RFID Records', path: '/rfid', params: { limit: 10 } },
      { name: 'Tasks', path: '/tasks', params: { limit: 10 } }
    ];

    for (const endpoint of endpoints) {
      const startTime = Date.now();
      try {
        const queryParams = new URLSearchParams(endpoint.params).toString();
        const url = `${this.baseUrl}${endpoint.path}?${queryParams}`;

        const response = await fetch(url, {
          timeout: 10000
        });

        const responseTime = Date.now() - startTime;
        const data = await response.json();

        this.testResults.connectivity.push({
          endpoint: endpoint.name,
          url,
          status: response.status,
          responseTime,
          success: response.ok,
          dataSize: JSON.stringify(data).length,
          timestamp: new Date().toISOString()
        });

        if (response.ok) {
          console.log(`✅ ${endpoint.name}: ${response.status} (${responseTime}ms) - ${JSON.stringify(data).length} bytes`);
        } else {
          console.log(`❌ ${endpoint.name}: ${response.status} (${responseTime}ms) - ${data.error || 'Unknown error'}`);
        }
      } catch (error) {
        const responseTime = Date.now() - startTime;
        this.testResults.connectivity.push({
          endpoint: endpoint.name,
          error: error.message,
          responseTime,
          success: false,
          timestamp: new Date().toISOString()
        });
        console.log(`❌ ${endpoint.name}: ${error.message} (${responseTime}ms)`);
      }
    }
  }

  async testCachingBehavior() {
    console.log('\n💾 TESTING CACHING BEHAVIOR');
    console.log('===========================');

    const testEndpoint = '/animals';
    const params = { limit: 5 };

    // First request
    const start1 = Date.now();
    const response1 = await fetch(`${this.baseUrl}${testEndpoint}?${new URLSearchParams(params)}`);
    const data1 = await response1.json();
    const time1 = Date.now() - start1;

    // Immediate second request (should use cache if implemented)
    const start2 = Date.now();
    const response2 = await fetch(`${this.baseUrl}${testEndpoint}?${new URLSearchParams(params)}`);
    const data2 = await response2.json();
    const time2 = Date.now() - start2;

    // Check if data is identical (indicating cache hit)
    const dataIdentical = JSON.stringify(data1) === JSON.stringify(data2);

    this.testResults.caching.push({
      firstRequest: { time: time1, dataSize: JSON.stringify(data1).length },
      secondRequest: { time: time2, dataSize: JSON.stringify(data2).length },
      dataIdentical,
      cacheHitLikely: time2 < time1 * 0.5 && dataIdentical,
      timestamp: new Date().toISOString()
    });

    console.log(`📊 First request: ${time1}ms (${JSON.stringify(data1).length} bytes)`);
    console.log(`📊 Second request: ${time2}ms (${JSON.stringify(data2).length} bytes)`);
    console.log(`🔍 Data identical: ${dataIdentical}`);
    console.log(`🎯 Cache hit likely: ${time2 < time1 * 0.5 && dataIdentical}`);
  }

  async testPollingSimulation() {
    console.log('\n🔄 TESTING POLLING SIMULATION');
    console.log('=============================');

    const endpoint = '/animals';
    const params = { limit: 3 };
    const pollInterval = 2000; // 2 seconds
    const pollCount = 3;

    const pollResults = [];

    for (let i = 0; i < pollCount; i++) {
      const startTime = Date.now();
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}?${new URLSearchParams(params)}`);
        const data = await response.json();
        const responseTime = Date.now() - startTime;

        pollResults.push({
          poll: i + 1,
          responseTime,
          success: response.ok,
          dataCount: data.data?.length || 0,
          timestamp: new Date().toISOString()
        });

        console.log(`📊 Poll ${i + 1}: ${responseTime}ms - ${data.data?.length || 0} records`);

        if (i < pollCount - 1) {
          console.log(`⏳ Waiting ${pollInterval}ms for next poll...`);
          await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
      } catch (error) {
        pollResults.push({
          poll: i + 1,
          error: error.message,
          success: false,
          timestamp: new Date().toISOString()
        });
        console.log(`❌ Poll ${i + 1}: ${error.message}`);
      }
    }

    this.testResults.polling = pollResults;

    // Analyze polling consistency
    const successfulPolls = pollResults.filter(p => p.success);
    const avgResponseTime = successfulPolls.reduce((sum, p) => sum + p.responseTime, 0) / successfulPolls.length;

    console.log(`📈 Average response time: ${Math.round(avgResponseTime)}ms`);
    console.log(`✅ Successful polls: ${successfulPolls.length}/${pollCount}`);
  }

  async testDataConsistency() {
    console.log('\n🔍 TESTING DATA CONSISTENCY');
    console.log('===========================');

    const endpoints = ['/animals', '/health', '/tasks'];
    const consistencyResults = [];

    for (const endpoint of endpoints) {
      try {
        // Make multiple rapid requests
        const requests = Array(3).fill().map(() =>
          fetch(`${this.baseUrl}${endpoint}?limit=5`)
            .then(res => res.json())
        );

        const responses = await Promise.all(requests);
        const dataArrays = responses.map(r => r.data || []);

        // Check if all responses have the same data
        const firstDataStr = JSON.stringify(dataArrays[0]);
        const allConsistent = dataArrays.every(data => JSON.stringify(data) === firstDataStr);

        consistencyResults.push({
          endpoint,
          consistent: allConsistent,
          responseCount: responses.length,
          dataSize: firstDataStr.length,
          timestamp: new Date().toISOString()
        });

        console.log(`🔍 ${endpoint}: ${allConsistent ? '✅ Consistent' : '❌ Inconsistent'} (${responses.length} requests)`);
      } catch (error) {
        consistencyResults.push({
          endpoint,
          error: error.message,
          consistent: false,
          timestamp: new Date().toISOString()
        });
        console.log(`❌ ${endpoint}: ${error.message}`);
      }
    }

    this.testResults.performance.push(...consistencyResults);
  }

  async runAllTests() {
    console.log('🚀 STARTING REAL-TIME DATA FUNCTIONALITY TESTS');
    console.log('=============================================\n');

    try {
      await this.testEndpointConnectivity();
      await this.testCachingBehavior();
      await this.testPollingSimulation();
      await this.testDataConsistency();

      this.generateReport();
    } catch (error) {
      console.error('💥 Test suite failed:', error);
    }
  }

  generateReport() {
    console.log('\n📋 REAL-TIME DATA FUNCTIONALITY REPORT');
    console.log('=====================================\n');

    // Connectivity Summary
    const connectivityTests = this.testResults.connectivity;
    const successfulConnections = connectivityTests.filter(t => t.success).length;
    const avgResponseTime = connectivityTests
      .filter(t => t.success)
      .reduce((sum, t) => sum + t.responseTime, 0) / successfulConnections;

    console.log('🔗 CONNECTIVITY RESULTS:');
    console.log(`  ✅ Successful: ${successfulConnections}/${connectivityTests.length}`);
    console.log(`  📊 Avg Response Time: ${Math.round(avgResponseTime || 0)}ms`);
    console.log(`  📈 Success Rate: ${Math.round((successfulConnections / connectivityTests.length) * 100)}%\n`);

    // Caching Analysis
    const cacheTest = this.testResults.caching[0];
    if (cacheTest) {
      console.log('💾 CACHING ANALYSIS:');
      console.log(`  🎯 Cache Hit Likely: ${cacheTest.cacheHitLikely ? '✅ Yes' : '❌ No'}`);
      console.log(`  🔍 Data Consistency: ${cacheTest.dataIdentical ? '✅ Consistent' : '❌ Inconsistent'}`);
      console.log(`  ⚡ Performance Gain: ${cacheTest.firstRequest.time > cacheTest.secondRequest.time ? '✅ Faster' : '❌ Slower'}\n`);
    }

    // Polling Analysis
    const pollingTests = this.testResults.polling;
    const successfulPolls = pollingTests.filter(p => p.success).length;
    const pollResponseTimes = pollingTests.filter(p => p.success).map(p => p.responseTime);
    const avgPollTime = pollResponseTimes.reduce((sum, t) => sum + t, 0) / pollResponseTimes.length;

    console.log('🔄 POLLING ANALYSIS:');
    console.log(`  ✅ Successful Polls: ${successfulPolls}/${pollingTests.length}`);
    console.log(`  📊 Avg Poll Time: ${Math.round(avgPollTime || 0)}ms`);
    console.log(`  📈 Reliability: ${Math.round((successfulPolls / pollingTests.length) * 100)}%\n`);

    // Overall Assessment
    console.log('🎯 OVERALL ASSESSMENT:');
    const overallScore = Math.round(
      ((successfulConnections / connectivityTests.length) * 0.4 +
       (cacheTest?.cacheHitLikely ? 1 : 0) * 0.3 +
       (successfulPolls / pollingTests.length) * 0.3) * 100
    );

    console.log(`  📊 Overall Score: ${overallScore}/100`);

    if (overallScore >= 80) {
      console.log('  ✅ EXCELLENT: Real-time functionality is working well');
    } else if (overallScore >= 60) {
      console.log('  ⚠️  GOOD: Real-time functionality is working but could be improved');
    } else {
      console.log('  ❌ POOR: Real-time functionality needs significant improvement');
    }

    console.log('\n🔧 RECOMMENDATIONS:');
    if (successfulConnections / connectivityTests.length < 0.8) {
      console.log('  • Check API server connectivity and endpoint availability');
    }
    if (!cacheTest?.cacheHitLikely) {
      console.log('  • Implement or verify server-side caching for better performance');
    }
    if (successfulPolls / pollingTests.length < 0.8) {
      console.log('  • Review polling intervals and error handling');
    }
    if (avgResponseTime > 1000) {
      console.log('  • Optimize API response times for better user experience');
    }
  }
}

// Run the tests
const tester = new RealTimeDataTester();
tester.runAllTests().catch(console.error);