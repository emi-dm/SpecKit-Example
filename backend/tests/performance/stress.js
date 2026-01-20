import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 200,
  duration: '30s',
  thresholds: {
    'http_req_duration': ['p(95)<5000'],
    'http_req_failed': ['rate<0.02']
  }
};

export default function () {
  const res = http.get('http://localhost:3000/api/v1/search?q=machine%20learning&limit=20');
  check(res, {
    'status is 200': (r) => r.status === 200
  });
}