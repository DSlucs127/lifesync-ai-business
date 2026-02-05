import { performance } from 'perf_hooks';

// Mock types
interface Transaction {
    id: string;
    description: string;
    amount: number;
    userId: string;
}

// Mock expensive decryption
const decryptTransaction = async (data: any, uid: string): Promise<Transaction> => {
    // Simulate CPU work (PBKDF2 is CPU bound)
    // 0.2ms of busy work
    const start = performance.now();
    while (performance.now() - start < 0.2) {}

    return {
        id: data.id,
        description: data.description + " (decrypted)",
        amount: data.amount,
        userId: uid
    } as Transaction;
};

// Data generator
const generateDocs = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
        id: `t${i}`,
        data: () => ({
            description: `Trans ${i}`,
            amount: 100 + i,
            category: 'Food',
            userId: 'user1'
        })
    }));
};

async function runBenchmark() {
    console.log("Starting Benchmark...");
    const userUid = 'user1';
    const initialCount = 1000;
    const docs = generateDocs(initialCount);

    // --- BASELINE ---
    console.log("\n--- Baseline (Naïve) ---");

    // Initial load
    let start = performance.now();
    let decrypted = await Promise.all(docs.map(async d => decryptTransaction({id: d.id, ...d.data()}, userUid)));
    let end = performance.now();
    console.log(`Initial load (${initialCount} items): ${(end - start).toFixed(2)}ms`);

    // Update 1 item
    const docsUpdated1 = [...docs];
    docsUpdated1[0] = { ...docs[0], data: () => ({ ...docs[0].data(), amount: 999 }) }; // modified

    start = performance.now();
    decrypted = await Promise.all(docsUpdated1.map(async d => decryptTransaction({id: d.id, ...d.data()}, userUid)));
    end = performance.now();
    console.log(`Update 1 item: ${(end - start).toFixed(2)}ms`);


    // --- OPTIMIZED ---
    console.log("\n--- Optimized (Cached) ---");
    const cache = new Map<string, { rawStr: string, decrypted: Transaction }>();

    // Helper for optimized update
    const updateOptimized = async (currentDocs: any[]) => {
        const newCache = new Map<string, { rawStr: string, decrypted: Transaction }>();
        const results = await Promise.all(currentDocs.map(async (d) => {
            const rawData = { id: d.id, ...d.data() };
            // Optimization: compare JSON string
            const rawStr = JSON.stringify(rawData);

            const cached = cache.get(d.id);
            if (cached && cached.rawStr === rawStr) {
                newCache.set(d.id, cached);
                return cached.decrypted;
            }

            const decrypted = await decryptTransaction({id: d.id, ...d.data()}, userUid);
            newCache.set(d.id, { rawStr, decrypted });
            return decrypted;
        }));

        // Update cache reference (simulating ref.current = ...)
        cache.clear();
        newCache.forEach((v, k) => cache.set(k, v));

        return results;
    };

    // Initial load
    start = performance.now();
    await updateOptimized(docs);
    end = performance.now();
    console.log(`Initial load (${initialCount} items): ${(end - start).toFixed(2)}ms`);

    // Update 1 item
    start = performance.now();
    await updateOptimized(docsUpdated1);
    end = performance.now();
    console.log(`Update 1 item: ${(end - start).toFixed(2)}ms`);

    // Update 10 items
    const docsUpdated10 = [...docs];
    for(let i=0; i<10; i++) {
        docsUpdated10[i] = { ...docs[i], data: () => ({ ...docs[i].data(), amount: 888 + i }) };
    }

    start = performance.now();
    await updateOptimized(docsUpdated10);
    end = performance.now();
    console.log(`Update 10 items: ${(end - start).toFixed(2)}ms`);
}

runBenchmark();
