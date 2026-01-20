Performance tests for Paper Repository

Run locally (requires k6 installed):

- Baseline test (50 VUs, 30s):
  k6 run baseline.js

- Stress test (200 VUs, 30s):
  k6 run stress.js

CI

- The repository includes a GitHub Actions workflow `.github/workflows/performance.yml` that:
  - Starts the backend server
  - Waits for the server to respond
  - Runs the Baseline k6 test and fails if thresholds are violated (p95 >= 3000ms or error rate >= 1%)
  - Runs a quick accessibility check with `pa11y`

Thresholds

- Baseline: p95 < 3000ms, error rate < 1%
- Stress: p95 < 5000ms, error rate < 2% (for information only in CI)

Notes

- These scripts assume the backend is reachable at http://localhost:3000. Update the URL if you run the server on a different port.