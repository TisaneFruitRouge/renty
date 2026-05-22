# Renty

Renty is a rental-management app for landlords. It manages properties, tenants,
leases, document vault storage, messaging, subscriptions, and rent receipts.

The production app is deployed on Vercel and uses Convex for the backend:
database, Better Auth, server functions, and file storage.

## Features

### Property Management
- Create and edit rental properties
- Manage property photos
- View property details, leases, documents, and recent receipts

### Tenant Management
- Add new tenants
- Edit existing tenants
- Assign tenants to leases
- Mobile tenant authentication with passcode and biometric support

### Lease Management
- Create individual, shared, and colocation leases
- Track active, pending, expired, and terminated leases
- Renew or terminate leases
- Configure automatic rent receipt generation

### Rent Receipts
- Generate PDF rent receipts
- Store PDFs in Convex file storage
- Send receipts by email
- Run scheduled generation and send jobs through Vercel cron routes

### Messaging And Documents
- Property channels between landlords and tenants
- Document vault with tenant sharing controls
- Mobile API routes for tenant-facing access

### Subscriptions
- Better Auth Stripe subscription integration
- Plan limits enforced in app logic

## Project Structure

- `src/renty`: Next.js web app and API routes
- `src/renty/convex`: Convex schema, functions, Better Auth integration, and storage functions
- `src/renty-app`: mobile app
- `src/landing`: marketing site

## Local Development

Use Yarn from the repository root.

```bash
yarn install
yarn workspace renty convex:dev
yarn workspace renty dev
```

The web app uses a single local env file:

```text
src/renty/.env.local
```

Required app env vars:

```text
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
AUTH_BACKEND=convex
NEXT_PUBLIC_AUTH_BACKEND=convex
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_CONVEX_SITE_URL=
CONVEX_SITE_URL=
SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
RESEND_API_KEY=
DEV_EMAIL=
CRON_SECRET=
ABLY_API_KEY=
JWT_SECRET=
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_BASIC_PRICE_ID=
STRIPE_BASIC_ANNUAL_DISCOUNT_PRICE_ID=
STRIPE_PRO_PRICE_ID=
STRIPE_PRO_ANNUAL_DISCOUNT_PRICE_ID=
```

## Deployments

Convex production deployment:

```bash
npx convex deploy --yes
```

Vercel production deployment:

```bash
vercel deploy --prod --yes
```

The production app is served at:

```text
https://app.userenty.cc
```

## Notes

- Renty no longer uses Postgres or Vercel Blob at runtime.
- Convex is the source of truth for database records, auth, server functions, and file storage.
- Some Convex records keep a legacy imported ID field for migrated data compatibility.
