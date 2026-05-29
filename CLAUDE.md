# Airtable Automations

## Overview

Airtable automation scripts for the GTREx:DB table. These run in Airtable's
scripting runtime — not Node.js. No package.json, no build step.

## Files

- `image-upload.js` — uploads attachments to cloud storage via external API
- `map-coords.js` — geocodes addresses via Google Maps API

## Runtime

Airtable scripting environment. Available globals:
- `base` — Airtable base object
- `input.config()` — reads input variables configured in automation UI
- `input.secret(name)` — reads secrets configured in automation UI
- `fetch` — built-in fetch (no import needed)

## Conventions

- Default table: `GTREx:DB`. `map-coords.js` hardcodes it; `image-upload.js` takes `tableId` as a runtime input.
- Coordinates stored as `{lng},{lat}` (longitude first)
- Media URLs joined by a configurable `separator` in `image-upload.js` (default `|`, not comma)
- Scripts are self-contained — no shared modules

## Secrets

- `API_URL` — upload endpoint (image-upload.js)
- `API_KEY` — upload auth key (image-upload.js)
- `GOOGLE_MAPS_API_KEY` — geocoding key (map-coords.js)

## Gotchas

- `image-upload.js` posts a single batch request to `API_URL` containing all attachments — not one request per file.
- `image-upload.js` throws if any item in the batch fails; partial successes still error out.
- `outputField` accepts dotted names like `custom_fields.media` — that's a literal Airtable field name, not a nested path.
- `map-coords.js` stores coordinates as `{lng},{lat}` (longitude first) — non-standard order; do not swap.
