# System-Wide Architecture & Lifecycle Diagram  
**Game Journal v2 – Offline-First PWA + Secure Backend**

This document provides a **system-wide view** of how the React PWA frontend and Node.js backend interact, including trust boundaries, data flow, synchronization, and failure handling.

This file intentionally complements (not replaces):

- `frontend-lifecycle-pwa.md`
- `backend-lifecycle-v4.md`

---

## 1. High-Level System Overview

```
┌─────────────────────────────────────────────────────────┐
│                     User Device                          │
│                                                         │
│  ┌───────────────┐      ┌───────────────────────────┐ │
│  │   React UI    │─────▶│   IndexedDB (Source of     │ │
│  │ (Components)  │◀─────│   Truth)                   │ │
│  └───────┬───────┘      └─────────────┬─────────────┘ │
│          │                              │               │
│          │                              ▼               │
│          │                   ┌──────────────────────┐ │
│          │                   │ Background Sync       │ │
│          │                   │ (Best-effort)         │ │
│          │                   └─────────┬────────────┘ │
│          │                              │ HTTPS (JWT)   │
└──────────┼──────────────────────────────┼──────────────┘
           │                              ▼
           │                ┌──────────────────────────┐
           │                │        Backend API        │
           │                │ (Express + Auth + Zod)   │
           │                └─────────┬────────────────┘
           │                              │
           ▼                              ▼
┌──────────────────────────┐   ┌──────────────────────────┐
│ Authentication Boundary  │   │     Persistence Layer     │
│ JWT Verification         │   │     MongoDB               │
└──────────────────────────┘   └──────────────────────────┘
```

---

## 2. End-to-End Request Lifecycle

### Authenticated Write (Create / Update / Delete)

```
User Action
  |
  v
React Component
  |
  v
Local Validation
  |
  v
IndexedDB Write (synced=false)
  |
  v
Immediate UI Update
  |
  v
Background Sync
  |
  |-- offline --> stop (retry later)
  |
  v
Axios (JWT attached)
  |
  v
Backend Middleware
  |
  |-- auth / validation / guards
  |
  v
Controller
  |
  v
MongoDB
  |
  v
200 OK
  |
  v
Local Entry marked synced=true
```

---

## 3. Read Path (Truth Resolution)

```
UI Render
  |
  v
IndexedDB Read
  |
  |-- empty?
  |
  v
Backend Fetch (Paginated)
  |
  v
Materialize into IndexedDB
  |
  v
Re-render UI
```

**Invariant:**  
The UI never renders directly from backend responses.

---

## 4. Authentication & Invalidation Flow

```
Request with JWT
  |
  v
Backend
  |
  |-- 401 Unauthorized
  |
  v
Axios Response Interceptor
  |
  v
Auth Invalid Handler
  |
  v
forceLogout()
  |
  v
Clear IndexedDB + Tokens
  |
  v
Redirect to Landing Page
```

This guarantees frontend/backend auth states cannot silently diverge.

---

## 5. Trust Boundary Model (System-Wide)

```
[ Human User ]
      |
      v
[ Browser UI ]
      |
      v
────────────────────────────
Frontend Trust Boundary
────────────────────────────
      |
      v
[ Local Validation ]
      |
      v
[ IndexedDB Authority ]
      |
      v
────────────────────────────
Network / Transport Boundary
────────────────────────────
      |
      v
[ Axios + JWT ]
      |
      v
────────────────────────────
Backend Trust Boundary
────────────────────────────
      |
      v
[ Auth → Validation → Domain ]
      |
      v
[ MongoDB ]
```

Each boundary explicitly resets trust assumptions.

---

## 6. Consistency Model

- **Local-first**
- **Eventually consistent**
- **User-visible truth**
- **No optimistic UI rollback**

Backend success never blocks frontend progress.

---

## 7. Failure Modes & Behavior

| Failure | System Response |
|------|----------------|
| Offline | UI continues from IndexedDB |
| Backend down | Sync pauses, UI intact |
| Token expired | Forced logout |
| Partial sync | Retry later, no corruption |
| App reload | State rebuilt from IndexedDB |

---

## 8. Why This Architecture Works

- Clear ownership of truth (IndexedDB)
- No hidden coupling between UI and backend
- Explicit boundaries reduce cognitive load
- Failures are expected, not exceptional
- Backend and frontend evolve independently

---

## 9. Design Philosophy

> The frontend is resilient by default.  
> The backend is authoritative by contract.  
> The network is unreliable by assumption.

This separation is intentional and fundamental to the system.
