# API Contracts Summary

**Feature**: Paper Repository  
**Branch**: 001-paper-repository  
**Version**: 1.0.0

## Overview

This directory contains the API contract definitions for the Paper Repository backend API.

## Files

- **[openapi.yaml](openapi.yaml)**: Complete OpenAPI 3.0.3 specification defining all REST endpoints, request/response schemas, and error codes

## Key Endpoints

### Papers Management
- `GET /api/papers` - List all papers with pagination
- `GET /api/papers/:id` - Get specific paper by ID
- `POST /api/papers` - Add new paper to repository
- `DELETE /api/papers/:id` - Remove paper from repository

### Search & Discovery
- `GET /api/search?q=query` - Full-text search across papers

### External Integration
- `POST /api/fetch` - Fetch paper metadata from arXiv or DBLP APIs

### Health Check
- `GET /api/health` - API status check

## Data Models

### Paper
Primary entity with fields:
- Identification: `id`, `doi`, `sourceId`
- Metadata: `title`, `authors`, `abstract`, `keywords`
- Publishing: `publicationDate`, `year`, `venue`, `source`
- Links: `url`, `pdfUrl`
- Metrics: `citations`
- Timestamps: `addedAt`, `updatedAt`

### Author
Embedded in Paper:
- `name` (required)
- `affiliation` (optional)

## Response Formats

### Success (200/201)
```json
{
  "paper": { /* Paper object */ },
  "message": "Success message"
}
```

### Error (4xx/5xx)
```json
{
  "error": "ErrorType",
  "message": "Human-readable message",
  "details": { /* Optional context */ }
}
```

## Status Codes

- **200**: Success
- **201**: Created
- **400**: Validation error
- **404**: Not found
- **409**: Duplicate paper
- **500**: Server error
- **502**: External API error

## Validation Rules

See data-model.md for complete validation specifications.

## Authentication

Currently no authentication (single-user MVP). Future versions may add JWT bearer tokens for multi-user scenarios.

## Testing the API

View and interact with the API using:
- Swagger UI: Import openapi.yaml into https://editor.swagger.io
- Postman: Import openapi.yaml as collection
- cURL: Use examples from spec

## Version History

- **1.0.0** (2026-01-19): Initial API specification
