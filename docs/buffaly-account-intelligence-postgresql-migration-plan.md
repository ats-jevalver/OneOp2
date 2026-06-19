# OneOp2 PostgreSQL Migration Plan

## Goal

Sprint 5 keeps JSON persistence as the default demo provider while introducing a production-shaped PostgreSQL target. The migration path is intentionally incremental so API handlers can move behind a provider boundary before live vendor data is imported.

## Provider Strategy

- `ONEOP2_STORE_PROVIDER=json` remains the default and is fully supported.
- `ONEOP2_STORE_PROVIDER=postgres` is a defined seam. In Sprint 5 it fails fast with a clear not-configured diagnostic unless future work adds a database provider.
- `ONEOP2_DATABASE_URL` is reserved for the future PostgreSQL provider.

## Migration Order

1. Create base reference tables: users, accounts, integrations.
2. Load identity/mapping tables: account_external_identities, contacts.
3. Load intelligence tables: evidence_items, account_health_scores, recommendations.
4. Load runtime workflow tables: generated_artifacts, write_back_audit_events, activities.
5. Load app_settings, including PSA field mapping and current-user/demo settings.
6. Validate search indexes and account command-center read paths.

## Rollback Notes

- JSON remains the rollback path until the PostgreSQL provider is activated.
- Runtime workflow state can be re-exported from `src/data-store/oneop2-store.json` for migration testing.
- No destructive sync/import should run without preview counts and confirmed mapping protection.

## Matching Rules

Confirmed account mappings must not be overwritten by sync previews. Incoming PSA company/contact/ticket records should match by source ID first, then verified domain, then normalized name with `needs_review` status when confidence is not high enough.

## Validation Checklist

- `db/schema.sql` applies cleanly to a local PostgreSQL database.
- Account search has indexes for name/domain lookup.
- Recommendation filters use `(account_id, status)`.
- Generated artifacts use `(account_id, artifact_type)`.
- Write-back and activity timelines use descending created timestamps.
