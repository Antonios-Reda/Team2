# BoniCare API Mapping — Frontend to Backend

**Base URL:** `http://localhost:3000/api/v1`  
**Auth Header:** `Authorization: Bearer <token>`

---

## Service → Endpoint Matrix

### AuthService (`core/auth/auth.service.ts`)

| Frontend Method | HTTP | Endpoint | Auth | Roles |
|-----------------|------|----------|------|-------|
| `login()` | POST | `/auth/login` | No | — |
| `signup()` | POST | `/auth/signup` | No | — |

**Request (login):** `{ email, password }`  
**Request (signup):** `{ name, email, password, phone?, role? }`  
**Response:** `{ success, token, user: { id, name, email, role } }`

---

### PatientApiService (`core/services/patient-api.service.ts`)

| Frontend Method | HTTP | Endpoint | Roles |
|-----------------|------|----------|-------|
| `getDashboard()` | GET | `/patient/dashboard` | patient |

**Response:** `{ success, patient, files[], ai_reports[], appointments[] }`

---

### DoctorApiService (`core/services/doctor-api.service.ts`)

| Frontend Method | HTTP | Endpoint | Roles |
|-----------------|------|----------|-------|
| `getProfile()` | GET | `/doctor/profile` | doctor |
| `updateProfile()` | PUT | `/doctor/profile` | doctor |
| `getAvailability()` | GET | `/doctor/availability` | doctor |
| `addAvailability()` | POST | `/doctor/availability` | doctor |
| `deleteAvailability(id)` | DELETE | `/doctor/availability/:id` | doctor |
| `getAppointments()` | GET | `/doctor/appointments` | doctor |

---

### AppointmentApiService (`core/services/appointment-api.service.ts`)

| Frontend Method | HTTP | Endpoint | Roles |
|-----------------|------|----------|-------|
| `getDoctors()` | GET | `/appointment/doctors` | patient, admin |
| `getDoctorAvailability(id)` | GET | `/appointment/doctors/:doctorId/availability` | patient, admin |
| `bookAppointment()` | POST | `/appointment/book` | patient |
| `getMyAppointments()` | GET | `/appointment/my-appointments` | patient |
| `cancelAppointment(id)` | PUT | `/appointment/:id/cancel` | patient, doctor, admin |

**Book request:** `{ doctorId, scheduledDate, startTime, endTime, notes? }`

---

### MedicalFileApiService (`core/services/medical-file-api.service.ts`)

| Frontend Method | HTTP | Endpoint | Roles | Status |
|-----------------|------|----------|-------|--------|
| `upload(file)` | POST | `/files/upload` | patient | ✅ Integrated |
| `getDownloadUrl()` | GET | `/files/:filename` | — | ⚠️ Route not wired in backend |

**Upload:** `multipart/form-data`, field name `file`

---

### AiApiService (`core/services/ai-api.service.ts`)

| Frontend Method | HTTP | Endpoint | Status |
|-----------------|------|----------|--------|
| `predict()` | POST | `/ai/predict` | ✅ |
| `predictBoneFracture()` | POST | `/ai/bone-fracture` | ✅ |
| `checkHealth()` | GET | `/ai/health` | ✅ |

**Predict request:** `{ patientId, features[12], fileId?, doctorId? }`  
**Response:** `{ status, data: AiReport }`

---

### PaymentApiService (`core/services/payment-api.service.ts`)

| Frontend Method | HTTP | Endpoint | Roles | Status |
|-----------------|------|----------|-------|--------|
| `createIntent()` | POST | `/payment/create-intent` | patient | ✅ |
| `issueRefund()` | POST | `/payment/refund` | admin, doctor | ✅ (no UI yet) |
| Payment history | GET | — | — | ❌ Missing |

**Create intent:** `{ appointmentId, amount, type: 'full_payment' | 'deposit' }`  
**Response:** `{ status, clientSecret }` → Stripe Elements

---

### NotificationApiService (`core/services/notification-api.service.ts`)

| Frontend Method | HTTP | Endpoint | Status |
|-----------------|------|----------|--------|
| `getPreferences()` | GET | `/notification/preferences` | ✅ |
| `updatePreferences()` | PATCH | `/notification/preferences` | ✅ |
| `registerFcmToken()` | POST | `/notification/token` | ✅ |
| List notifications | GET | — | ❌ Missing |

---

### SocketService (`core/services/socket.service.ts`)

| Event | Direction | Backend Support |
|-------|-----------|-----------------|
| `joinConversation` | emit | ✅ |
| `sendMessage` | emit | ✅ |
| `newMessage` | on | ✅ |
| `error` | on | ✅ |
| `call:join/offer/answer/ice-candidate` | emit | ❌ Pending |

---

## Feature → Service Mapping

| Feature Component | Services Used |
|-------------------|---------------|
| Login / Signup | AuthService |
| Patient Dashboard | PatientApiService, AppointmentApiService |
| Doctor Dashboard | DoctorApiService |
| Doctor Availability | DoctorApiService |
| Appointments | AppointmentApiService, DoctorApiService |
| Medical Files | MedicalFileApiService, PatientApiService |
| AI Reports | AiApiService, PatientApiService |
| Payments | PaymentApiService, AppointmentApiService |
| Notifications | NotificationApiService, SocketService |
| Video Consultation | WebRtcService, SocketService, AppointmentApiService, DoctorApiService |
| Admin Dashboard | — (no backend APIs) |

---

## TypeScript Models

All types defined in `shared/models/api-response.model.ts`:

- `AuthUser`, `PatientProfile`, `DoctorProfile`, `DoctorAvailability`
- `Appointment`, `MedicalFile`, `AiReport`
- `Payment`, `Refund`, `NotificationPreferences`
- Request/response interfaces for each API call

---

## Error Response Format

Backend returns:
```json
{ "message": "Error description" }
```

Or via express-validator:
```json
{ "errors": [{ "msg": "...", "path": "..." }] }
```

Handled by `errorInterceptor` → `ToastService`.

---

## Environment Configuration

| Variable | Development | Production |
|----------|-------------|------------|
| `apiUrl` | `http://localhost:3000/api/v1` | `/api/v1` (proxy) |
| `socketUrl` | `http://localhost:3000` | same origin |
| `stripePublishableKey` | `pk_test_...` | `pk_live_...` |

---

*Generated from live backend route analysis. See BACKEND_REVIEW_REPORT.md for gaps.*
