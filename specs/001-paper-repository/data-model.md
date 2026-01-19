# Data Model: Paper Repository

**Feature**: Paper Repository with Search and Add  
**Branch**: 001-paper-repository  
**Date**: 2026-01-19

## Overview

This document defines the data structures, entities, relationships, and validation rules for the paper repository system.

---

## Core Entities

### Paper

The primary entity representing an academic research paper.

**Schema**:

```javascript
{
  id: String,              // UUID v4 generated on creation
  doi: String,             // Digital Object Identifier (optional, but unique if present)
  title: String,           // Paper title (required)
  authors: Array<Author>,  // List of authors (at least one required)
  abstract: String,        // Paper abstract/summary (required)
  publicationDate: String, // ISO 8601 date (YYYY-MM-DD)
  source: String,          // Origin: "arxiv" | "dblp" | "manual"
  sourceId: String,        // Original ID from source (e.g., "2101.12345")
  keywords: Array<String>, // Extracted or manual keywords
  url: String,             // Primary URL (paper page)
  pdfUrl: String,          // Direct PDF link (optional)
  venue: String,           // Journal/Conference name (optional)
  year: Number,            // Publication year
  citations: Number,       // Citation count (optional, default 0)
  addedAt: String,         // ISO 8601 timestamp when added to repository
  updatedAt: String        // ISO 8601 timestamp of last update
}
```

**Field Details**:

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `id` | String | Yes | UUID v4 format | Internal unique identifier |
| `doi` | String | No | Match `/^10\.\d{4,}/` | DOI if available, must be unique |
| `title` | String | Yes | 1-500 chars | Paper title |
| `authors` | Array | Yes | Min 1 author | Author objects |
| `abstract` | String | Yes | 10-5000 chars | Paper summary |
| `publicationDate` | String | Yes | ISO 8601 date | When paper was published |
| `source` | String | Yes | Enum: arxiv, dblp, manual | Where paper came from |
| `sourceId` | String | No | Source-specific format | Original ID from source |
| `keywords` | Array | No | Max 20 keywords | Searchable terms |
| `url` | String | Yes | Valid URL | Link to paper page |
| `pdfUrl` | String | No | Valid URL | Direct PDF link |
| `venue` | String | No | 1-200 chars | Journal or conference |
| `year` | Number | Yes | 1900-2100 | Publication year |
| `citations` | Number | No | >= 0 | Citation count |
| `addedAt` | String | Yes | ISO 8601 timestamp | Repository addition time |
| `updatedAt` | String | Yes | ISO 8601 timestamp | Last modification time |

**Example**:

```json
{
  "id": "a3f5d8e2-4b6c-4f89-9a2e-5d7c8b3e4f5a",
  "doi": "10.48550/arXiv.2101.12345",
  "title": "Attention Is All You Need",
  "authors": [
    {
      "name": "Ashish Vaswani",
      "affiliation": "Google Brain"
    },
    {
      "name": "Noam Shazeer",
      "affiliation": "Google Brain"
    }
  ],
  "abstract": "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks...",
  "publicationDate": "2017-06-12",
  "source": "arxiv",
  "sourceId": "1706.03762",
  "keywords": ["attention", "transformer", "neural networks", "NLP"],
  "url": "https://arxiv.org/abs/1706.03762",
  "pdfUrl": "https://arxiv.org/pdf/1706.03762.pdf",
  "venue": "NeurIPS 2017",
  "year": 2017,
  "citations": 85000,
  "addedAt": "2026-01-19T10:30:00.000Z",
  "updatedAt": "2026-01-19T10:30:00.000Z"
}
```

---

### Author

Represents a paper author (embedded in Paper entity).

**Schema**:

```javascript
{
  name: String,        // Full name (required)
  affiliation: String  // Institution/organization (optional)
}
```

**Field Details**:

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `name` | String | Yes | 1-200 chars | Author full name |
| `affiliation` | String | No | 1-200 chars | Institution name |

**Example**:

```json
{
  "name": "Yann LeCun",
  "affiliation": "New York University"
}
```

---

### SearchQuery

Represents a search operation (not stored, used in API).

**Schema**:

```javascript
{
  query: String,          // Search terms
  filters: {
    source: String,       // Filter by source: "arxiv" | "dblp" | "all"
    year: Number,         // Filter by publication year
    yearRange: {
      min: Number,
      max: Number
    }
  },
  sort: String,           // Sort by: "relevance" | "date" | "citations"
  page: Number,           // Pagination page number (default 1)
  limit: Number           // Results per page (default 20, max 100)
}
```

---

## Relationships

### Paper ↔ Repository

- **Type**: One-to-Many
- **Description**: Repository contains multiple papers
- **Implementation**: Array of Paper objects in `papers.json`
- **Uniqueness**: Enforced by `doi` (if present) or `title + authors[0].name`

### No Complex Relations

This is a **flat data model** with no foreign keys or joins:
- Papers are independent entities
- No user/collection relationships (single-user system)
- No paper-to-paper relationships (citations tracked as count only)

---

## Validation Rules

### Paper Validation

**On Creation** (POST /api/papers):

1. **Required Fields**: title, authors, abstract, publicationDate, source, url, year
2. **DOI Uniqueness**: If DOI provided, must not exist in repository
3. **Title+Author Uniqueness**: If no DOI, check title + first author combination
4. **Date Format**: publicationDate must be valid ISO 8601 (YYYY-MM-DD)
5. **Year Consistency**: year must match publicationDate year
6. **URL Validity**: url and pdfUrl (if present) must be valid HTTP/HTTPS URLs
7. **Source Enum**: source must be one of ["arxiv", "dblp", "manual"]
8. **Authors Array**: Must contain at least one author with non-empty name

**Validation Functions**:

```javascript
// backend/src/models/paper.js

function validatePaper(paper) {
  const errors = [];
  
  // Required fields
  if (!paper.title || paper.title.trim().length === 0) {
    errors.push("Title is required");
  }
  
  if (!paper.authors || paper.authors.length === 0) {
    errors.push("At least one author is required");
  }
  
  if (!paper.abstract || paper.abstract.trim().length < 10) {
    errors.push("Abstract must be at least 10 characters");
  }
  
  // DOI format
  if (paper.doi && !/^10\.\d{4,}/.test(paper.doi)) {
    errors.push("Invalid DOI format");
  }
  
  // Date validation
  if (paper.publicationDate && !isValidDate(paper.publicationDate)) {
    errors.push("Invalid publication date format (use YYYY-MM-DD)");
  }
  
  // URL validation
  if (paper.url && !isValidUrl(paper.url)) {
    errors.push("Invalid URL");
  }
  
  // Source enum
  if (!["arxiv", "dblp", "manual"].includes(paper.source)) {
    errors.push("Invalid source (must be arxiv, dblp, or manual)");
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

---

## State Transitions

Papers have minimal state changes:

```
[New Input] → [Validation] → [Duplicate Check] → [Added]
                   ↓                  ↓
              [Rejected]          [Duplicate]
                                 (return existing)

[Existing Paper] → [Update Request] → [Validation] → [Updated]
                                           ↓
                                      [Rejected]

[Existing Paper] → [Delete Request] → [Removed]
```

**State Rules**:
- Papers cannot be "edited" by users, only metadata can be updated
- Deletion is permanent (no soft delete for MVP)
- `updatedAt` timestamp changes on any modification

---

## Indexes & Search

### Full-Text Search Fields

Papers are searchable by:
- `title` (weighted: 3x)
- `authors[].name` (weighted: 2x)
- `keywords[]` (weighted: 2x)
- `abstract` (weighted: 1x)
- `venue` (weighted: 1x)

**Implementation**: In-memory search using simple string matching:

```javascript
function searchPapers(query, papers) {
  const lowerQuery = query.toLowerCase();
  
  return papers.filter(paper => {
    const titleMatch = paper.title.toLowerCase().includes(lowerQuery);
    const authorMatch = paper.authors.some(a => 
      a.name.toLowerCase().includes(lowerQuery)
    );
    const keywordMatch = paper.keywords?.some(k => 
      k.toLowerCase().includes(lowerQuery)
    );
    const abstractMatch = paper.abstract.toLowerCase().includes(lowerQuery);
    
    return titleMatch || authorMatch || keywordMatch || abstractMatch;
  }).sort((a, b) => {
    // Score-based ranking
    const scoreA = calculateRelevance(a, query);
    const scoreB = calculateRelevance(b, query);
    return scoreB - scoreA;
  });
}
```

### Sort Options

- **relevance**: Match score (default)
- **date**: publicationDate descending
- **citations**: citations count descending
- **title**: Alphabetical A-Z

---

## Data Persistence

### Storage Format

**File**: `backend/data/papers.json`

**Structure**:

```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-01-19T12:00:00.000Z",
  "papers": [
    { /* Paper object */ },
    { /* Paper object */ }
  ]
}
```

### Backup Strategy

1. **Automatic backups**: Create timestamped backup before each write
2. **Backup location**: `backend/data/backups/papers-{timestamp}.json`
3. **Retention**: Keep last 10 backups
4. **Recovery**: Manual restore by copying backup file

### Concurrency Handling

**Strategy**: Read-modify-write with file locking

```javascript
// Pseudo-code
async function addPaper(newPaper) {
  await acquireLock();
  try {
    const data = await readFile('papers.json');
    data.papers.push(newPaper);
    data.lastUpdated = new Date().toISOString();
    await writeFile('papers.json', data);
    await createBackup();
  } finally {
    await releaseLock();
  }
}
```

**Note**: For MVP, Node.js single-threaded nature provides sufficient concurrency control. Scale to SQLite if concurrent writes become an issue.

---

## Data Migration

### Version 1.0.0 (Initial)

Current schema as documented above.

### Future Versions

If schema changes are needed:

```javascript
function migrateData(oldData) {
  if (oldData.version === "1.0.0") {
    // Add new fields with defaults
    oldData.papers.forEach(paper => {
      paper.newField = "defaultValue";
    });
    oldData.version = "1.1.0";
  }
  return oldData;
}
```

---

## BibTeX Compatibility

Papers can be exported to BibTeX format for use with LaTeX:

```bibtex
@article{vaswani2017attention,
  title={Attention Is All You Need},
  author={Vaswani, Ashish and Shazeer, Noam and others},
  journal={arXiv preprint arXiv:1706.03762},
  year={2017},
  doi={10.48550/arXiv.2101.12345},
  url={https://arxiv.org/abs/1706.03762}
}
```

**Mapping**:
- `@article`: Default entry type
- `title` → title
- `authors[].name` → author (comma-separated)
- `year` → year
- `doi` → doi
- `url` → url
- `venue` → journal (if present)

---

## Summary

- **Primary Entity**: Paper (self-contained, no foreign keys)
- **Storage**: JSON file with backup strategy
- **Validation**: Comprehensive rules for data integrity
- **Search**: In-memory full-text search across multiple fields
- **Uniqueness**: DOI-based with title+author fallback
- **State**: Minimal (added, updated, removed)
- **Export**: BibTeX format for academic use
