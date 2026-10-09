# Black Loom storefront

React/Vite storefront and Firebase administration interface. The repository name is `venum-fangs`, while the code and UI use Black Loom branding. Portfolio presentation must identify it as a supplied development project; paid-client delivery, asset ownership and real sales have not been established by this audit.

## Local setup

Use Node.js 22+, then `npm ci` and `npm run dev`. `npm run build` produces `dist`. The frontend currently points to the original Firebase project; use a separate test Firebase project before interacting with orders or administration. Do not submit test orders to the live backend. Vercel-style functions in `api` do not run with the Vite development server alone.

Copy `.env.example` to your server environment and configure the Firebase web API key and comma-separated administrator emails. The courier endpoint requires a verified Firebase login for an allowlisted administrator and uses server-only courier credentials. Set up staging credentials first. A Firebase web API key is public application configuration, not an administrator credential.

## Validation and limits

The Vite build and existing Node utility tests passed before the changes. Courier authorization checks are tested without contacting couriers. Real shipping, email, payment settlement, Firebase database/storage rules and production deployment are not verified here. Frontend administration controls do not replace database security rules. The repository does not include a complete production ruleset; review it independently before deploying.

`test_emailjs.mjs` is a manual provider smoke check and sends nothing unless `SEND_TEST_EMAIL=true` and explicit recipient/provider variables are supplied. No email, courier or payment request was made during this audit.
