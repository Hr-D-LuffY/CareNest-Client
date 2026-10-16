# CareNest Client <small>— Trusted care for your little ones</small>

The web app for CareNest, a childcare and supervised-transport platform. Guardians add their children, book seats in rooms run by verified staff, top up a wallet through bKash, request rides and rate staff. Staff run the day, and admins keep the platform honest. When a room is full, a booking joins a fair, ranked waitlist instead of failing, and the app shows exactly where the child stands.

| | |
|---|---|
| **Live app** | https://care-nest-hr.vercel.app/ |
| **Backend API** | https://carenest-server.onrender.com/api/v1 |
| **Backend repository** | https://github.com/Hr-D-LuffY/CareNest-Server |
> The backend runs on Render's free tier and sleeps when idle, so the first request can take 30–60 seconds. Use the **Activate Backend** button in the navbar before a demo.

## Problem Statement

Parents who need supervised childcare, with a ride to and from the session, usually arrange it informally. They find a sitter in a group chat, cannot see whether a room has space, and have no fair process when it is full. Nobody can easily tell who was paid, when, and for what. Checking that the person caring for a child is who they say they are is left to word of mouth.

## Our Solution

This client is the face of the [CareNest API](https://github.com/Hr-D-LuffY/CareNest-Server). It gives each of the three kinds of user a focused workspace:

- **Guardians** browse care rooms, see live seat counts, book a seat in a short wizard, and follow every booking, ride and wallet movement in one place.
- **Staff** (sitters, drivers, or both) see only the tools that match their type: a weekly task board with check-in and check-out, trips, vehicles, availability, earnings and ratings.
- **Admins** create and verify staff, manage rooms and waitlists, and read analytics and the audit log.

The interface is built to show the backend's differentiator, the **weighted waitlist**. A full room never shows an error. The guardian sees a clear "Waitlisted" state with the priority score and an explanation of how promotion works, and staff and admins can open the ranked queue and watch a cancellation promote the next child.

## Key Features

### Guardian

- **Booking wizard**: pick a child, pick a room and a session date (only the room's weekday is selectable), review the fee and wallet balance, then submit. The wizard handles both outcomes: `201` confirmed with the estimated fee, and `202` waitlisted with the priority score.
- **Children**: add, edit and remove children with medical notes, emergency contacts and a photo.
- **Care rooms**: URL-synced filters (tier, status, weekday, date), search and sort. Room pages show staff ratings and a price calculator.
- **Bookings**: list with optimistic cancellation, a detail page with a staff rating form and a ride request tied to the booking.
- **Wallet**: balance, filterable transaction history and a real **bKash** top-up (10–25,000 BDT). Success is shown only after the backend has verified the payment with bKash, never from the redirect alone.
- **Profile**: details, photo upload and account deletion.

### Staff

- **Task board** with a weekly calendar and optimistic check-in and check-out.
- **Waitlists**: the ranked queue for each room the sitter runs, refreshed every 30 seconds.
- **Trips and vehicles** for drivers: start and end trips, manage vehicles.
- **Availability** for sitters, **earnings** charts with a date range, and ratings.
- **Verification**: unverified staff see a banner and disabled actions, and can upload their ID document with a preview and progress bar.
- The sidebar adapts to `staffType`: a sitter never sees Trips, and a driver never sees Waitlists.

### Admin

- **Analytics board** with money per day, wallet top-ups, bookings, cancellations, promotions and seats per day.
- **Staff management**: filters, verify and reject, and a three-step **create-staff wizard** with a Zod schema per step.
- **Rooms**: full CRUD plus the ranked waitlist for any room.
- **Users** and **audit logs** with filters and pagination.

### Platform-wide

- **Two-layer role protection**: a route guard (`proxy.ts`) plus role-aware UI.
- **Light and dark themes**, mobile-first layouts that work from 360 px up, and skeleton loading states that match each page.
- **URL as the source of truth** for filters, search, sort and page, so a refresh or a shared link restores the same view.
- **Google sign-in**, one-click demo login, and friendly handling of rate limits (`429`), offline and timeout errors.

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Server Components, route handlers) |
| UI library | React 19 with the React Compiler |
| Language | TypeScript (strict, no `any`) |
| Styling | Tailwind CSS 4, `tw-animate-css` |
| Components | shadcn/ui on Base UI, Lucide icons |
| Server state | TanStack Query 5 |
| Forms | TanStack Form with Zod 4 validators |
| HTTP client | ofetch |
| Charts | Recharts |
| Animation | Motion (entrance and hover effects only, respects reduced motion) |
| Toasts and theming | Sonner, next-themes |
| Authentication | httpOnly cookie session (BFF), Google OAuth (`@react-oauth/google`) |
| Dates | date-fns |
| Linting and formatting | Biome |
| Deployment | Vercel (frontend), Render (backend) |

Package versions are pinned exactly (`.npmrc` sets `save-exact=true`).

## Getting Started

### Prerequisites

- Node.js 20.9 or later
- npm
- A running CareNest backend: the [hosted one](https://carenest-server.onrender.com/api/v1) or a local copy of the [server repository](https://github.com/Hr-D-LuffY/CareNest-Server)

### Installation

```bash
# Clone the repository
git clone https://github.com/Hr-D-LuffY/CareNest-Client.git
cd CareNest-Client

# Install dependencies
npm install

# Copy the environment template and fill in real values
cp .env.example .env
```

### Environment Variables

Set these in `.env` (see `.env.example` for the full template). Values are validated with Zod when the server starts, so a missing or malformed one stops the app with a readable message.

| Variable | Scope | Purpose |
|---|---|---|
| `BACKEND_API_URL` | server | Backend base URL, for example `http://localhost:5000/api/v1`. A hosted backend **must** use `https://` |
| `NEXT_PUBLIC_APP_URL` | public | This app's origin. Used for metadata, the sitemap, robots and share-image links. Defaults to `http://localhost:3000` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | public | Google OAuth client ID. Leave blank to hide the Google button. The backend needs the same value as its `GOOGLE_CLIENT_ID` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | public | Where the contact form's message goes. Leave blank to disable the form |
| `DEMO_ADMIN_EMAIL` / `DEMO_ADMIN_PASSWORD` | server | Credentials behind the one-click Admin demo button |
| `DEMO_STAFF_EMAIL` / `DEMO_STAFF_PASSWORD` | server | Sitter demo |
| `DEMO_DRIVER_EMAIL` / `DEMO_DRIVER_PASSWORD` | server | Driver demo |
| `DEMO_GUARDIAN_EMAIL` / `DEMO_GUARDIAN_PASSWORD` | server | Guardian demo |

Demo credentials are server-only. The demo buttons post only a role name to `/api/auth/demo-login`, and the route handler looks up the credentials, so no password reaches the browser bundle.

### Running the Project

```bash
# Start the development server
npm run dev

# Type-check
npx tsc --noEmit

# Lint and format
npm run lint
npm run format

# Build for production
npm run build

# Run the production build
npm run start
```

The app is available at `http://localhost:3000` by default.

### Demo Credentials

Every role has a one-click button on the login page. The same accounts work by hand:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@carenest.com` | `CareNest@Admin2026` |
| Staff (Sitter) | `sitter.demo@carenest.com` | `CareNest@Staff2026` |
| Staff (Driver) | `driver.demo@carenest.com` | `CareNest@Staff2026` |
| Guardian | `guardian.demo@carenest.com` | `CareNest@Guardian2026` |

The Admin and Staff accounts come from the backend seed (`npx prisma db seed`). The Guardian account is created through the registration flow.

## Architecture

### Backend-for-Frontend (BFF) authentication

The backend sets its cookies on its own domain (Render). The frontend lives on another site (Vercel), so those cookies would never reach it. The app therefore owns its session:

1. The login form posts to `/api/auth/login`. The route handler calls the backend, then stores the tokens as **httpOnly, Secure, SameSite=Lax cookies on the frontend domain** (`cn_access`, `cn_refresh`), plus a small `cn_session` cookie with the display profile.
2. **Server Components** call the backend through `lib/api/server.ts`, which reads the access cookie and sends `Authorization: Bearer`.
3. **Client Components** never see a token. They call `/api/backend/<path>`, a catch-all route handler that attaches the token and forwards the request, including multipart uploads.
4. On a `401` the handler refreshes the token once, rotates both cookies and retries. If the refresh fails, the cookies are cleared and the user is sent to `/login`.
5. The visitor's IP is forwarded in `X-Forwarded-For`, so the backend's rate limiter sees real users rather than one shared Vercel address.

### Role protection

Role is enforced in two places, always both:

- **Route level**: `src/proxy.ts` (the Next 16 name for middleware) decodes the access token's role and expiry. No session sends the visitor to `/login?redirect=<path>`, the wrong role goes to that role's own dashboard, and a signed-in user on `/login` or `/register` is sent home. The backend still verifies every API call.
- **UI level**: the sidebar, buttons and actions render from the session (`role`, plus `staffType` and `verificationStatus` for staff).

| Role | Area | Who |
|---|---|---|
| `GUARDIAN` | `/dashboard/*` | Parents. The only role that self-registers |
| `STAFF` | `/staff/*` | Sitters, drivers or both. Created by an admin |
| `ADMIN` | `/admin/*` | Platform administrators |

### Server and Client Components

- Pages are **Server Components** by default. Public pages, layouts, overviews and detail pages fetch on the server.
- `"use client"` appears only at the leaves: forms, filterable tables, dialogs, charts, upload widgets and the theme toggle.
- Interactive list pages prefetch on the server with a `QueryClient` and `HydrationBoundary`. The client table builds its query key from `useSearchParams()`, so **the URL is the single source of truth** for filters, search, sort and page.
- Charts load through `next/dynamic` so they stay out of the first bundle.

### State and data

- Server state lives only in **TanStack Query**, with one query-key factory per feature and a 30-second `staleTime`, so going back shows cached data without a refetch.
- Global client state is limited to React Context for the session and the theme. Form and wizard state lives in TanStack Form.
- Optimistic updates with rollback cover check-in and check-out, booking cancellation, child deletion and staff verification.
- Money and decimals arrive from the API as strings and are formatted, never calculated, on the client. The backend computes every fee.
- Backend validation errors (`errors[].path`) are mapped back onto the matching form field. Other failures raise one global toast from the query client.

### Payment flow (bKash)

1. `/dashboard/wallet`: the guardian enters an amount, the app calls `POST /payment/top-up` and redirects to the returned `checkoutUrl`.
2. The guardian pays or cancels on bKash's page, which redirects to `/payment/callback`.
3. The callback page asks the backend to confirm the payment with bKash, then redirects to `/payment/success` or `/payment/cancel`.
4. The success page shows the amount and the new balance from the backend's verified result. The `status` in the URL is never trusted.

### Design system

The theme is **Caffeine**: a warm brown primary in light mode, peach in dark mode (dark is the default), a 0.5 rem radius, and the Varela Round and Nunito Sans pair loaded through `next/font`. Every colour is a token defined in `src/app/globals.css`, including the status colours (`success`, `warning`, `info`, `cta`). Components use token classes such as `bg-primary` and `text-muted-foreground`, never raw hex values. Motion is limited to transform and opacity, skips data tables, and respects `prefers-reduced-motion`.

## Page Map

| Area | Routes |
|---|---|
| Public | `/`, `/about`, `/services`, `/contact` |
| Auth | `/login`, `/register`, `/forgot-password` |
| Guardian | `/dashboard`, `/dashboard/children`, `/dashboard/rooms`, `/dashboard/rooms/[id]`, `/dashboard/book`, `/dashboard/bookings`, `/dashboard/bookings/[id]`, `/dashboard/transport`, `/dashboard/wallet`, `/dashboard/profile` |
| Payment | `/payment/callback`, `/payment/success`, `/payment/cancel` |
| Staff | `/staff`, `/staff/rooms`, `/staff/rooms/[id]/waitlist`, `/staff/trips`, `/staff/vehicles`, `/staff/availability`, `/staff/earnings`, `/staff/profile` |
| Admin | `/admin`, `/admin/staff`, `/admin/staff/new`, `/admin/staff/[id]`, `/admin/rooms`, `/admin/rooms/[id]`, `/admin/users`, `/admin/users/[id]`, `/admin/audit-logs` |

Every data page has a skeleton `loading.tsx`, a meaningful empty state and an error boundary. Public pages export `metadata`, dashboards are `noindex`, and the app ships a sitemap, `robots.txt`, a static share image, a custom 404 and error boundaries for each area.

## Project Structure

```
src/
├── proxy.ts                  # Role-based route guard
├── instrumentation.ts        # Validates env vars when the server boots
├── app/
│   ├── layout.tsx            # Fonts, theme, query and toast providers
│   ├── (public)/             # Landing, about, services, contact
│   ├── (auth)/               # Login, register, forgot password
│   ├── dashboard/            # Guardian area
│   ├── staff/                # Staff area
│   ├── admin/                # Admin area
│   ├── payment/              # bKash callback, success, cancel
│   └── api/
│       ├── auth/             # login, logout, register, refresh, google, demo-login, session
│       ├── backend/          # Catch-all BFF proxy to the CareNest API
│       └── backend-health/   # Pings the backend to wake it from sleep
├── components/
│   ├── ui/                   # shadcn/ui components (Base UI)
│   ├── shared/               # DataTable, StatCard, StatusBadge, EmptyState, FileUpload, ...
│   └── layout/               # Public navbar, footer, dashboard shell, sidebar, nav config
├── features/                 # One folder per backend module
│   └── <domain>/             # *.api.ts, *.queries.ts, *.schema.ts, components/
├── hooks/                    # useQueryParams, useDebounce, useSession, useAppForm, ...
├── lib/                      # API clients, ApiError, session, env, formatters
├── providers/                # Query, session and theme providers
└── types/                    # API envelope, enums and domain types
```

Features follow the backend's modules: `auth`, `guardian`, `child`, `room`, `booking`, `waitlist`, `transport`, `wallet`, `payment`, `rating`, `staff` and `admin`. The Zod schemas mirror the backend's rules (password 8–72 characters, phone required, top-up 10–25,000, staff rates required by `staffType`).

## Deployment

The frontend deploys to **Vercel**, the backend to **Render**.

1. Import the repository into Vercel and add the environment variables from the table above.
2. Set `BACKEND_API_URL` to the Render URL ending in `/api/v1`. It must be `https://`, because Render redirects `http` to `https` and that redirect drops the `Authorization` header.
3. Set `NEXT_PUBLIC_APP_URL` to the Vercel URL, otherwise the sitemap, robots file and share image point at `localhost`.
4. On the **backend**, set `FRONTEND_URL` and `BKASH_CALLBACK_URL` to the Vercel URL, and add the Vercel URL to the Google OAuth client's authorised JavaScript origins.
5. The backend limits requests by IP. Make sure it sets `trust proxy` for the Render and Vercel hops, so visitors are not counted as one address.

## Known Limitations

These depend on backend endpoints that do not exist yet, and the app says so rather than faking them:

- **Notifications**: the bell in the top bar shows an honest empty state.
- **Password reset**: the "Forgot password?" page validates the email but its submit button is disabled.
- **Analytics per day**: the backend returns totals only, so the admin board builds daily figures from the audit log (the newest 1,000 events) and from room availability for today and the next 13 days. Occupancy for past days is not available.

## Author

**Habibur Rahmann**

- GitHub: [Hr-D-LuffY](https://github.com/Hr-D-LuffY)
- LinkedIn: [md-habib-ur-rahman](https://www.linkedin.com/in/md-habib-ur-rahman/)
- Portfolio: [md-habibur-rahman-17.vercel.app](https://md-habibur-rahman-17.vercel.app/)

<!--
Screenshots: save images in a folder such as `screenshots/`, then uncomment and place this section
above "Getting Started".

## Screenshots

| Landing page | Booking wizard |
|---|---|
| ![Landing page](screenshots/landing.png) | ![Booking wizard](screenshots/booking-wizard.png) |

| Waitlisted outcome | Admin analytics |
|---|---|
| ![Waitlisted outcome](screenshots/waitlisted.png) | ![Admin analytics](screenshots/admin-analytics.png) |
-->
