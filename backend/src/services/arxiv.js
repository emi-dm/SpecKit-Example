import { parseStringPromise } from 'xml2js';
import config from '../config.js';

// Rate limiting
let lastRequest = 0;

async function rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequest;

    if (timeSinceLastRequest < config.arxivRateLimit) {
        await new Promise(resolve => setTimeout(resolve, config.arxivRateLimit - timeSinceLastRequest));
    }

    lastRequest = Date.now();
}

/**
 * arXiv API service
 */
class ArxivService {
    /**
     * Fetch paper by arXiv ID
     */
    async fetchPaper(arxivId) {
        await rateLimit();

        try {
            const cleanId = arxivId.replace('arXiv:', '').trim();
            const url = `${config.arxivApiUrl}?id_list=${cleanId}&max_results=1`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`arXiv API returned ${response.status}`);
            }

            const xml = await response.text();
            const result = await parseStringPromise(xml);

            if (!result.feed || !result.feed.entry || result.feed.entry.length === 0) {
                return null;
            }

            const entry = result.feed.entry[0];

            // Parse authors
            const authors = (entry.author || []).map(a => ({
                name: a.name[0],
                affiliation: null
            }));

            // Extract DOI if available
            let doi = null;
            if (entry['arxiv:doi']) {
                doi = entry['arxiv:doi'][0]['_'];
            }

            // Extract categories as keywords
            const keywords = (entry.category || []).map(c => c.$.term);

            // Publication date
            const pubDate = entry.published[0].split('T')[0];
            const year = parseInt(pubDate.split('-')[0]);

            // URLs
            const paperUrl = entry.id[0];
            const pdfUrl = paperUrl.replace('/abs/', '/pdf/') + '.pdf';

            return {
                title: entry.title[0].trim().replace(/\s+/g, ' '),
                authors,
                abstract: entry.summary[0].trim().replace(/\s+/g, ' '),
                publicationDate: pubDate,
                source: 'arxiv',
                sourceId: cleanId,
                keywords,
                url: paperUrl,
                pdfUrl,
                doi,
                venue: null,
                year,
                citations: 0
            };
        } catch (error) {
            console.error('arXiv fetch error:', error);
            throw new Error(`Failed to fetch from arXiv: ${error.message}`);
        }
    }

    /**
     * Search papers by query
     */
    async search(query, maxResults = 10) {
        await rateLimit();

        try {
            const url = `${config.arxivApiUrl}?search_query=all:${encodeURIComponent(query)}&max_results=${maxResults}&sortBy=relevance&sortOrder=descending`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`arXiv API returned ${response.status}`);
            }

            const xml = await response.text();
            const result = await parseStringPromise(xml);

            if (!result.feed || !result.feed.entry) {
                return [];
            }

            return result.feed.entry.map(entry => {
                const arxivId = entry.id[0].split('/').pop().replace('.pdf', '');
                const authors = (entry.author || []).map(a => a.name[0]);
                const pubDate = entry.published[0].split('T')[0];
                const year = parseInt(pubDate.split('-')[0]);
                const paperUrl = entry.id[0];

                return {
                    id: arxivId,
                    arxivId: arxivId,
                    title: entry.title[0].trim().replace(/\s+/g, ' '),
                    authors: authors,
                    abstract: entry.summary ? entry.summary[0].trim().replace(/\s+/g, ' ').substring(0, 300) + '...' : '',
                    year: year,
                    published: pubDate,
                    url: paperUrl,
                    pdfUrl: paperUrl.replace('/abs/', '/pdf/') + '.pdf',
                    venue: entry['arxiv:journal_ref'] ? entry['arxiv:journal_ref'][0] : null,
                    source: 'arxiv'
                };
            });
        } catch (error) {
            console.error('arXiv search error:', error);
            throw new Error(`Failed to search arXiv: ${error.message}`);
        }
    }
}

export default new ArxivService();
