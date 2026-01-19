# Quick Start Guide: Paper Repository

**Feature**: Paper Repository with Search and Add  
**Branch**: 001-paper-repository  
**Target Audience**: Developers and end users

---

## Prerequisites

### System Requirements
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher
- **Operating System**: macOS, Linux, or Windows
- **Browser**: Modern browser (Chrome, Firefox, Safari, Edge)

### Check Your Setup

```bash
node --version    # Should output v18.x.x or higher
npm --version     # Should output 8.x.x or higher
```

---

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd paper-repository
git checkout 001-paper-repository
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

**Expected dependencies** (minimal):
- `express` - Web framework (~30KB)
- `cors` - CORS middleware
- `xml2js` - Parse arXiv XML responses
- `uuid` - Generate unique IDs

### 3. Setup Data Directory

```bash
mkdir -p data/backups
touch data/papers.json
echo '{"version":"1.0.0","lastUpdated":"","papers":[]}' > data/papers.json
```

### 4. Configure Environment (Optional)

Create `backend/.env`:

```env
PORT=3000
NODE_ENV=development
ARXIV_API_URL=http://export.arxiv.org/api/query
DBLP_API_URL=https://dblp.org/search/publ/api
```

---

## Running the Application

### Start Backend Server

```bash
cd backend
npm start
```

**Expected output**:
```
🚀 Paper Repository API running on http://localhost:3000
📚 Ready to manage papers from arXiv and DBLP
```

### Access Frontend

Open your browser and navigate to:
```
http://localhost:3000
```

The backend serves the frontend as static files from `frontend/` directory.

---

## Basic Usage

### 1. Search for Papers

**In the UI**:
1. Enter search terms in the search box (e.g., "machine learning")
2. Click "Search" or press Enter
3. Results appear below with paper details

**Via API**:
```bash
curl "http://localhost:3000/api/search?q=machine%20learning&limit=5"
```

### 2. Add a Paper

**Option A: Search by Terms (Recommended)**

1. Click "Add Paper" button
2. Select "Search by Terms" option
3. Choose source (arXiv or DBLP)
4. Enter search terms (e.g., "machine learning transformers")
5. Click "Search" to see results
6. Click "➕ Add to Repository" on any paper you want to add
7. Paper is added automatically with confirmation

**Option B: From arXiv by ID**

1. Click "Add Paper" button
2. Select "By ID" option, then choose "arXiv"
3. Enter arXiv ID (e.g., `1706.03762`)
4. Click "Fetch & Add"

**Option C: From DBLP by ID**

1. Click "Add Paper" button
2. Select "By ID" option, then choose "DBLP"
3. Enter DOI or search term
4. Click "Fetch & Add"

**Option D: Manual Entry**

1. Click "Add Paper" → "Manual Entry"
2. Fill in all required fields:
   - Title
   - Authors (at least one)
   - Abstract
   - Publication Date
   - URL
3. Click "Add to Repository"

**Via API**:
```bash
# Search external sources
curl "http://localhost:3000/api/external-search?q=neural%20networks&source=arxiv&limit=10"

# Fetch from arXiv
curl -X POST http://localhost:3000/api/fetch \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "1706.03762",
    "source": "arxiv",
    "autoAdd": true
  }'

# Manual add
curl -X POST http://localhost:3000/api/papers \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Example Paper",
    "authors": [{"name": "John Doe"}],
    "abstract": "This is an example abstract...",
    "publicationDate": "2026-01-19",
    "source": "manual",
    "url": "https://example.com/paper",
    "year": 2026
  }'
```

### 3. Browse Repository

**In the UI**:
- Click "Browse All Papers" to see complete collection
- Use filters to narrow by source or year
- Sort by date, citations, or title

**Via API**:
```bash
# List all papers
curl "http://localhost:3000/api/papers"

# With filtering
curl "http://localhost:3000/api/papers?source=arxiv&year=2017&sort=citations"
```

### 4. View Paper Details

**In the UI**:
- Click on any paper card to expand details
- View full abstract, authors, metadata
- Click links to open original paper or PDF

**Via API**:
```bash
curl "http://localhost:3000/api/papers/a3f5d8e2-4b6c-4f89-9a2e-5d7c8b3e4f5a"
```

### 5. Delete a Paper

**In the UI**:
- Click the delete icon (🗑️) on a paper card
- Confirm deletion in the dialog

**Via API**:
```bash
curl -X DELETE "http://localhost:3000/api/papers/a3f5d8e2-4b6c-4f89-9a2e-5d7c8b3e4f5a"
```

---

## API Reference

### Base URL
```
http://localhost:3000/api
```

### Common Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/papers` | List all papers |
| GET | `/papers/:id` | Get specific paper |
| POST | `/papers` | Add paper (manual) |
| DELETE | `/papers/:id` | Remove paper |
| GET | `/search?q=query` | Search papers in repository |
| GET | `/external-search?q=query&source=arxiv\|dblp&limit=N` | Search papers in external sources |
| POST | `/fetch` | Fetch from arXiv/DBLP by ID |
| GET | `/health` | Health check |

**Full API documentation**: See [contracts/openapi.yaml](contracts/openapi.yaml)

---

## Configuration Options

### Backend Configuration

Edit `backend/src/config.js`:

```javascript
module.exports = {
  port: process.env.PORT || 3000,
  dataPath: './data/papers.json',
  backupPath: './data/backups',
  maxBackups: 10,
  
  // Search settings
  resultsPerPage: 20,
  maxResultsPerPage: 100,
  
  // External APIs
  arxivApiUrl: 'http://export.arxiv.org/api/query',
  arxivRateLimit: 3000, // ms between requests
  dblpApiUrl: 'https://dblp.org/search/publ/api',
  
  // Caching
  cacheEnabled: true,
  cacheTTL: 300000, // 5 minutes in ms
  maxCacheSize: 100
};
```

### Frontend Customization

Edit `frontend/src/styles/main.css` to customize colors and layout.

**Using Tailwind utilities**:
```html
<div class="tw-flex tw-items-center tw-justify-between">
  <!-- Tailwind spacing and flexbox -->
</div>
```

**Using Bootstrap components**:
```html
<button class="btn btn-primary">
  <!-- Bootstrap button styles -->
</button>
```

---

## Troubleshooting

### Backend won't start

**Error**: "Port 3000 already in use"
- **Solution**: Change port in `.env` or stop other service using port 3000

**Error**: "Cannot find module 'express'"
- **Solution**: Run `npm install` in backend directory

### Papers not loading

**Check backend logs**:
```bash
cd backend
npm start
# Look for error messages
```

**Verify data file**:
```bash
cat backend/data/papers.json
# Should contain valid JSON with papers array
```

### Search returns no results

- Ensure papers exist in repository (check `/api/papers`)
- Verify search query isn't too specific
- Check backend logs for errors during search

### External API fetch fails

**arXiv timeout**:
- Check internet connection
- Verify arXiv ID format (e.g., `1706.03762`)
- arXiv API may be down (check https://status.arxiv.org)

**DBLP not found**:
- Verify DOI format starts with `10.`
- Paper may not be indexed in DBLP yet
- Try searching directly on dblp.org first

---

## Development Mode

### Enable Hot Reload (Optional)

Install nodemon:
```bash
npm install --save-dev nodemon
```

Update `backend/package.json`:
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

Run with auto-restart:
```bash
npm run dev
```

### Enable Debug Logging

Set environment variable:
```bash
DEBUG=paper-repo:* npm start
```

### Test API with Swagger UI

1. Go to https://editor.swagger.io
2. Import `specs/001-paper-repository/contracts/openapi.yaml`
3. Use "Try it out" feature to test endpoints

---

## Testing

### Manual Test Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads at http://localhost:3000
- [ ] Can search for "machine learning" and see results
- [ ] Can add paper from arXiv (ID: 1706.03762)
- [ ] Can add paper from DBLP
- [ ] Can manually add custom paper
- [ ] Duplicate paper shows error message
- [ ] Can view paper details
- [ ] Can delete a paper
- [ ] Browse all papers works with filters

### Automated Tests (Future)

```bash
cd backend
npm test
```

---

## Data Management

### Backup Data

```bash
# Manual backup
cp backend/data/papers.json backend/data/backups/papers-$(date +%Y%m%d-%H%M%S).json
```

**Automatic backups** are created before each write operation in `data/backups/`.

### Restore from Backup

```bash
# List backups
ls -lh backend/data/backups/

# Restore specific backup
cp backend/data/backups/papers-20260119-143022.json backend/data/papers.json

# Restart server
npm start
```

### Export Data

Papers are stored in JSON format and can be exported directly:

```bash
# Copy papers.json to another location
cp backend/data/papers.json ~/Desktop/my-papers-backup.json
```

### Import Data

To import papers from another repository:

```javascript
// In Node.js or browser console
const newPapers = [ /* array of paper objects */ ];
fetch('http://localhost:3000/api/papers', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify(newPapers[0])
});
// Repeat for each paper or create batch endpoint
```

---

## Production Deployment

### Prepare for Production

1. **Set environment variables**:
```bash
export NODE_ENV=production
export PORT=3000
```

2. **Disable debug logging**:
Edit `backend/src/server.js` to remove `console.log` statements

3. **Enable CORS restrictions**:
```javascript
// backend/src/server.js
app.use(cors({
  origin: 'https://yourdomain.com'
}));
```

### Deploy to Heroku

```bash
# Install Heroku CLI
heroku login
heroku create paper-repository

# Deploy
git push heroku 001-paper-repository:main

# View logs
heroku logs --tail
```

### Deploy to Railway

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select repository and branch `001-paper-repository`
4. Railway auto-detects Node.js and deploys
5. Access via generated URL

### Self-Hosted with PM2

```bash
# Install PM2
npm install -g pm2

# Start application
cd backend
pm2 start src/server.js --name paper-repo

# Setup auto-restart on server reboot
pm2 startup
pm2 save

# View logs
pm2 logs paper-repo
```

---

## Next Steps

After getting started:

1. **Customize UI**: Edit frontend styles and layout
2. **Add more papers**: Build your personal collection
3. **Explore API**: Use the REST API in your own tools
4. **Feature requests**: See `spec.md` for planned P3 features
5. **Contribute**: Add citation generation, advanced filters

---

## Support & Resources

- **Feature Spec**: [spec.md](spec.md)
- **Data Model**: [data-model.md](data-model.md)
- **API Contracts**: [contracts/openapi.yaml](contracts/openapi.yaml)
- **Research Notes**: [research.md](research.md)

---

## Quick Reference Card

```bash
# Start backend
cd backend && npm start

# Access frontend
open http://localhost:3000

# Search papers
curl "http://localhost:3000/api/search?q=deep+learning"

# Add from arXiv
curl -X POST http://localhost:3000/api/fetch \
  -H "Content-Type: application/json" \
  -d '{"identifier":"1706.03762","source":"arxiv","autoAdd":true}'

# List all papers
curl http://localhost:3000/api/papers

# Health check
curl http://localhost:3000/api/health
```

---

**Last Updated**: 2026-01-19  
**Version**: 1.0.0
