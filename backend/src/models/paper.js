import { randomUUID } from 'crypto';

/**
 * Author model - embedded in Paper
 */
export class Author {
    constructor(data) {
        this.name = data.name;
        this.affiliation = data.affiliation || null;
    }
}

/**
 * Paper model with validation
 */
export class Paper {
    constructor(data) {
        this.id = data.id || randomUUID();
        this.doi = data.doi || null;
        this.title = data.title;
        this.authors = (data.authors || []).map(a => new Author(a));
        this.abstract = data.abstract;
        this.publicationDate = data.publicationDate;
        this.source = data.source; // 'arxiv' | 'dblp' | 'manual'
        this.sourceId = data.sourceId || null;
        this.keywords = data.keywords || [];
        this.url = data.url;
        this.pdfUrl = data.pdfUrl || null;
        this.venue = data.venue || null;
        this.year = data.year;
        this.citations = data.citations || 0;
        this.addedAt = data.addedAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    /**
     * Update timestamp
     */
    touch() {
        this.updatedAt = new Date().toISOString();
    }
}

/**
 * Validation functions
 */
export function validateDOI(doi) {
    if (!doi) return true; // Optional field
    return /^10\.\d{4,}/.test(doi);
}

export function validateDate(dateStr) {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return !isNaN(date.getTime()) && /^\d{4}-\d{2}-\d{2}/.test(dateStr);
}

export function validateUrl(url) {
    if (!url) return false;
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

export function validatePaper(paper) {
    const errors = [];

    // Required fields
    if (!paper.title || paper.title.trim().length === 0) {
        errors.push('Title is required');
    }
    if (paper.title && paper.title.length > 500) {
        errors.push('Title must be less than 500 characters');
    }

    if (!paper.authors || paper.authors.length === 0) {
        errors.push('At least one author is required');
    } else {
        paper.authors.forEach((author, idx) => {
            if (!author.name || author.name.trim().length === 0) {
                errors.push(`Author ${idx + 1} name is required`);
            }
        });
    }

    if (!paper.abstract || paper.abstract.trim().length < 10) {
        errors.push('Abstract must be at least 10 characters');
    }
    if (paper.abstract && paper.abstract.length > 5000) {
        errors.push('Abstract must be less than 5000 characters');
    }

    // DOI format
    if (paper.doi && !validateDOI(paper.doi)) {
        errors.push('Invalid DOI format (must start with 10.)');
    }

    // Date validation
    if (!paper.publicationDate) {
        errors.push('Publication date is required');
    } else if (!validateDate(paper.publicationDate)) {
        errors.push('Invalid publication date format (use YYYY-MM-DD)');
    }

    // URL validation
    if (!paper.url) {
        errors.push('URL is required');
    } else if (!validateUrl(paper.url)) {
        errors.push('Invalid URL format');
    }

    if (paper.pdfUrl && !validateUrl(paper.pdfUrl)) {
        errors.push('Invalid PDF URL format');
    }

    // Source enum
    if (!['arxiv', 'dblp', 'manual'].includes(paper.source)) {
        errors.push('Invalid source (must be arxiv, dblp, or manual)');
    }

    // Year
    if (!paper.year || typeof paper.year !== 'number') {
        errors.push('Year is required and must be a number');
    } else if (paper.year < 1900 || paper.year > 2100) {
        errors.push('Year must be between 1900 and 2100');
    }

    // Year consistency
    if (paper.publicationDate && paper.year) {
        const dateYear = new Date(paper.publicationDate).getFullYear();
        if (dateYear !== paper.year) {
            errors.push('Year must match publication date year');
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}
