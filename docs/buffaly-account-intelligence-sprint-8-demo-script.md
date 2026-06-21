# OneOp2 Sprint 8 Pilot Demo Script

## Goal

Demonstrate that Sprint 8 moves OneOp2 toward production-shaped pilot readiness without enabling unsafe external writes or leaking secrets.

## Prerequisites

- Node.js 20 or newer.
- Dependencies installed with `npm install`.
- Optional PostgreSQL database configured with `ONEOP2_DATABASE_URL` for PostgreSQL-backed validation.
- Optional PSA dry-run environment variables configured for connector diagnostics. Do not paste or screen-share secret values.

## Validation

Run the environment validator first:

```bash
npm run validate:environment
```

Expected local JSON-mode result:

- Node check passes.
- Dependency/app module load check passes.
- `npm test` passes.
- PostgreSQL check is either connected or reports that `ONEOP2_DATABASE_URL` is not set.
- No secret values appear in the output.

## Demo Flow

1. Start the app.

   ```bash
   npm start
   ```

2. Show current auth/session provider metadata.

   ```text
   GET /api/v1/session/current-user
   ```

   Call out that `local_demo` user switching is intentionally marked unsafe for production.

3. Switch to the admin demo user for local testing.

   ```text
   PATCH /api/v1/session/current-user
   { "userId": "usr_admin_alex" }
   ```

4. Show PSA connector diagnostics.

   ```text
   GET /api/v1/admin/integrations/int_psa_demo/diagnostics
   ```

   Call out adapter mode, provider type, capabilities, config completeness, and secret presence flags. Confirm no secret values are returned.

5. Show read-only PSA company/contact/ticket validation.

   ```text
   GET /api/v1/admin/integrations/int_psa_demo/psa/companies?search=acme
   GET /api/v1/admin/integrations/int_psa_demo/psa/contacts?externalCompanyId=PSA-1001
   GET /api/v1/admin/integrations/int_psa_demo/psa/tickets?status=open
   ```

   Call out that mock mode returns deterministic seeded rows, real-provider mode is dry-run diagnostics only, and responses include source metadata without secrets.

6. Run PSA sync preview and apply selected safe rows.

   ```text
   POST /api/v1/admin/integrations/int_psa_demo/sync-preview
   POST /api/v1/admin/integrations/int_psa_demo/sync/apply
   ```

   Call out that source metadata identifies mock vs real dry-run mode and external mutation is disabled.

7. Generate and review a QBR draft.

   ```text
   POST /api/v1/accounts/acct_acme/artifacts/qbr-draft
   PATCH /api/v1/generated-artifacts/:generatedArtifactId
   { "status": "reviewed" }
   ```

8. Export the reviewed QBR to a local markdown file.

   ```text
   POST /api/v1/generated-artifacts/:generatedArtifactId/export-file?format=markdown
   ```

   Call out the safe relative path under `artifacts/exports/` and evidence appendix.

9. Generate a customer email draft and show prepare-email handoff.

   ```text
   POST /api/v1/accounts/acct_acme/artifacts/customer-email-draft
   POST /api/v1/generated-artifacts/:generatedArtifactId/email-handoff
   ```

   Call out `review_required` for drafts, recipient suggestions, prepare-email payload shape, and no-send guardrails.

10. Mark the email reviewed and show handoff readiness again.

   ```text
   PATCH /api/v1/generated-artifacts/:generatedArtifactId
   { "status": "reviewed" }
   POST /api/v1/generated-artifacts/:generatedArtifactId/email-handoff
   ```

   Confirm the status becomes `ready_for_review` and no send occurs.

11. Re-run validation.

    ```bash
    npm run validate:environment
    ```

## Optional Real PSA Dry-Run Branch

Set provider type to `connectwise_manage` or `autotask` through the admin integration configuration endpoint, then provide required environment variables outside the repository. Diagnostics should show presence flags only.

ConnectWise Manage dry-run keys:

```text
ONEOP2_PSA_BASE_URL
ONEOP2_PSA_COMPANY_ID
ONEOP2_PSA_PUBLIC_KEY
ONEOP2_PSA_PRIVATE_KEY
```

Autotask dry-run keys:

```text
ONEOP2_PSA_BASE_URL
ONEOP2_PSA_USERNAME
ONEOP2_PSA_SECRET
```

## Safety Callouts

- Local-demo auth switching is for development only.
- Real connector mode is dry-run only in Sprint 8.
- External PSA writes remain disabled unless explicitly implemented in a future sprint.
- Exported files are local artifacts and ignored by Git.
- Email handoff prepares a payload only; it does not send email.
- Secret values must never be committed, logged, or displayed.
