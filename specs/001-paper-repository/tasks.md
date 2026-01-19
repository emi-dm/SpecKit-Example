---

description: "Task list for Paper Repository implementation"
---

# Tasks: Paper Repository with Search and Add

**Branch**: `001-paper-repository`
**Input**: Design documents from `/specs/001-paper-repository/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in feature spec - tests are OPTIONAL and not included in this task list.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- File paths follow web app structure: `backend/src/`, `frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create backend directory structure: backend/src/{models,services,api}, backend/data/{backups}, backend/tests
- [X] T002 Create frontend directory structure: frontend/src/{components,pages,services,styles}, frontend/assets
- [X] T003 Initialize Node.js project in backend/ with package.json (Express, cors, xml2js, uuid dependencies)
- [X] T004 [P] Create backend/src/server.js with Express setup and static file serving for frontend
- [X] T005 [P] Create backend/data/papers.json with initial empty repository structure
- [X] T006 [P] Create backend/.env template with PORT, NODE_ENV, API URLs configuration
- [X] T007 [P] Create frontend/index.html with Bootstrap 5 and Tailwind CSS 3 CDN links

**Checkpoint**: Project structure initialized - ready for foundational work

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T008 Create Paper model class in backend/src/models/paper.js with schema validation
- [X] T009 Create Author model in backend/src/models/paper.js (embedded in Paper)
- [X] T010 Implement validation functions in backend/src/models/paper.js (validatePaper, validateDOI, validateDate)
- [X] T011 Create storage service in backend/src/services/storage.js with CRUD operations (read, write, backup)
- [X] T012 Implement file locking mechanism in backend/src/services/storage.js for concurrent access
- [X] T013 [P] Create API routes structure in backend/src/api/routes.js with Express router setup
- [X] T014 [P] Implement centralized error handling middleware in backend/src/api/error-handler.js
- [X] T015 [P] Create configuration file in backend/src/config.js with all settings from research.md
- [X] T016 [P] Setup CORS middleware in backend/src/server.js with development/production configuration
- [X] T017 [P] Create frontend API client in frontend/src/services/api.js with fetch wrapper functions

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Search Papers (Priority: P1) 🎯 MVP

**Goal**: Enable researchers to search for papers by title, author, or keywords and view relevant results

**Independent Test**: Perform a search query and verify relevant papers are returned from the repository with proper ranking

### Implementation for User Story 1

- [X] T018 [P] [US1] Create search function in backend/src/services/storage.js with full-text matching
- [X] T019 [P] [US1] Implement relevance scoring algorithm in backend/src/services/storage.js (title 3x, author 2x, keywords 2x, abstract 1x)
- [X] T020 [US1] Implement GET /api/search endpoint in backend/src/api/routes.js with query validation
- [X] T021 [US1] Add pagination logic to search results in backend/src/api/routes.js
- [X] T022 [US1] Add sorting options (relevance, date, citations) to search in backend/src/services/storage.js
- [X] T023 [P] [US1] Create search UI component in frontend/src/components/search.html with input field and button
- [X] T024 [P] [US1] Create paper list display component in frontend/src/components/paper-list.html with Bootstrap cards
- [X] T025 [US1] Implement search functionality in frontend/src/pages/index.html connecting UI to API
- [X] T026 [US1] Add search result rendering with highlighting in frontend/src/services/api.js
- [X] T027 [US1] Implement "no results" message handling in frontend/src/pages/index.html
- [X] T028 [P] [US1] Add loading indicators for search operations in frontend/src/styles/main.css
- [X] T029 [US1] Implement GET /api/papers endpoint for browsing all papers in backend/src/api/routes.js

**Checkpoint**: At this point, User Story 1 should be fully functional - users can search and browse papers

---

## Phase 4: User Story 2 - Add Paper (Priority: P2)

**Goal**: Enable researchers to add papers to the repository using DOI/URL, growing the personal collection

**Independent Test**: Add a paper by providing a DOI and verify it appears in the repository with complete metadata

### Implementation for User Story 2

- [X] T030 [P] [US2] Create arXiv service in backend/src/services/arxiv.js with API query and XML parsing
- [X] T031 [P] [US2] Create DBLP service in backend/src/services/dblp.js with API query and JSON parsing
- [X] T032 [US2] Implement rate limiting for arXiv requests (3 sec delay) in backend/src/services/arxiv.js
- [X] T033 [US2] Implement POST /api/fetch endpoint in backend/src/api/routes.js for fetching from external APIs
- [X] T034 [US2] Add duplicate detection logic in backend/src/services/storage.js (DOI-based with title+author fallback)
- [X] T035 [US2] Implement POST /api/papers endpoint in backend/src/api/routes.js for manual/auto add
- [X] T036 [US2] Add timestamp generation (addedAt, updatedAt) in backend/src/models/paper.js
- [X] T037 [P] [US2] Create add paper page in frontend/src/pages/add.html with form inputs
- [X] T038 [P] [US2] Add source selector (arXiv/DBLP/manual) in frontend/src/pages/add.html with Bootstrap form controls
- [X] T039 [US2] Implement fetch and add flow in frontend/src/services/api.js with POST requests
- [X] T040 [US2] Add form validation on frontend in frontend/src/pages/add.html (required fields, DOI format)
- [X] T041 [US2] Implement success/error message display in frontend/src/pages/add.html using Bootstrap alerts
- [X] T042 [US2] Add duplicate error handling with existing paper display in frontend/src/pages/add.html

### Enhancement: Search by Terms (User Request)

**Goal**: Allow users to search papers in arXiv/DBLP by terms and select which papers to add to the repository

- [X] T043 [US2] Implement GET /api/external-search endpoint in backend/src/api/routes.js for external API search
- [X] T044 [P] [US2] Add search method to arXiv service in backend/src/services/arxiv.js (returns array of papers)
- [X] T045 [P] [US2] Add search method to DBLP service in backend/src/services/dblp.js (returns array of papers)
- [X] T046 [US2] Add search by terms form in frontend/src/pages/add.html with source selector (arXiv/DBLP)
- [X] T047 [US2] Implement search results display in frontend/src/pages/add.html with paper cards and add buttons
- [X] T048 [US2] Add individual paper add functionality from search results with duplicate detection

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - can search AND add papers

---

## Phase 5: User Story 3 - Browse Repository (Priority: P3)

**Goal**: Enable researchers to browse papers without specific search, supporting content discovery

**Independent Test**: Navigate to browse view and verify all papers are displayed with key metadata and filters work

### Implementation for User Story 3

- [ ] T043 [P] [US3] Add filter options to GET /api/papers endpoint in backend/src/api/routes.js (source, year)
- [ ] T044 [P] [US3] Create browse page in frontend/src/pages/browse.html with filter controls
- [ ] T045 [US3] Implement filter UI with Bootstrap dropdowns in frontend/src/pages/browse.html
- [ ] T046 [US3] Add sort controls (date, citations, title) in frontend/src/pages/browse.html
- [ ] T047 [US3] Implement pagination controls in frontend/src/components/paper-list.html using Bootstrap pagination
- [ ] T048 [US3] Connect browse filters to API in frontend/src/services/api.js with query parameter building
- [ ] T049 [US3] Add paper count display in frontend/src/pages/browse.html showing total and filtered counts
- [ ] T050 [P] [US3] Create paper detail expansion view in frontend/src/components/paper-list.html with collapsible cards

**Checkpoint**: All three user stories should now be independently functional - complete MVP with search, add, and browse

---

## Phase 6: Additional Features & Endpoints

**Purpose**: Supporting functionality that enhances all user stories

- [ ] T051 [P] Implement GET /api/papers/:id endpoint for single paper retrieval in backend/src/api/routes.js
- [ ] T052 [P] Implement DELETE /api/papers/:id endpoint with backup creation in backend/src/api/routes.js
- [ ] T053 [P] Implement GET /api/health endpoint for health checks in backend/src/api/routes.js
- [ ] T054 [P] Add delete button with confirmation dialog in frontend/src/components/paper-list.html
- [ ] T055 [P] Create in-memory cache service in backend/src/services/cache.js with LRU eviction
- [ ] T056 Integrate caching into search and external API calls in backend/src/services/storage.js
- [ ] T057 [P] Add navigation menu in frontend/index.html linking all pages (search, add, browse)
- [ ] T058 [P] Implement responsive mobile layout using Tailwind breakpoints in frontend/src/styles/main.css

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and production readiness

- [ ] T059 [P] Add comprehensive error logging to all backend services using console.error with context
- [ ] T060 [P] Implement input sanitization for all user inputs in backend/src/models/paper.js
- [ ] T061 [P] Add request logging middleware in backend/src/server.js
- [ ] T062 [P] Create backup cleanup job in backend/src/services/storage.js (keep last 10 backups)
- [ ] T063 [P] Add loading spinners using Bootstrap spinner component in all frontend pages
- [ ] T064 [P] Implement debounced search input in frontend/src/pages/index.html (300ms delay)
- [ ] T065 [P] Add keyboard shortcuts (Enter to search, Escape to clear) in frontend/src/pages/index.html
- [ ] T066 [P] Create README.md in backend/ with setup and API instructions
- [ ] T067 [P] Create README.md in frontend/ with structure and customization guide
- [ ] T068 [P] Add inline code documentation (JSDoc comments) to all backend services
- [ ] T069 [P] Style refinements using Tailwind utilities in frontend/src/styles/main.css
- [ ] T070 Run through quickstart.md validation to ensure all setup steps work
- [ ] T071 Test all three user stories end-to-end to verify independent functionality
- [ ] T072 Verify constitution compliance (open access sources, metadata completeness, documentation)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Phase 2 completion
  - User stories can then proceed in parallel (if team has capacity)
  - Or sequentially in priority order: P1 (US1) → P2 (US2) → P3 (US3)
- **Additional Features (Phase 6)**: Can start after any user story completes, enhances all stories
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1) - Search Papers**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2) - Add Paper**: Can start after Foundational (Phase 2) - Independent but complements US1 (search works on added papers)
- **User Story 3 (P3) - Browse Repository**: Can start after Foundational (Phase 2) - Independent but uses same display as US1

**Key Independence Principle**: Each user story delivers standalone value and can be tested without the others

### Within Each User Story

**Phase 3 (US1 - Search)**:
1. T018, T019 (search logic) can run in parallel
2. T020-T022 (API endpoints) depend on T018-T019
3. T023, T024, T028 (UI components) can run in parallel with T020-T022
4. T025-T027 (integration) depend on both API and UI completion
5. T029 (browse endpoint) can run in parallel with UI work

**Phase 4 (US2 - Add)**:
1. T030, T031 (external APIs) can run in parallel
2. T032 (rate limiting) depends on T030
3. T033-T036 (backend logic) depend on T030-T031
4. T037, T038 (UI forms) can run in parallel with backend
5. T039-T042 (integration) depend on both API and UI completion

**Phase 5 (US3 - Browse)**:
1. T043 (filters) depends on existing GET /api/papers from Phase 3
2. T044, T045, T050 (UI components) can run in parallel
3. T046-T049 (integration) depend on UI completion

### Parallel Opportunities

**Setup Phase (all [P] tasks)**:
- T004 (server.js), T005 (papers.json), T006 (.env), T007 (index.html) - all independent

**Foundational Phase (all [P] tasks)**:
- T013 (routes), T014 (error handler), T015 (config), T016 (CORS), T017 (frontend API client) - all independent

**User Story 1 (P1)**:
- T018 + T019 + T023 + T024 + T028 can all run in parallel (different files)

**User Story 2 (P2)**:
- T030 + T031 + T037 + T038 can all run in parallel (different services/pages)

**User Story 3 (P3)**:
- T043 + T044 + T050 can run in parallel

**Phase 6**: Almost all tasks marked [P] are independent

**Phase 7**: All tasks marked [P] are independent polish tasks

---

## Parallel Example: User Story 1

```bash
# Step 1: Launch backend search logic (parallel)
Task T018: "Create search function in backend/src/services/storage.js"
Task T019: "Implement relevance scoring in backend/src/services/storage.js"

# Step 2: After T018-T019, launch API and UI in parallel
Task T020-T022: "API endpoints in backend/src/api/routes.js"
Task T023: "Search UI in frontend/src/components/search.html"
Task T024: "Paper list in frontend/src/components/paper-list.html"
Task T028: "Loading styles in frontend/src/styles/main.css"

# Step 3: Integration tasks
Task T025-T027: "Connect UI to API"
Task T029: "Browse endpoint"
```

---

## Parallel Example: Setup + Foundational

```bash
# Setup Phase (can all run simultaneously)
Task T004: backend/src/server.js
Task T005: backend/data/papers.json  
Task T006: backend/.env
Task T007: frontend/index.html

# Foundational Phase (can all run simultaneously after Setup)
Task T013: backend/src/api/routes.js
Task T014: backend/src/api/error-handler.js
Task T015: backend/src/config.js
Task T016: backend/src/server.js (CORS addition)
Task T017: frontend/src/services/api.js
```

---

## Implementation Strategy

### MVP First (Recommended - User Story 1 Only)

**Timeline**: Fastest path to working product

1. ✅ Complete Phase 1: Setup (7 tasks)
2. ✅ Complete Phase 2: Foundational (10 tasks) - **CRITICAL GATE**
3. ✅ Complete Phase 3: User Story 1 - Search Papers (12 tasks)
4. **STOP and VALIDATE**: Test search functionality independently
5. **DELIVERABLE**: Working paper search and browse application

**Value**: Users can immediately search and discover papers in the repository (even if manually populated initially)

---

### Incremental Delivery (Full MVP)

**Timeline**: Complete value proposition in stages

1. ✅ Setup + Foundational (17 tasks) → Foundation ready
2. ✅ User Story 1: Search (12 tasks) → Test independently → **Deploy/Demo V1**
3. ✅ User Story 2: Add Paper (13 tasks) → Test independently → **Deploy/Demo V2** 🎯 FULL MVP
4. ✅ User Story 3: Browse (8 tasks) → Test independently → **Deploy/Demo V3**
5. ✅ Phase 6: Additional Features (8 tasks) → Enhanced experience
6. ✅ Phase 7: Polish (14 tasks) → Production ready

**Total**: 72 tasks across 7 phases

**Recommended stop point**: After User Story 2 (Phase 4) = 42 tasks for full MVP (search + add)

---

### Parallel Team Strategy

**With 3 developers** (after Foundational phase completes):

- **Developer A**: User Story 1 (Search) - 12 tasks
- **Developer B**: User Story 2 (Add) - 13 tasks  
- **Developer C**: User Story 3 (Browse) - 8 tasks

All three stories complete independently and integrate seamlessly.

**Integration point**: After all stories complete, minimal integration work needed since each story uses shared foundational services.

---

## Task Count Summary

| Phase | Task Count | Can Parallelize |
|-------|-----------|-----------------|
| Phase 1: Setup | 7 tasks | 4 tasks (57%) |
| Phase 2: Foundational | 10 tasks | 5 tasks (50%) |
| Phase 3: US1 - Search | 12 tasks | 5 tasks (42%) |
| Phase 4: US2 - Add | 13 tasks | 5 tasks (38%) |
| Phase 5: US3 - Browse | 8 tasks | 3 tasks (38%) |
| Phase 6: Additional | 8 tasks | 6 tasks (75%) |
| Phase 7: Polish | 14 tasks | 13 tasks (93%) |
| **TOTAL** | **72 tasks** | **41 tasks (57%)** |

---

## MVP Scope Recommendation

**Minimal MVP** (29 tasks): Phase 1 + Phase 2 + Phase 3 (User Story 1 only)
- Delivers: Searchable paper repository
- Time estimate: 1-2 weeks for single developer
- Value: Immediate utility for paper discovery

**Full MVP** (42 tasks): Phase 1 + Phase 2 + Phase 3 + Phase 4 (User Stories 1-2)
- Delivers: Search AND add papers from arXiv/DBLP
- Time estimate: 2-3 weeks for single developer
- Value: Complete repository management (search + grow collection) ✨ **RECOMMENDED**

**Complete Feature** (72 tasks): All phases
- Delivers: Full-featured paper repository with polish
- Time estimate: 4-5 weeks for single developer
- Value: Production-ready application

---

## Notes

- **All tasks** follow strict checklist format: `- [ ] [ID] [P?] [Story?] Description with file path`
- **[P] marker** indicates tasks that can run in parallel (57% of all tasks)
- **[Story] labels** enable tracking which tasks belong to which user story
- **File paths** are explicit for every task (no ambiguity)
- **User stories** are independently testable - can stop after any story and have working software
- **Tests omitted** per feature spec - can be added later if TDD approach desired
- **Commit strategy**: Commit after each task or logical group within a story
- **Validation checkpoints**: Stop after each phase/story to verify functionality before proceeding
