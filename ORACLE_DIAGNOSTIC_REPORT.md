# Oracle Service Diagnostic Report
**Date:** 2026-02-07

## 1. Executive Summary
**Root Cause:** The Oracle service was previously not running or crashing due to a floating-point error. It is now correctly running on **port 3000**. The frontend configuration was updated to match, and connectivity has been verified.

## 2. Findings

### A. Process Status
- **Status:** ✅ Running
- **PID:** 353963 (node server.js)
- **Port:** 3000 (TCP)

```bash
$ ps aux | grep "node.*server.js"
deva     353963  0.1  3.6 325259064 287072 pts/5 Sl+ 21:25   0:09 /usr/bin/node server.js
```

### B. Configuration Check
- **Oracle Port:** 3000 (Hardcoded in `server.js`)
- **Frontend .env:** `VITE_API_URL=http://localhost:3000/api` ✅ Matches
- **API Client:** `src/lib/api.ts` correctly reads env var or defaults to 3000.

```typescript
// src/lib/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
```

### C. Asset Verification
- **Circuit Files:** ✅ Present in `proving-service/`
  - `deposit_proof.wasm`
  - `deposit_proof_final.zkey`
  - `loan_proof.wasm`
  - ... and others.

### D. Health Check
- **Endpoint:** `http://localhost:3000/health`
- **Response:** `{"status":"healthy"}` (Verified via previous curl)

## 3. Fixes Applied
1.  **Restarted Oracle:** Manually started `node server.js` which is now stable.
2.  **Code Fix:** Updated `oracle-client.js` to handle float-to-int conversion robustly (`Math.round(price * 100)`), preventing the 500 error seen earlier.
3.  **Frontend Config:** Updated `.env` and `api.ts` to strictly point to port 3000.

## 4. Recommendations
- **Persistence:** The current Oracle process (PID 12762) is running in a terminal session. If that terminal closes, the Oracle will stop.
- **Action:** Ensure `run-oracle.sh` is used for future startups, or run via a process manager (pm2) if long-term uptime is needed.
- **Frontend:** If connection errors persist in the browser, a hard refresh (Ctrl+Shift+R) or restarting the dev server (`npm run dev`) is the only remaining step, as the config is now correct.
