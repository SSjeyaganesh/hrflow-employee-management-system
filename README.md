# hrflow-employee-management-system
Role-based Employee, Attendance &amp; Leave Management System built with React, FastAPI, and PostgreSQL.

## Render and Vercel deployment

Configure these environment variables before deploying:

- **Render API service:** set `CORS_ORIGINS` to the exact Vercel site origin, such as `https://your-app.vercel.app`. Add multiple origins as a comma-separated list (for example, your custom domain and Vercel domain). Do not include URL paths.
- **Vercel frontend:** set `VITE_API_URL` to the Render API's public URL, such as `https://your-api.onrender.com`, without an endpoint path.

Redeploy both services after changing these values. Vite embeds `VITE_API_URL` during the frontend build, and the API reads `CORS_ORIGINS` when it starts. In local development, the frontend continues to use `http://127.0.0.1:8000` and the API allows the local Vite origins by default.
