/**
 * Frontend API client
 */

const API_BASE = '/api';

class ApiClient {
    /**
     * Generic fetch wrapper
     */
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    /**
     * Get all papers
     */
    async getPapers(filters = {}) {
        const params = new URLSearchParams();

        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);
        if (filters.source) params.append('source', filters.source);
        if (filters.year) params.append('year', filters.year);
        if (filters.sort) params.append('sort', filters.sort);

        const query = params.toString();
        return this.request(`/papers${query ? '?' + query : ''}`);
    }

    /**
     * Get single paper by ID
     */
    async getPaper(id) {
        return this.request(`/papers/${id}`);
    }

    /**
     * Add a new paper
     */
    async addPaper(paper) {
        return this.request('/papers', {
            method: 'POST',
            body: JSON.stringify(paper)
        });
    }

    /**
     * Delete a paper
     */
    async deletePaper(id) {
        return this.request(`/papers/${id}`, {
            method: 'DELETE'
        });
    }

    /**
     * Search papers
     */
    async searchPapers(query, filters = {}) {
        const params = new URLSearchParams({ q: query });

        if (filters.source) params.append('source', filters.source);
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);
        if (filters.sort) params.append('sort', filters.sort);

        return this.request(`/search?${params.toString()}`);
    }

    /**
     * Fetch paper from external API
     */
    async fetchPaper(identifier, source, autoAdd = false) {
        return this.request('/fetch', {
            method: 'POST',
            body: JSON.stringify({ identifier, source, autoAdd })
        });
    }

    /**
     * Health check
     */
    async health() {
        return this.request('/health');
    }
}

// Export singleton instance
const api = new ApiClient();
export default api;
