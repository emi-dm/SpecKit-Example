import storage from './src/services/storage.js';

// Test performance with large dataset
async function testPerformance() {
    console.log('🧪 Testing performance with 1000+ papers...\n');

    // Generate test papers
    const testPapers = [];
    for (let i = 0; i < 1000; i++) {
        testPapers.push({
            id: `test-${i}`,
            title: `Test Paper ${i} about Machine Learning and Neural Networks`,
            authors: [{ name: `Author ${i}`, affiliation: null }],
            abstract: `This is an abstract for paper ${i} discussing various aspects of machine learning, deep learning, transformers, and attention mechanisms.`,
            publicationDate: `2024-01-${(i % 28) + 1}`,
            source: i % 2 === 0 ? 'arxiv' : 'dblp',
            sourceId: `test-${i}`,
            keywords: ['machine learning', 'neural networks', 'AI'],
            url: `https://example.com/paper-${i}`,
            pdfUrl: null,
            doi: `10.1234/test.${i}`,
            venue: 'Test Conference',
            year: 2024,
            citations: i % 100,
            addedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    }

    console.log(`✓ Generated ${testPapers.length} test papers`);

    // Test 1: Read all papers
    const start1 = Date.now();
    const allPapers = await storage.getAllPapers();
    const time1 = Date.now() - start1;
    console.log(`\n📊 Test 1: Read all papers`);
    console.log(`   Papers in storage: ${allPapers.length}`);
    console.log(`   Time: ${time1}ms`);
    console.log(`   Status: ${time1 < 100 ? '✅ PASS' : '⚠️  SLOW'} (target: <100ms)`);

    // Test 2: Search performance
    const start2 = Date.now();
    const searchResults = storage.searchPapers(allPapers, 'machine learning');
    const time2 = Date.now() - start2;
    console.log(`\n📊 Test 2: Search papers`);
    console.log(`   Query: "machine learning"`);
    console.log(`   Results: ${searchResults.length}`);
    console.log(`   Time: ${time2}ms`);
    console.log(`   Status: ${time2 < 1000 ? '✅ PASS' : '⚠️  SLOW'} (target: <1000ms)`);

    // Test 3: Get paper by ID
    const start3 = Date.now();
    if (allPapers.length > 0) {
        const paper = await storage.getPaperById(allPapers[0].id);
        const time3 = Date.now() - start3;
        console.log(`\n📊 Test 3: Get paper by ID`);
        console.log(`   Paper ID: ${allPapers[0].id}`);
        console.log(`   Found: ${paper ? 'Yes' : 'No'}`);
        console.log(`   Time: ${time3}ms`);
        console.log(`   Status: ${time3 < 50 ? '✅ PASS' : '⚠️  SLOW'} (target: <50ms)`);
    }

    // Test 4: Multiple searches
    const queries = ['neural', 'transformers', 'attention', 'deep learning', 'AI'];
    const start4 = Date.now();
    for (const query of queries) {
        storage.searchPapers(allPapers, query);
    }
    const time4 = Date.now() - start4;
    const avgTime = time4 / queries.length;
    console.log(`\n📊 Test 4: Multiple searches (${queries.length} queries)`);
    console.log(`   Total time: ${time4}ms`);
    console.log(`   Average per search: ${avgTime.toFixed(2)}ms`);
    console.log(`   Status: ${avgTime < 500 ? '✅ PASS' : '⚠️  SLOW'} (target: <500ms avg)`);

    // Summary
    console.log(`\n${'='.repeat(60)}`);
    console.log('📋 Performance Summary');
    console.log(`${'='.repeat(60)}`);
    console.log(`Total papers: ${allPapers.length}`);
    console.log(`Read time: ${time1}ms ${time1 < 100 ? '✅' : '⚠️'}`);
    console.log(`Search time: ${time2}ms ${time2 < 1000 ? '✅' : '⚠️'}`);
    console.log(`Avg search time: ${avgTime.toFixed(2)}ms ${avgTime < 500 ? '✅' : '⚠️'}`);

    const allPassed = time1 < 100 && time2 < 1000 && avgTime < 500;
    console.log(`\n${allPassed ? '✅ ALL TESTS PASSED' : '⚠️  SOME TESTS SLOW'}`);
    console.log(`\nSC-003 Status: ${allPapers.length >= 1000 && allPassed ? '✅ PASS - Supports 1000+ papers without degradation' : allPapers.length < 1000 ? '⚠️  Need more papers to test' : '⚠️  Performance degradation detected'}`);
}

testPerformance().catch(console.error);
