# BoniCare Backend API Review Report

**Date:** June 21, 2026  
**Reviewer:** Principal Software Engineer (Frontend Architecture)  
**Backend:** `orthopedic-platform-BoniCare-` (Node.js / Express / MongoDB)  
**Status:** Review complete — **no backend modifications made**

---

## Executive Summary

The BoniCare backend exposes a functional REST API with JWT authentication, Stripe payments, AI integration (via FastAPI microservice), Socket.IO chat, and Firebase push notifications. However, **significant gaps exist** between documented requirements, Swagger specification, README, and actual route wiring. The frontend can integrate with **22 implemented REST endpoints**, but several critical features (admin portal, video consultation, payment history, file download/delete, password reset, notification center) require **backend additions** before full production readiness.

**Recommendation:** Proceed with frontend development against existing APIs. Defer video consultation UI signaling until backend WebRTC events are approved and implemented. Report gaps to backend team for phased delivery.

---

## 1. Existing APIs Found

### Base URL
| Source | URL |
|--------|-----|
| Swagger `servers` | `http://localhost:3000/api/v1` |
| `.env.example` | `PORT=3000` |
| `server.js` default | `PORT=5000` (if env unset) |

**Issue:** Port mismatch between Swagger/docs (3000) and server fallback (5000).

### Authentication (`/api/v1/auth`)

| Method | Path | Auth | Roles | Request Body | Response |
|--------|------|------|-------|--------------|----------|
| POST | `/auth/signup` | None | — | `{ name, email, password, phone?, role? }` | `{ success, token, user: { id, name, email, role } }` |
| POST | `/auth/login` | None | — | `{ email, password }` | `{ success, token, user }` |

**Notes:**
- Single JWT token returned (no refresh token endpoint despite `.env` JWT_REFRESH_SECRET).
- README documents `username`, `firstName`, `lastName` — actual API uses `name`.

### Patient (`/api/v1/patient`)

| Method | Path | Auth | Roles | Response |
|--------|------|------|-------|----------|
| GET | `/patient/dashboard` | Bearer | `patient` | `{ success, patient, files, ai_reports, appointments: [] }` |

**Notes:** `appointments` is hardcoded empty array in controller — not populated from DB.

### Doctor (`/api/v1/doctor`)

| Method | Path | Auth | Roles | Request | Response |
|--------|------|------|-------|---------|----------|
| GET | `/doctor/profile` | Bearer | `doctor` | — | `{ success, data: DoctorProfile }` |
| PUT | `/doctor/profile` | Bearer | `doctor` | `{ specialty, bio, licenseNumber, yearsOfExperience, hospitalInfo }` | `{ success, data }` |
| GET | `/doctor/availability` | Bearer | `doctor` | — | `{ success, data: Availability[] }` |
| POST | `/doctor/availability` | Bearer | `doctor` | `{ dayOfWeek, startTime, endTime }` | `{ success, data }` |
| DELETE | `/doctor/availability/:id` | Bearer | `doctor` | — | `{ success, message }` |
| GET | `/doctor/appointments` | Bearer | `doctor` | — | `{ success, data: Appointment[] }` |

### Appointments (`/api/v1/appointment`)

| Method | Path | Auth | Roles | Request | Response |
|--------|------|------|-------|---------|----------|
| GET | `/appointment/doctors` | Bearer | `patient`, `admin` | — | `{ success, data: DoctorProfile[] }` |
| GET | `/appointment/doctors/:doctorId/availability` | Bearer | `patient`, `admin` | — | `{ success, data }` |
| POST | `/appointment/book` | Bearer | `patient` | `{ doctorId, scheduledDate, startTime, endTime, notes? }` | `{ success, data }` |
| GET | `/appointment/my-appointments` | Bearer | `patient` | — | `{ success, data }` |
| PUT | `/appointment/:id/cancel` | Bearer | `patient`, `doctor`, `admin` | — | `{ success, message, data }` |

### Medical Files (`/api/v1/files`)

| Method | Path | Auth | Roles | Request | Response |
|--------|------|------|-------|---------|----------|
| POST | `/files/upload` | Bearer | `patient` | `multipart/form-data` field `file` | `{ success, message, data: { originalname, filename, path, size, mimetype } }` |

**Critical:** `getAllFiles`, `getFileByName`, `deleteFile` exist in `filesController.js` but are **not registered in `files.js` routes**.

**Critical:** Upload does not persist `MedicalFile` MongoDB document — only saves to disk.

### AI (`/api/v1/ai`)

| Method | Path | Auth | Roles | Request | Response |
|--------|------|------|-------|---------|----------|
| POST | `/ai/predict` | **None** | — | `{ patientId, features[12], fileId?, doctorId? }` | `{ status, data: AiReport }` |
| POST | `/ai/bone-fracture` | **None** | — | `multipart/form-data` field `file` | `{ status, data }` |
| GET | `/ai/health` | None | — | — | `{ status, aiStatus }` |

### Payments (`/api/v1/payment`)

| Method | Path | Auth | Roles | Request | Response |
|--------|------|------|-------|---------|----------|
| POST | `/payment/create-intent` | Bearer | `patient` | `{ appointmentId, amount, type }` | `{ status, clientSecret }` |
| POST | `/payment/webhook` | Stripe sig | — | Raw Stripe event | `{ received: true }` |
| POST | `/payment/refund` | Bearer | `admin`, `doctor` | `{ paymentId, amount?, reason? }` | `{ status, data: Payment }` |

### Notifications (`/api/v1/notification`)

| Method | Path | Auth | Roles | Request | Response |
|--------|------|------|-------|---------|----------|
| GET | `/notification/preferences` | Bearer | Any authenticated | — | `{ status, data: NotificationPreferences }` |
| PATCH | `/notification/preferences` | Bearer | Any authenticated | `{ pushEnabled?, emailEnabled? }` | `{ status, data }` |
| POST | `/notification/token` | Bearer | Any authenticated | `{ fcmToken }` | `{ status, message }` |

### Socket.IO Events (Chat Only)

| Event | Direction | Payload | Purpose |
|-------|-----------|---------|---------|
| `joinConversation` | Client → Server | `conversationId` | Join room |
| `sendMessage` | Client → Server | `{ receiverId, conversationId, content, ... }` | Send chat |
| `newMessage` | Server → Client | `message` | Broadcast message |
| `error` | Server → Client | string | Error feedback |

---

## 2. Missing APIs (Required for Full Feature Set)

### Authentication & Profile
| Missing Endpoint | Priority | Impact |
|------------------|----------|--------|
| `POST /auth/forgot-password` | High | Password reset flow blocked |
| `POST /auth/reset-password` | High | Password reset flow blocked |
| `POST /auth/refresh-token` | Medium | Env vars exist but no endpoint |
| `GET /auth/me` | Medium | Profile bootstrap without decode |
| `PUT /auth/profile` | Medium | User profile update |
| `PUT /patient/profile` | High | Patient DOB, gender, medical history |

### Admin Portal
| Missing Endpoint | Priority |
|------------------|----------|
| `GET /admin/users` | Critical |
| `PUT /admin/users/:id/approve` | Critical |
| `PUT /admin/users/:id/suspend` | High |
| `GET /admin/analytics` | High |
| `GET /admin/doctors/pending` | High |
| Doctor approval workflow | Critical |

**No admin routes exist in codebase.**

### Medical Files
| Missing Endpoint | Priority | Notes |
|------------------|----------|-------|
| `GET /files` | High | Controller exists, route missing |
| `GET /files/:filename` | High | Controller exists, route missing |
| `DELETE /files/:filename` | High | Controller exists, route missing |
| Link upload to `MedicalFile` model | Critical | Upload doesn't save DB record |
| `GET /doctor/patients/:id/files` | High | Doctor patient records access |

### AI
| Missing Endpoint | Priority |
|------------------|----------|
| `GET /ai/reports` | High |
| `GET /ai/reports/:id` | Medium |
| Auth middleware on `/ai/*` | Critical |

### Payments
| Missing Endpoint | Priority |
|------------------|----------|
| `GET /payment/history` | Critical |
| `GET /payment/:id` | High |
| `GET /payment/refunds` | High |
| Patient ownership validation on create-intent | Medium |

### Notifications
| Missing Endpoint | Priority |
|------------------|----------|
| `GET /notification` | Critical |
| `GET /notification/unread-count` | High |
| `PATCH /notification/:id/read` | High |
| Socket `notification` event | High |

### Video Consultation (WebRTC)
| Missing Capability | Priority |
|--------------------|----------|
| `joinCall` / `leaveCall` socket events | Critical |
| `webrtc-offer` / `webrtc-answer` | Critical |
| `ice-candidate` relay | Critical |
| `call-state` (ringing, connected, ended) | High |
| `GET /appointment/:id/call-token` or room ID | High |
| TURN server configuration endpoint | Medium |

### Appointments
| Missing Endpoint | Priority |
|------------------|----------|
| `PUT /appointment/:id/complete` | Medium |
| `PUT /appointment/:id/reschedule` | Medium |
| Populate appointments on patient dashboard | High |

---

## 3. Swagger Issues

| Issue | Severity | Details |
|-------|----------|---------|
| Global `security: bearerAuth` | Medium | Auth endpoints incorrectly show as requiring JWT |
| Path inconsistencies | High | Swagger documents `/appointment` POST/GET but routes are `/appointment/book`, `/appointment/my-appointments` |
| Swagger documents `/appointment/doctor/{doctorId}/availability` | Medium | Actual route: `/appointment/doctors/:doctorId/availability` |
| Files endpoints documented but not routed | High | GET/DELETE in controller JSDoc only |
| Notification endpoints lack Swagger JSDoc | Low | Only in route file comments |
| AI endpoints missing `security` | Critical | Undocumented public access |
| Request/response schemas incomplete | Medium | Most endpoints lack response schema definitions |
| README vs Swagger vs Code drift | High | Three sources of truth conflict |

---

## 4. Security Issues

| Issue | Severity | Recommendation |
|-------|----------|----------------|
| AI routes unauthenticated | **Critical** | Add `protect()` with role checks |
| Socket.IO CORS `origin: '*'` | High | Restrict to frontend origin |
| No rate limiting | High | Add express-rate-limit |
| Helmet imported in README but not in `server.js` | Medium | Enable security headers |
| File upload doesn't associate with patient | High | Validate ownership, save metadata |
| `getAllFiles` lists all server files | Critical | If routed, exposes all uploads |
| JWT single token, no refresh rotation | Medium | Implement refresh flow |
| Payment create-intent doesn't verify appointment ownership | Medium | Validate `patientId` matches |
| No CSRF for cookie-based auth | Low | OK if JWT in Authorization header only |
| FCM token update without validation | Low | Sanitize token format |

---

## 5. Scalability Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Local file storage (`uploads/`) | High | Migrate to S3 (partially configured) |
| Redis required for Socket.IO adapter | Medium | Document Redis as hard dependency |
| No pagination on list endpoints | High | Add cursor/page params |
| Patient dashboard loads all files/reports | Medium | Paginate and lazy load |
| Duplicate Socket connection handlers in `socket.js` | Low | Remove duplicate `io.on('connection')` |
| MongoDB transactions only in production | Medium | Document behavior in dev |
| AI service single point of failure | Medium | Circuit breaker, fallback UI |

---

## 6. Video Consultation Requirements

### Current State
Socket.IO is initialized with Redis adapter. Only **text chat** is supported.

### Required Backend Changes (Pending Approval)

```
// Proposed Socket.IO events
'call:join'       → { appointmentId, userId, role }
'call:leave'      → { appointmentId }
'call:offer'      → { appointmentId, sdp }
'call:answer'     → { appointmentId, sdp }
'call:ice-candidate' → { appointmentId, candidate }
'call:state'      → { appointmentId, state: 'ringing'|'connected'|'ended' }
'call:media-state' → { appointmentId, audio, video, screen }

// Proposed REST endpoints
GET  /appointment/:id/call-room     → { roomId, iceServers, expiresAt }
POST /appointment/:id/call/start    → Initiate call (doctor/patient)
POST /appointment/:id/call/end      → End call, log duration
```

### Frontend Approach (Until Backend Ready)
- Build WebRTC service architecture with signaling abstraction
- Implement UI shell (controls, connection states, quality indicators)
- Display **"Video consultation unavailable — signaling server not configured"** when backend events missing
- Enable in-call chat via existing `sendMessage`/`joinConversation` if conversation linked to appointment

---

## 7. Payment Integration Gaps

| Gap | Frontend Workaround |
|-----|---------------------|
| No payment history API | Show payments from appointment status only; request history endpoint |
| No Stripe publishable key endpoint | Use environment variable `STRIPE_PUBLISHABLE_KEY` |
| Webhook-only status updates | Poll appointment status after payment |
| Amount in cents unclear | Document: Stripe expects cents; validator should confirm |
| No idempotency key | Handle duplicate intent creation in UI |

**Integrable now:** `create-intent` + Stripe Elements with `clientSecret`.

---

## 8. Notification Integration Gaps

| Available | Missing |
|-----------|---------|
| Preference management | Notification list/inbox |
| FCM token registration | Real-time socket push to client |
| Server-side send on chat | Mark as read |
| Email via nodemailer | Notification history API |

**Frontend approach:** Implement preference UI + FCM registration. Notification center shows empty state with note until `GET /notification` is added. Use Socket.IO listener stub for future `notification` event.

---

## 9. Recommended Backend Changes (Priority Order)

### P0 — Before Production
1. Add auth middleware to all `/ai/*` routes
2. Wire file GET/DELETE routes with patient/doctor authorization
3. Persist `MedicalFile` on upload
4. Fix patient dashboard appointments population
5. Add `GET /payment/history` for authenticated user
6. Add admin route module with RBAC
7. Fix PORT consistency (3000 everywhere)
8. Add `GET /notification` with pagination

### P1 — Video & Real-time
1. WebRTC signaling socket events
2. Call room management tied to appointments
3. Socket notification broadcast
4. TURN/STUN config endpoint

### P2 — Completeness
1. Password reset flow
2. Refresh token rotation
3. Swagger alignment with actual routes
4. Helmet, rate limiting, CORS hardening
5. Pagination on all list endpoints

---

## 10. Frontend Integration Decision

| Module | Integration Status |
|--------|-------------------|
| Authentication | ✅ Full |
| Patient Dashboard | ⚠️ Partial (empty appointments) |
| Doctor Portal | ✅ Full |
| Appointments | ✅ Full |
| Medical Files | ⚠️ Upload only |
| AI Reports | ⚠️ Predict + dashboard list; no dedicated list API |
| Payments | ⚠️ Create intent + Stripe UI only |
| Notifications | ⚠️ Preferences + FCM token only |
| Admin | ❌ No backend — UI shell with gap notice |
| Video Consultation | ❌ Signaling service stub + gap notice |

**Awaiting approval before any backend modifications.**

---

*End of Report*
