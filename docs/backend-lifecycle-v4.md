# Backend Lifecycle Documentation  
**Game Journal v2 – Node.js + Express + TypeScript**

---

## 1. Overview

This document describes the complete lifecycle of the backend, from process startup to request handling, error propagation, trust boundaries, and threat modeling.

The system is designed around **fail-fast startup**, **explicit trust boundaries**, **layered security**, and **predictable behavior under failure**.

---

## 2. Process Startup & Bootstrapping

**Entry point:** `server.ts`

Startup sequence:

1. Load environment variables via Node `--env-file`
2. Validate required variables (`checkEnvVars`)
3. Select MongoDB URI based on `NODE_ENV`
4. Establish database connection before listening
5. Create HTTP server wrapping Express
6. Crash immediately on startup failure

**Invariant:**  
The server never accepts traffic unless configuration and persistence are valid.

---

## 3. Application Initialization

Global middleware order (`app.ts`):

1. Rate limiting
2. CORS
3. Security headers (Helmet)
4. JSON body parsing
5. Request logging

Security and correctness are enforced before business logic.

---

## 4. Routing & Access Control

Routes are versioned under `/api/v1`.

- Public: `/auth`
- Protected: `/user`, `/entries`

Protected routes require JWT authentication at the router level.

---

## 5. Authentication Lifecycle

```
Client
  |
  | Authorization: Bearer <token>
  v
authenticate
  |
  |-- invalid / expired --> 401
  |
  v
req.user.userId attached
```

Identity is injected once and treated as authoritative downstream.

---

## 6. Validation Pipeline

```
Request
  |
  v
XSS Sanitizer
  |
  v
Zod Schema Validation
  |
  v
Controller
```

Controllers never receive raw or untyped input.

---

## 7. API Request Lifecycle (Selected Examples)

### Auth – POST /login

```
Client
  |
  v
Global Middleware
  |
  v
XSS → Zod
  |
  v
loginUser
  |
  |-- bad credentials --> 401
  |
  v
200 OK
```

### Entries – PATCH /:id

```
Client
  |
  v
authenticate
  |
  v
validateObjectId
  |
  v
XSS → Zod
  |
  v
patchJournalEntry
  |
  |-- domain violation --> 400
  |
  v
200 OK
```

---

## 8. Trust Boundary Model

```
[ Untrusted Client ]
          |
          v
[ Edge Boundary ]
Rate Limit / CORS / Helmet
          |
          v
[ Authentication Boundary ]
JWT Verification
          |
          v
[ Validation Boundary ]
XSS / Zod / ObjectId Guards
          |
          v
[ Application Trust Zone ]
Controllers & Domain Logic
          |
          v
[ Persistence Boundary ]
MongoDB
```

Each boundary re-establishes assumptions explicitly.

---

## 9. Security Guarantees

- Authentication enforced on all protected routes
- Input sanitized and schema-validated
- ObjectId validation before DB access
- Rate limiting on all endpoints
- Centralized error handling
- Password hashing enforced via model hooks
- JWT secrets required at startup
- No internal errors or stack traces leaked

---

## 10. Threat Model

This section enumerates **credible threats**, how the system mitigates them, and what remains out of scope.

### 10.1 Threat Actors

- Malicious unauthenticated users
- Authenticated but curious users
- Automated bots
- Misconfigured clients
- Insider mistakes (developer error)

---

### 10.2 Threats & Mitigations

#### T1: Unauthorized Access

**Threat:**  
Access protected resources without valid identity.

**Mitigations:**
- Mandatory JWT authentication
- Router-level auth enforcement
- No fallback identity sources

**Residual Risk:**  
Compromised JWTs (addressed operationally via rotation/expiry).

---

#### T2: Broken Object Level Authorization (BOLA)

**Threat:**  
Access or modify resources belonging to another user.

**Mitigations:**
- All DB queries scoped by `userId`
- ObjectId validation before DB access
- No global fetch-by-id endpoints

**Residual Risk:**  
None at application level.

---

#### T3: Injection Attacks (XSS / NoSQL)

**Threat:**  
Malicious payloads altering execution or queries.

**Mitigations:**
- XSS sanitization on all writes
- Zod schema validation
- Mongoose query construction (no raw queries)

**Residual Risk:**  
Complex aggregation misuse (guarded by static pipelines).

---

#### T4: Brute Force & Abuse

**Threat:**  
Credential stuffing, request flooding.

**Mitigations:**
- Global rate limiting
- Uniform auth error messages
- No user enumeration leaks

**Residual Risk:**  
Large-scale distributed attacks (infra-level concern).

---

#### T5: Sensitive Data Exposure

**Threat:**  
Passwords, tokens, or internals leaking to clients.

**Mitigations:**
- Password hashing via bcrypt
- Explicit field selection (`+password`)
- Central error handler
- Structured API responses only

**Residual Risk:**  
Logs must be protected operationally.

---

#### T6: Inconsistent Domain State

**Threat:**  
Invalid business states (e.g. rating without completion).

**Mitigations:**
- Domain guards in controllers
- Validation beyond schema shape

**Residual Risk:**  
Future domain rules must follow same pattern.

---

### 10.3 Explicit Non-Goals

This backend intentionally does **not** handle:

- DDoS mitigation (handled by infrastructure)
- Client-side token storage security
- Advanced anomaly detection
- Role-based authorization (single-user ownership model)

---

## 11. Why These Decisions

- **Fail-fast startup:** config errors are deployment bugs
- **Explicit trust boundaries:** assumptions are auditable
- **Layered middleware:** defense in depth
- **Central error handling:** predictable API behavior
- **Zod validation:** runtime safety
- **JWT auth:** stateless scalability
- **Domain guards:** correctness beats convenience

---

## 12. Failure Philosophy

> Fail fast on misconfiguration.  
> Fail safely at runtime.  
> Be observable, never silent.
