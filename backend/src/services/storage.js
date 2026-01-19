import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, '../../data/papers.json');
const BACKUP_PATH = path.join(__dirname, '../../data/backups');

// Simple file lock
const locks = new Map();

async function acquireLock(key) {
    while (locks.get(key)) {
        await new Promise(resolve => setTimeout(resolve, 10));
    }
    locks.set(key, true);
}

function releaseLock(key) {
    locks.delete(key);
}

/**
 * Storage service for managing papers
 */
class StorageService {
    /**
     * Read all papers from storage
     */
    async readPapers() {
        await acquireLock('papers');
        try {
            if (!existsSync(DATA_PATH)) {
                return { version: '1.0.0', lastUpdated: '', papers: [] };
            }
            const data = await fs.readFile(DATA_PATH, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading papers:', error);
            return { version: '1.0.0', lastUpdated: '', papers: [] };
        } finally {
            releaseLock('papers');
        }
    }

    /**
     * Write papers to storage with backup
     */
    async writePapers(data) {
        await acquireLock('papers');
        try {
            // Create backup first
            await this.createBackup();

            // Update timestamp
            data.lastUpdated = new Date().toISOString();

            // Write to file
            await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');

            // Cleanup old backups
            await this.cleanupBackups();

            return true;
        } catch (error) {
            console.error('Error writing papers:', error);
            throw error;
        } finally {
            releaseLock('papers');
        }
    }

    /**
     * Get all papers
     */
    async getAllPapers() {
        const data = await this.readPapers();
        return data.papers || [];
    }

    /**
     * Get paper by ID
     */
    async getPaperById(id) {
        const papers = await this.getAllPapers();
        return papers.find(p => p.id === id);
    }

    /**
     * Add a new paper
     */
    async addPaper(paper) {
        const data = await this.readPapers();

        // Check for duplicates
        const duplicate = this.findDuplicate(data.papers, paper);
        if (duplicate) {
            return { duplicate: true, existing: duplicate };
        }

        data.papers.push(paper);
        await this.writePapers(data);

        return { duplicate: false, paper };
    }

    /**
     * Update a paper
     */
    async updatePaper(id, updates) {
        const data = await this.readPapers();
        const index = data.papers.findIndex(p => p.id === id);

        if (index === -1) {
            return null;
        }

        data.papers[index] = { ...data.papers[index], ...updates, updatedAt: new Date().toISOString() };
        await this.writePapers(data);

        return data.papers[index];
    }

    /**
     * Delete a paper
     */
    async deletePaper(id) {
        const data = await this.readPapers();
        const initialLength = data.papers.length;

        data.papers = data.papers.filter(p => p.id !== id);

        if (data.papers.length === initialLength) {
            return false; // Not found
        }

        await this.writePapers(data);
        return true;
    }

    /**
     * Find duplicate paper
     */
    findDuplicate(papers, newPaper) {
        // Check DOI first
        if (newPaper.doi) {
            const doiMatch = papers.find(p => p.doi && p.doi === newPaper.doi);
            if (doiMatch) return doiMatch;
        }

        // Fallback to title + first author
        if (newPaper.title && newPaper.authors && newPaper.authors.length > 0) {
            const titleLower = newPaper.title.toLowerCase().trim();
            const firstAuthor = newPaper.authors[0].name.toLowerCase().trim();

            const titleAuthorMatch = papers.find(p => {
                if (!p.title || !p.authors || p.authors.length === 0) return false;
                const pTitleLower = p.title.toLowerCase().trim();
                const pFirstAuthor = p.authors[0].name.toLowerCase().trim();
                return pTitleLower === titleLower && pFirstAuthor === firstAuthor;
            });

            if (titleAuthorMatch) return titleAuthorMatch;
        }

        return null;
    }

    /**
     * Search papers with relevance scoring
     */
    searchPapers(papers, query) {
        const lowerQuery = query.toLowerCase().trim();

        if (!lowerQuery) {
            return papers;
        }

        const results = papers
            .map(paper => {
                const score = this.calculateRelevance(paper, lowerQuery);
                return { paper, score };
            })
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(item => item.paper);

        return results;
    }

    /**
     * Calculate relevance score for a paper
     */
    calculateRelevance(paper, query) {
        let score = 0;

        // Title match (weight: 3x)
        if (paper.title && paper.title.toLowerCase().includes(query)) {
            score += 3;
        }

        // Author match (weight: 2x)
        if (paper.authors) {
            const authorMatch = paper.authors.some(a =>
                a.name && a.name.toLowerCase().includes(query)
            );
            if (authorMatch) score += 2;
        }

        // Keywords match (weight: 2x)
        if (paper.keywords) {
            const keywordMatch = paper.keywords.some(k =>
                k && k.toLowerCase().includes(query)
            );
            if (keywordMatch) score += 2;
        }

        // Abstract match (weight: 1x)
        if (paper.abstract && paper.abstract.toLowerCase().includes(query)) {
            score += 1;
        }

        // Venue match (weight: 1x)
        if (paper.venue && paper.venue.toLowerCase().includes(query)) {
            score += 1;
        }

        return score;
    }

    /**
     * Create backup of current data
     */
    async createBackup() {
        try {
            if (!existsSync(DATA_PATH)) return;

            // Ensure backup directory exists
            if (!existsSync(BACKUP_PATH)) {
                await fs.mkdir(BACKUP_PATH, { recursive: true });
            }

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFile = path.join(BACKUP_PATH, `papers-${timestamp}.json`);

            const data = await fs.readFile(DATA_PATH, 'utf-8');
            await fs.writeFile(backupFile, data, 'utf-8');
        } catch (error) {
            console.error('Error creating backup:', error);
        }
    }

    /**
     * Cleanup old backups (keep last 10)
     */
    async cleanupBackups() {
        try {
            if (!existsSync(BACKUP_PATH)) return;

            const files = await fs.readdir(BACKUP_PATH);
            const backupFiles = files
                .filter(f => f.startsWith('papers-') && f.endsWith('.json'))
                .map(f => ({
                    name: f,
                    path: path.join(BACKUP_PATH, f),
                    time: f.replace('papers-', '').replace('.json', '')
                }))
                .sort((a, b) => b.time.localeCompare(a.time));

            // Keep only last 10
            const toDelete = backupFiles.slice(10);

            for (const file of toDelete) {
                await fs.unlink(file.path);
            }
        } catch (error) {
            console.error('Error cleaning up backups:', error);
        }
    }
}

export default new StorageService();
