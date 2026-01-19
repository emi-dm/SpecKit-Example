import config from '../config.js';

/**
 * DBLP API service
 */
class DblpService {
    /**
     * Search for paper by DOI or title
     */
    async searchPaper(query) {
        try {
            const url = `${config.dblpApiUrl}?q=${encodeURIComponent(query)}&format=json&h=1`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`DBLP API returned ${response.status}`);
            }

            const data = await response.json();

            if (!data.result || !data.result.hits || !data.result.hits.hit || data.result.hits.hit.length === 0) {
                return null;
            }

            const hit = data.result.hits.hit[0];
            const info = hit.info;

            // Parse authors
            const authorData = info.authors ? info.authors.author : [];
            const authors = (Array.isArray(authorData) ? authorData : [authorData]).map(a => ({
                name: typeof a === 'string' ? a : a.text || a,
                affiliation: null
            }));

            // Extract year from venue or year field
            let year = info.year ? parseInt(info.year) : new Date().getFullYear();

            // Construct publication date
            const publicationDate = `${year}-01-01`;

            // DOI
            const doi = info.doi || null;

            // URL
            const url_paper = info.url || info.ee || `https://dblp.org/rec/${hit['@id']}.html`;

            return {
                title: info.title || 'Untitled',
                authors,
                abstract: 'No abstract available from DBLP', // DBLP doesn't provide abstracts
                publicationDate,
                source: 'dblp',
                sourceId: hit['@id'],
                keywords: info.venue ? [info.venue] : [],
                url: url_paper,
                pdfUrl: null,
                doi,
                venue: info.venue || null,
                year,
                citations: 0
            };
        } catch (error) {
            console.error('DBLP fetch error:', error);
            throw new Error(`Failed to fetch from DBLP: ${error.message}`);
        }
    }

    /**
     * Fetch paper by DOI
     */
    async fetchByDOI(doi) {
        return this.searchPaper(`doi:${doi}`);
    }

    /**
     * Search multiple papers by query
     */
    async search(query, maxResults = 10) {
        try {
            const url = `${config.dblpApiUrl}?q=${encodeURIComponent(query)}&format=json&h=${maxResults}`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`DBLP API returned ${response.status}`);
            }

            const data = await response.json();

            if (!data.result || !data.result.hits || !data.result.hits.hit) {
                return [];
            }

            const hits = Array.isArray(data.result.hits.hit) ? data.result.hits.hit : [data.result.hits.hit];

            return hits.map(hit => {
                const info = hit.info;

                // Parse authors
                const authorData = info.authors ? info.authors.author : [];
                const authors = (Array.isArray(authorData) ? authorData : [authorData]).map(a =>
                    typeof a === 'string' ? a : (a.text || a)
                );

                const year = info.year ? parseInt(info.year) : new Date().getFullYear();

                return {
                    id: hit['@id'],
                    title: info.title || 'Untitled',
                    authors: authors,
                    year: year,
                    venue: info.venue || null,
                    doi: info.doi || null,
                    url: info.url || info.ee || `https://dblp.org/rec/${hit['@id']}.html`,
                    source: 'dblp'
                };
            });
        } catch (error) {
            console.error('DBLP search error:', error);
            throw new Error(`Failed to search DBLP: ${error.message}`);
        }
    }
}

export default new DblpService();
