# BoniCare Frontend — Technical Architecture

## Overview

Production Angular 19 SPA for the BoniCare healthcare platform. All data flows through the real Node.js/Express backend at `http://localhost:3000/api/v1`. No mocked APIs or fake services.

## Technology Stack

| Layer | Choice |
|-------|--------|
| Framework | Angular 19 (standalone components) |
| State | Angular Signals + injectable services |
| HTTP | HttpClient with functional interceptors |
| Routing | Lazy-loaded feature routes with functional guards |
| Real-time | Socket.IO client |
| Payments | Stripe.js + backend PaymentIntent API |
| Video | WebRTC + Socket.IO signaling abstraction |
| Styling | SCSS design tokens, dark mode via `data-theme` |

## Directory Structure

```
bonicare-frontend/src/
├── app/
│   ├── core/
│   │   ├── auth/           # AuthService (JWT session)
│   │   ├── guards/         # authGuard, roleGuard, guestGuard
│   │   ├── interceptors/   # JWT + error handling
│   │   ├── layouts/        # Main (dashboard) + Auth layouts
│   │   └── services/       # Typed API clients per domain
│   ├── shared/
│   │   ├── models/         # TypeScript API contracts
│   │   ├── pipes/          # Date, status formatting
│   │   └── ui/             # Reusable component library
│   └── features/
│       ├── auth/           # Login, signup
│       ├── patient/        # Patient dashboard
│       ├── doctor/         # Doctor portal + availability
│       ├── admin/          # Admin shell (pending backend)
│       ├── appointments/   # Book, list, cancel
│       ├── medical-files/  # Upload with progress
│       ├── ai/             # Predictions + fracture detection
│       ├── payments/       # Stripe integration
│       ├── notifications/  # Preferences + FCM token
│       └── video-consultation/  # WebRTC + chat
├── environments/
└── styles.scss             # Global design tokens
```

## Security Architecture

```
┌─────────────┐     Bearer JWT      ┌──────────────────┐
│  Angular    │ ──────────────────► │  Express API     │
│  AuthService│                     │  authMiddleware  │
└─────────────┘                     └──────────────────┘
       │
       │ jwtInterceptor adds Authorization header
       │ errorInterceptor handles 401 → logout
       │
       ▼
┌─────────────┐
│ roleGuard   │ ──► patient | doctor | admin routes
└─────────────┘
```

- JWT stored in `localStorage` (token + user snapshot)
- No sensitive data in URL params
- File upload validation (type, size) client-side
- XSS mitigated via Angular sanitization
- CSRF not required (Bearer token, not cookies)

## State Management

No NgRx — justified by moderate complexity:

- **AuthService**: `signal` for user/token, computed `isAuthenticated` and `role`
- **ThemeService**: `signal` for light/dark mode
- **Feature components**: local `signal` for loading/data/error states
- **SocketService**: `signal` for connection + last message

## Routing & Code Splitting

| Route | Guard | Lazy Chunk |
|-------|-------|------------|
| `/auth/*` | guestGuard | auth feature |
| `/patient` | role: patient | patient dashboard |
| `/doctor/*` | role: doctor | doctor feature |
| `/admin` | role: admin | admin feature |
| `/appointments` | authGuard | appointments |
| `/medical-files` | role: patient | medical files |
| `/ai` | authGuard | AI reports |
| `/payments` | authGuard | payments |
| `/notifications` | authGuard | notifications |
| `/video-consultation` | patient, doctor | video |

## Design System

CSS custom properties in `styles.scss`:

- Primary `#2563EB`, Secondary `#14B8A6`
- Success/Warning/Danger semantic colors
- `[data-theme="dark"]` overrides for all surfaces
- Components: `bc-button`, `bc-card`, `bc-input`, `bc-badge`, `bc-skeleton`

## Video Consultation Architecture

```
┌──────────────┐    call:* events     ┌──────────────┐
│ WebRtcService│ ◄──────────────────► │ SocketService│
│ (RTCPeer)    │    (when available)  │ (Socket.IO)  │
└──────────────┘                      └──────────────┘
       │                                      │
       ▼                                      ▼
  getUserMedia                          sendMessage
  screen share                          joinConversation
```

When backend signaling is missing, UI displays a clear gap notice and chat remains available via existing socket events.

## Performance

- All feature routes lazy-loaded
- Initial bundle ~290 KB raw / ~84 KB transfer
- Skeleton loaders on dashboard loads
- `eventCoalescing` enabled for change detection
- Production build with output hashing

## Running Locally

```bash
# Backend (separate terminal)
cd orthopedic-platform-BoniCare-
npm install && npm run dev

# Frontend
cd bonicare-frontend
npm install
npm start
```

Configure `src/environments/environment.ts`:
- `apiUrl`: `http://localhost:3000/api/v1`
- `socketUrl`: `http://localhost:3000`
- `stripePublishableKey`: your Stripe test key

## Production Build

```bash
npm run build
# Output: dist/bonicare-frontend/
```

Serve behind reverse proxy with `/api/v1` proxied to backend.

## Backend Gaps

See `docs/BACKEND_REVIEW_REPORT.md` for APIs not yet available. Frontend surfaces honest empty states — no workarounds or mocks.
