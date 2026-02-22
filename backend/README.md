# Minimal backend for Asstar storefront

Files added:

- `server.js` — Express server serving static files and simple `/api` endpoints.
- `package.json` — dependency declarations and start scripts.

Quick start:

1. Open a terminal in this folder (`Home`).
2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
npm start
```

4. Open the site at: http://localhost:3000

Notes:

- The backend is intentionally minimal: products are stored in-memory in `server.js`.
- Cart updates are kept in-memory and will reset when the server restarts.
- Use `npm run dev` with `nodemon` if you install it globally or as a devDependency.
