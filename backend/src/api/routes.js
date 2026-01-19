import express from 'express';
import storage from '../services/storage.js';
import arxiv from '../services/arxiv.js';
import dblp from '../services/dblp.js';
import { Paper, validatePaper } from '../models/paper.js';
import { AppError } from './error-handler.js';

const router = express.Router();

/**
 * GET /api/papers - List all papers
 */
router.get('/papers', async (req, res, next) => {
    try {
        const papers = await storage.getAllPapers();

        // Apply filters
        let filtered = papers;

        if (req.query.source) {
            filtered = filtered.filter(p => p.source === req.query.source);
        }

        if (req.query.year) {
            const year = parseInt(req.query.year);
            filtered = filtered.filter(p => p.year === year);
        }

        // Apply sorting
        const sort = req.query.sort || 'date';
        filtered = filtered.sort((a, b) => {
            switch (sort) {
                case 'citations':
                    return (b.citations || 0) - (a.citations || 0);
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'date':
                default:
                    return new Date(b.publicationDate) - new Date(a.publicationDate);
            }
        });

        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const start = (page - 1) * limit;
        const end = start + limit;

        const paginated = filtered.slice(start, end);

        res.json({
            papers: paginated,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(filtered.length / limit),
                totalItems: filtered.length,
                itemsPerPage: limit,
                hasNext: end < filtered.length,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/papers/:id - Get single paper
 */
router.get('/papers/:id', async (req, res, next) => {
    try {
        const paper = await storage.getPaperById(req.params.id);

        if (!paper) {
            throw new AppError('Paper not found', 404);
        }

        res.json(paper);
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/papers - Add new paper
 */
router.post('/papers', async (req, res, next) => {
    try {
        // Validate input
        const validation = validatePaper(req.body);
        if (!validation.valid) {
            throw new AppError('Invalid input data', 400, {
                errors: validation.errors
            });
        }

        // Create paper
        const paper = new Paper(req.body);

        // Add to storage
        const result = await storage.addPaper(paper);

        if (result.duplicate) {
            return res.status(409).json({
                error: 'DuplicateError',
                message: 'Paper already exists in repository',
                existingPaper: result.existing
            });
        }

        res.status(201).json({
            paper: result.paper,
            message: 'Paper added successfully'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/papers/:id - Delete paper
 */
router.delete('/papers/:id', async (req, res, next) => {
    try {
        const deleted = await storage.deletePaper(req.params.id);

        if (!deleted) {
            throw new AppError('Paper not found', 404);
        }

        res.json({
            message: 'Paper deleted successfully',
            deletedId: req.params.id
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/search - Search papers
 */
router.get('/search', async (req, res, next) => {
    try {
        const query = req.query.q;

        if (!query || query.trim().length === 0) {
            throw new AppError('Search query is required', 400);
        }

        if (query.length > 200) {
            throw new AppError('Search query too long (max 200 characters)', 400);
        }

        const allPapers = await storage.getAllPapers();

        // Search with relevance scoring
        let results = storage.searchPapers(allPapers, query);

        // Apply filters
        if (req.query.source && req.query.source !== 'all') {
            results = results.filter(p => p.source === req.query.source);
        }

        // Apply sorting
        const sort = req.query.sort || 'relevance';
        if (sort !== 'relevance') {
            results = results.sort((a, b) => {
                switch (sort) {
                    case 'citations':
                        return (b.citations || 0) - (a.citations || 0);
                    case 'date':
                        return new Date(b.publicationDate) - new Date(a.publicationDate);
                    default:
                        return 0;
                }
            });
        }

        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const start = (page - 1) * limit;
        const end = start + limit;

        const paginated = results.slice(start, end);

        res.json({
            query: query,
            results: paginated,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(results.length / limit),
                totalItems: results.length,
                itemsPerPage: limit,
                hasNext: end < results.length,
                hasPrev: page > 1
            },
            totalResults: results.length
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/external-search - Search papers in external sources
 */
router.get('/external-search', async (req, res, next) => {
    try {
        const { q, source, limit } = req.query;

        if (!q || q.trim().length === 0) {
            throw new AppError('Search query is required', 400);
        }

        if (!source || !['arxiv', 'dblp'].includes(source)) {
            throw new AppError('Valid source (arxiv or dblp) is required', 400);
        }

        const maxResults = Math.min(parseInt(limit) || 10, 50);

        let results = [];

        try {
            if (source === 'arxiv') {
                results = await arxiv.search(q, maxResults);
            } else if (source === 'dblp') {
                results = await dblp.search(q, maxResults);
            }
        } catch (searchError) {
            throw new AppError(`Failed to search ${source}: ${searchError.message}`, 502);
        }

        res.json({
            query: q,
            source,
            results,
            totalResults: results.length
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/fetch - Fetch paper from external API
 */
router.post('/fetch', async (req, res, next) => {
    try {
        const { identifier, source, autoAdd } = req.body;

        if (!identifier || !source) {
            throw new AppError('Identifier and source are required', 400);
        }

        if (!['arxiv', 'dblp'].includes(source)) {
            throw new AppError('Source must be arxiv or dblp', 400);
        }

        let paperData;

        // Fetch from appropriate service
        try {
            if (source === 'arxiv') {
                paperData = await arxiv.fetchPaper(identifier);
            } else if (source === 'dblp') {
                paperData = await dblp.searchPaper(identifier);
            }

            if (!paperData) {
                throw new AppError(`Paper not found in ${source}`, 404);
            }
        } catch (fetchError) {
            if (fetchError.statusCode) throw fetchError;
            throw new AppError(`Failed to fetch from ${source}: ${fetchError.message}`, 502);
        }

        // Create paper object
        const paper = new Paper(paperData);

        // Validate
        const validation = validatePaper(paper);
        if (!validation.valid) {
            throw new AppError('Fetched paper data is invalid', 400, {
                errors: validation.errors
            });
        }

        let added = false;

        // Auto-add if requested
        if (autoAdd) {
            const result = await storage.addPaper(paper);

            if (result.duplicate) {
                return res.status(409).json({
                    error: 'DuplicateError',
                    message: 'Paper already exists in repository',
                    paper: result.existing,
                    added: false
                });
            }

            added = true;
        }

        res.json({
            paper,
            added
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/health - Health check
 */
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

export default router;
