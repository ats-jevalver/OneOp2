# OneOp2

OneOp2 is a Buffaly-powered Account Intelligence MVP for sales and account management teams. Sprint 1 delivers the first visible product slice: search/select an account and render a basic Account Command Center with account owner, agreement, renewal, integration status, and placeholder health context.

## Sprint 1 Features

- Dependency-light Node.js HTTP API.
- Static Account Command Center UI.
- Seeded demo users, accounts, integrations, contacts, agreements, and renewals.
- Account search by name, domain, alias, contact email/name, and external source ID.
- Account Command Center endpoint.
- Revenue endpoint.
- Integration list and sync stub endpoint.
- Product event tracking endpoint.
- API contract smoke tests.
- Planning docs committed under `docs/`.

## Run locally

```bash
npm start
```

Open:

```text
http://localhost:3000
```

## Run tests

```bash
npm test
```

## Demo searches

- `acme`
- `acme.example`
- `tina.reynolds@acme.example`
- `greenfield`
- `riverbend`
- `harbor`
- `PSA-1001`

## Project Structure

```text
docs/      Planning artifacts
public/    Static frontend
src/       Seed data, API handlers, server
tests/     API contract smoke tests
```
