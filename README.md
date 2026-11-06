# hrflow-employee-management-system
Role-based Employee, Attendance &amp; Leave Management System built with React, FastAPI, and PostgreSQL.

## Render and Vercel deployment

Configure these environment variables on the Render API service before deploying:

- **`DATABASE_URL`** — the connection URL for your PostgreSQL database. The API exits during startup if this is missing.
- **`JWT_SECRET`** — a long, random secret used to sign authentication tokens.
- **Render API service:** set `CORS_ORIGINS` to the exact Vercel site origin, such as `https://your-app.vercel.app`. Add multiple origins as a comma-separated list (for example, your custom domain and Vercel domain). Do not include URL paths.

The frontend is configured to use the Render API URL in production, so no API URL environment variable is needed in Vercel. If `VITE_API_URL` was previously added in Vercel, remove it to avoid using a stale URL, then redeploy the frontend. The API reads `CORS_ORIGINS` when it starts. In local development, the frontend uses `http://127.0.0.1:8000` and the API allows the local Vite origins by default.
