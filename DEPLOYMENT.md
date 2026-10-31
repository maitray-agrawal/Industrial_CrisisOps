# Industrial CrisisOps — Production Deployment Guide

This document provides complete, step-by-step instructions for deploying **Industrial CrisisOps** to [Render](https://render.com) (or any containerized cloud platform).

---

## 🏗️ Architecture Overview

```
                          ┌───────────────────────────────┐
                          │   Render Static Site          │
                          │   (React 18 + Vite 5 SPA)     │
                          │   https://vajra-astra.onrender.com │
                          │   (Mirror: vajra-mmx4)        │
                          └──────────────┬────────────────┘
                                         │
                                   HTTPS / REST API
                                         │
                                         ▼
                          ┌───────────────────────────────┐
                          │   Render Web Service          │
                          │   (FastAPI / Uvicorn)         │
                          │   https://crisisops-api.onrender.com │
                          └──────────────┬────────────────┘
                                         │
                                   SQLite Engine
                                         │
                                         ▼
                          ┌───────────────────────────────┐
                          │  backend/crisisops.db         │
                          │  Auto-seeded on fresh launch  │
                          └───────────────────────────────┘
```

The application is deployed as two decoupled cloud services:
1. **Backend Web Service (`crisisops-api`)**: Python FastAPI application running under Uvicorn with dynamic `$PORT` binding.
2. **Frontend Static Site (`vajra-astra`)**: Pre-compiled React + Vite single page application with environment-driven API routing (`VITE_API_URL`).

---

## 🚀 Option A: 1-Click Render Blueprint Deployment (Recommended)

Render Blueprints allow deploying the entire stack in one click using the repository's `render.yaml`.

### Step 1: Connect Repository to Render
1. Push your latest code to GitHub: `git push origin hackathon-crisisops`.
2. Log in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** → **Blueprint**.
4. Connect your GitHub repository (`Industrial_CrisisOps`) and select branch `hackathon-crisisops`.

### Step 2: Approve & Deploy
1. Render will automatically detect `render.yaml`.
2. Review the detected services:
   - `crisisops-api` (Python Web Service)
   - `vajra-astra` (Static Site)
3. Click **Apply**.
4. Render will build and deploy both services automatically.

---

## 🛠️ Option B: Manual Service Configuration

If deploying manually without Blueprint:

### Service 1: Backend (`crisisops-api`)

| Configuration Field | Value |
| :--- | :--- |
| **Service Type** | Web Service |
| **Name** | `crisisops-api` |
| **Environment** | Python |
| **Root Directory** | `backend` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Health Check Path** | `/api/health` |

#### Backend Environment Variables
| Variable Name | Value | Purpose |
| :--- | :--- | :--- |
| `ENV` | `production` | Enables production runtime mode |
| `DEBUG` | `False` | Disables debug logs & stack trace leak |
| `DATABASE_URL` | `sqlite:///./crisisops.db` | Local SQLite database file path (resolved canonically) |
| `CORS_ORIGINS` | `["https://vajra-astra.onrender.com", "https://vajra-mmx4.onrender.com", "https://crisisops.onrender.com"]` | Authorized CORS origins for frontend |

---

### Service 2: Frontend (`vajra-astra`)

| Configuration Field | Value |
| :--- | :--- |
| **Service Type** | Static Site |
| **Name** | `vajra-astra` |
| **Environment** | Static |
| **Root Directory** | `frontend` |
| **Build Command** | `npm ci && npm run build` |
| **Publish Directory** | `./dist` |

#### Rewrite Rules (SPA Handling)
Add a rewrite rule under **Redirects/Rewrites**:
* **Source**: `/*`
* **Destination**: `/index.html`
* **Action**: `Rewrite`

#### Frontend Environment Variables
| Variable Name | Value | Purpose |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://crisisops-api.onrender.com` | Target URL of backend Web Service |

---

## 🗄️ Database Seeding & Deterministic State

- **Fresh Instance Startup**: When `crisisops-api` starts for the first time, `app/main.py` detects an empty database and automatically executes `seed_database_if_empty()`.
- **Seeded Assets**:
  - 10 Machines across Chakan MIDC Pune plant (`M-204`, `M-101`, `M-305`, `HYD-105`, `CON-401`, `WLD-202`, `MOT-110`, `CHL-501`, `PMP-102`, `CNC-102`).
  - Active Incidents: `INC-M204-001` (Bearing Temperature & High Vibration), `INC-CMP301-002`, `INC-CNC101-003`.
  - 8 SOP Documents: `SOP-M204-BEARING`, `SOP-CMP301-OVERHEAT`, `SOP-CNC101-VIBRATION`, `SOP-HYD105-PRESSURE`, `SOP-CON401-JAM`, `SOP-WLD202-FAIL`, `SOP-MOT110-THERMAL`, `SOP-LOTO-GENERAL`.
  - 490 Telemetry points, 8 Maintenance Records, and tamper-evident SHA-256 Audit Trail.
- **Idempotency**: Restarting or redeploying the backend will **not** reseed or wipe user actions unless the database file is deleted.

---

## ⚠️ Render Free Tier Constraints & Cold Starts

- **Spin Down on Idle**: On Render's Free tier, web services spin down after 15 minutes of inactivity. The first request after idle can take 30–50 seconds to boot.
- **Ephemeral Storage**: On free web services, the local SQLite database persists while the instance is running, but restarts with a freshly seeded database on redeploy. This is ideal for hackathon evaluation as the demonstration data is always clean and deterministic.
