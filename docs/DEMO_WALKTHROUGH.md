# BoniCare Demo Walkthrough — Patient & Doctor Stories

## Demo Accounts (after `npm run seed:reset`)

| Role | Name | Email | Password |
|------|------|-------|----------|
| **Patient** | Kerolis Patient | `patient.kerolis@gmail.com` | `Patient@123456` |
| **Doctor** | Dr. Ahmed Hassan | `dr.ahmed@bonicare.com` | `Doctor@123456` |
| **Admin** | BoniCare Admin | `admin@bonicare.com` | `Admin@123456` |

> Additional seeded users (doctors/patients) use password `Demo@123456` with random emails from Faker.

---

## Seeded Data Summary

| Collection | Count | Notes |
|------------|-------|-------|
| Users | 15 | 3 demo + 12 generated |
| Patients | 12 | Includes Kerolis profile |
| Doctors | 7 | Includes Dr. Ahmed (Orthopedic Surgery) |
| Appointments | 15 | 3 linked to demo patient + doctor |
| Medical Files | 12 | 1 PDF per patient |
| AI Reports | 12 | Linked to patient files (~95% confidence) |

### Demo Patient Profile
- **DOB:** 1998-05-15
- **Gender:** male
- **Medical history:** Low back pain (ICD-10: M54.5), allergy: Penicillin

### Demo Doctor Profile
- **Specialty:** Orthopedic Surgery
- **Hospital:** Cairo University Hospital
- **License:** EG-ORTH-001
- **Experience:** 15 years

### Demo Appointments (Kerolis ↔ Dr. Ahmed)
1. **Scheduled** — in 2 days at 10:00
2. **Awaiting payment** — in 5 days at 14:00
3. **Completed** — 3 days ago at 11:00

---

## Patient Story — End-to-End Flow

### 1. Sign In
- URL: `http://localhost:4200/auth/login`
- Email: `patient.kerolis@gmail.com`
- Password: `Patient@123456`
- **Wrong password shows:** *"Incorrect email or password. Please check your credentials and try again."*

### 2. Patient Dashboard (`/patient`)
- View stats: 1 medical file, 1 AI report, 3 appointments
- See recent appointments with status badges
- Quick links to files, AI, appointments

### 3. Medical Files (`/medical-files`)
- View seeded PDF document
- Upload new image/PDF (max 10MB)
- Progress bar during upload

### 4. AI Reports (`/ai`)
- **Lower back analysis:** enter 12 comma-separated features  
  Example: `63, 22, 39, 40, 98, 12, 35, 44, 28, 15, 55, 19`
- **Bone fracture:** upload X-ray image
- View report history from dashboard data

### 5. Appointments (`/appointments`)
- See 3 seeded appointments
- Book new appointment with Dr. Ahmed (or any doctor)
- Select date/time and cancel if needed

### 6. Payments (`/payments`)
- Select appointment with status `awaiting_payment`
- Initialize Stripe payment (requires `stripePublishableKey` in environment)
- Test card: `4242 4242 4242 4242`

### 7. Notifications (`/notifications`)
- Toggle push/email preferences
- Register browser push token

### 8. Video Consultation (`/video-consultation`)
- Select scheduled appointment
- Start call UI (WebRTC signaling pending backend)
- In-call chat via Socket.IO works when Redis is running

---

## Doctor Story — End-to-End Flow

### 1. Sign In
- Email: `dr.ahmed@bonicare.com`
- Password: `Doctor@123456`
- Redirects to `/doctor`

### 2. Doctor Dashboard (`/doctor`)
- View profile: Orthopedic Surgery, Cairo University Hospital
- Edit specialty, bio, license, experience
- See patient appointments (including Kerolis)

### 3. Availability (`/doctor/availability`)
- Add weekly slots (day, start, end)
- Remove slots
- Patients see availability when booking

### 4. Appointments (`/appointments`)
- View all appointments with patient names
- Cancel appointments

### 5. AI Reports (`/ai`)
- View AI report history (from patient dashboard data when acting as patient context N/A — doctor sees shared AI route)

### 6. Video Consultation (`/video-consultation`)
- Join scheduled call with patient
- Camera/mic/screen share controls

---

## Admin Story

### Sign In
- Email: `admin@bonicare.com`
- Password: `Admin@123456`
- Admin dashboard shell (full admin APIs pending backend)

### Admin Can Access
- `/appointments` — list doctors for booking context
- `/payments` — view payment UI
- `/notifications` — preferences

---

## Running the Stack

```bash
# Terminal 1 — Backend (port 3001 — avoids Grafana on 3000)
cd orthopedic-platform-BoniCare-
npm run dev

# Terminal 2 — Seed (first time or reset)
npm run seed:reset

# Terminal 3 — Frontend
cd bonicare-frontend
npm start
```

**API:** `http://localhost:3001/api/v1`  
**Swagger:** `http://localhost:3001/api-docs`  
**Frontend:** `http://localhost:4200`

### Prerequisites
- MongoDB on `127.0.0.1:27017`
- Redis on `127.0.0.1:6379` (required for Socket.IO chat)

---

## Sign-Up Validation Messages (English)

| Scenario | Message |
|----------|---------|
| Wrong password | Incorrect email or password. Please check your credentials and try again. |
| Email already exists | This email address is already registered. Please sign in or use a different email. |
| Missing phone on signup | Phone number is required |
| Invalid email format | Please enter a valid email address |
| Password too short | Password must be at least 6 characters |

---

## Stripe Test Payment
- Card: `4242 4242 4242 4242`
- Expiry: any future date
- CVC: any 3 digits
