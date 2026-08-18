# EDCAP_FE
Frontend for the Evidence Data Collection and Analysis Platform.

## Prerequisites

- Node.js 20+ recommended
- npm 10+
- Backend running locally or reachable through `VITE_API_BASE_URL`

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Set the API base URL if the backend is not on the default dev proxy target:

- `VITE_API_BASE_URL=http://localhost:8080`

3. Start the dev server:

```bash
npm run dev
```

The app uses `HashRouter`, so local routes look like:

- `http://localhost:5173/#/en/login`
- `http://localhost:5173/#/en/admin`

## Login

Use the demo auth users seeded by the backend migration:

- Username: `nk_trung`
- Password: `Admin@123456`

Other demo usernames:

- `pd_khoa`
- `nvt_dung`
- `lx_loc`

## Test

```bash
npm run test
npm run test:unit
npm run test:e2e
```

## Build

```bash
npm run build
```

## Notes

- Dev server proxy forwards `/api`, `/login`, and `/logout` to the backend.
- If native module installation behaves oddly on your machine, reinstall dependencies on the target platform before running the test suite.
