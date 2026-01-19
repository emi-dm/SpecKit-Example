export default {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',

    // Data paths
    dataPath: './data/papers.json',
    backupPath: './data/backups',
    maxBackups: 10,

    // Search settings
    resultsPerPage: 20,
    maxResultsPerPage: 100,

    // External APIs
    arxivApiUrl: process.env.ARXIV_API_URL || 'http://export.arxiv.org/api/query',
    arxivRateLimit: parseInt(process.env.ARXIV_RATE_LIMIT) || 3000, // ms between requests
    dblpApiUrl: process.env.DBLP_API_URL || 'https://dblp.org/search/publ/api',

    // Caching
    cacheEnabled: process.env.CACHE_ENABLED !== 'false',
    cacheTTL: parseInt(process.env.CACHE_TTL) || 300000, // 5 minutes
    maxCacheSize: 100
};
