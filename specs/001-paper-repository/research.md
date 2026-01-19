# Research & Technology Decisions

**Feature**: Paper Repository with Search and Add  
**Branch**: 001-paper-repository  
**Date**: 2026-01-19

## Overview

This document captures research findings and technology decisions for building a paper repository system with minimal dependencies, focusing on simplicity and maintainability.

---

## Technology Stack Research

### Backend Language: Node.js with JavaScript

**Decision**: Use Node.js 18+ with native ES2022 JavaScript

**Rationale**:
- Native async/await support for API calls to arXiv/DBLP
- Large ecosystem but can be used with minimal dependencies
- Built-in `fetch` API in Node.js 18+ eliminates need for heavy HTTP libraries
- JSON handling is first-class, perfect for paper metadata
- Cross-platform compatibility (macOS, Linux, Windows)

**Alternatives Considered**:
- Python with FastAPI: More heavyweight, requires virtual env management
- Go: Compiled language adds complexity, overkill for this use case
- Deno: Less mature ecosystem, potential compatibility issues

### Web Framework: Express.js

**Decision**: Express.js 4.x for REST API

**Rationale**:
- Minimalist framework (only ~30KB)
- Well-documented and stable
- Middleware system allows adding only what's needed
- No opinion on project structure (flexibility)
- Wide adoption means easy troubleshooting

**Alternatives Considered**:
- Fastify: Similar but less familiar for most developers
- Koa: More modern but smaller community
- Native http module: Too low-level, reinventing the wheel

### Data Storage: File-based JSON

**Decision**: JSON file (papers.json) with in-memory caching

**Rationale**:
- Zero database setup required
- Human-readable for debugging
- Version control friendly
- Sufficient for 1000 papers (~5MB max)
- Easy backup and migration
- Node.js native JSON parsing is fast

**Alternatives Considered**:
- SQLite: Adds dependency, overkill for simple CRUD
- MongoDB: Requires separate server process
- PostgreSQL: Far too heavy for this use case

**Migration Path**: If scale exceeds 5000 papers, migrate to SQLite with minimal code changes (same API interface)

### Frontend Framework: Vanilla JavaScript + Bootstrap + Tailwind

**Decision**: No frontend framework, use vanilla JS with Bootstrap 5 + Tailwind CSS 3

**Rationale**:
- Minimal dependencies requirement from user
- Bootstrap provides UI components (buttons, forms, cards)
- Tailwind provides utility-first styling for custom touches
- No build step required (CDN links)
- Fast initial load time
- Easy to understand and modify

**Alternatives Considered**:
- React/Vue: Adds build tooling, complexity, and dependencies
- jQuery: Outdated, modern browser APIs sufficient
- Alpine.js: Small but still adds framework overhead

**Note**: Bootstrap and Tailwind can coexist by using Tailwind utilities for spacing/colors and Bootstrap components for structure

---

## API Integration Research

### arXiv API

**Endpoint**: `http://export.arxiv.org/api/query`

**Search Parameters**:
- `search_query`: Support for `ti:` (title), `au:` (author), `all:` (all fields)
- `start`: Pagination offset
- `max_results`: Limit results (default 10)

**Response Format**: Atom XML feed with entries containing:
- `id`: arXiv ID
- `title`, `summary`, `author`, `published`, `updated`
- `arxiv:doi` (if available)
- `link`: PDF and abstract URLs

**Best Practices**:
- Use `xml2js` library for parsing (lightweight, ~50KB)
- Implement retry logic with exponential backoff (rate limit: 3 req/sec)
- Cache responses for 24 hours to reduce API calls
- Map arXiv categories to keywords

**Rate Limits**: Maximum 1 request every 3 seconds

### DBLP API

**Endpoint**: `https://dblp.org/search/publ/api`

**Search Parameters**:
- `q`: Query string (supports boolean operators)
- `format`: json
- `h`: Number of hits (max 1000)

**Response Format**: JSON with `result.hits.hit[]` containing:
- `@id`: DBLP key
- `info.title`, `info.authors`, `info.year`, `info.doi`, `info.venue`

**Best Practices**:
- Native JSON parsing, no extra library needed
- Combine with DOI lookup for full paper metadata
- DBLP has better conference/journal metadata
- No strict rate limits but recommend 1 req/sec

---

## Architecture Patterns

### RESTful API Design

**Decision**: Simple REST endpoints following resource-based design

**Endpoints**:
```
GET    /api/papers              # List all papers
GET    /api/papers/:id          # Get single paper
POST   /api/papers              # Add paper
DELETE /api/papers/:id          # Remove paper
GET    /api/search?q=:query     # Search papers
POST   /api/fetch               # Fetch from arXiv/DBLP
```

**Rationale**:
- Standard HTTP methods (GET, POST, DELETE)
- Self-documenting URLs
- Status codes communicate errors (200, 201, 400, 404, 500)
- JSON request/response bodies

### Error Handling Strategy

**Decision**: Centralized error middleware + standard error responses

**Pattern**:
```javascript
{
  "error": "Error type",
  "message": "Human-readable message",
  "details": {} // Optional
}
```

**Error Categories**:
- Validation errors (400): Invalid DOI, missing fields
- Not found (404): Paper doesn't exist
- External API errors (502): arXiv/DBLP timeout or error
- Server errors (500): Unexpected internal errors

### Duplicate Detection

**Decision**: Use DOI as unique identifier, fallback to title+first author

**Rationale**:
- DOI is globally unique and standard
- Not all papers have DOIs (especially older ones)
- Title + first author provides 95% uniqueness
- Check before adding, return existing paper if found

---

## Performance Optimization

### Caching Strategy

**Decision**: In-memory LRU cache for search results and external API responses

**Implementation**:
- Use simple JavaScript Map with timestamp
- Cache search results for 5 minutes
- Cache arXiv/DBLP responses for 24 hours
- Max 100 cached entries (evict oldest)

**Rationale**:
- Reduces external API calls
- Improves search response time from 3s to <200ms
- No external cache dependency (Redis, Memcached)

### Frontend Performance

**Decision**: Lazy loading + pagination

**Implementation**:
- Display 20 papers per page
- Fetch additional pages on scroll
- Debounce search input (300ms delay)
- Show loading indicators for async operations

**Rationale**:
- Better UX for large result sets
- Reduces initial load time
- Prevents excessive API calls during typing

---

## Security Considerations

### Input Validation

**Decision**: Validate all user inputs on backend

**Rules**:
- DOI format: `/^10\.\d{4,}/` regex
- Query strings: Max 200 chars, sanitize HTML
- No SQL injection risk (JSON storage)
- Validate URLs from arXiv/DBLP responses

### CORS Configuration

**Decision**: Enable CORS for localhost development, restrict in production

**Configuration**:
```javascript
cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://yourdomain.com' 
    : 'http://localhost:*'
})
```

---

## Testing Strategy

### Backend Testing

**Decision**: Use Node.js built-in test runner (Node 18+) with manual mocks

**Test Coverage**:
- Unit tests: Paper model, validation functions
- Integration tests: API endpoints with mock storage
- Contract tests: Verify arXiv/DBLP response parsing

**Rationale**:
- No test framework dependency required
- Native assertions sufficient
- Manual mocks keep tests simple

### Frontend Testing

**Decision**: Manual testing with test checklist

**Test Checklist**:
- Search returns expected results
- Add paper shows success/error messages
- Duplicate detection works
- UI responsive on mobile
- Accessibility (keyboard navigation, screen readers)

**Rationale**:
- Minimal UI complexity doesn't justify test framework overhead
- Visual regression testing more valuable than unit tests

---

## Deployment Considerations

### Development Environment

**Requirements**:
- Node.js 18 or higher
- npm 8 or higher
- Text editor (VS Code recommended)

**Setup**:
```bash
cd backend && npm install
node src/server.js
# Frontend served from backend static route
```

### Production Deployment

**Options**:
1. **Heroku**: Free tier, auto-deploy from Git
2. **Vercel**: Serverless functions + static hosting
3. **Railway**: Simple Node.js hosting
4. **Self-hosted**: PM2 process manager + nginx reverse proxy

**Recommendation**: Start with Railway or Heroku for simplicity

---

## Open Questions (Resolved)

All technical unknowns from Technical Context have been researched and documented above. No remaining clarifications needed for Phase 1 design.

---

## References

- [arXiv API User Manual](https://arxiv.org/help/api/user-manual)
- [DBLP API Documentation](https://dblp.org/faq/How+to+use+the+dblp+search+API.html)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Node.js 18 Release Notes](https://nodejs.org/en/blog/release/v18.0.0)
- [REST API Design Best Practices](https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/)
