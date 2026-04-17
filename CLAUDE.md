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

- Table name: `GTREx:DB`
- Coordinates stored as `{lng},{lat}` (longitude first)
- Media URLs stored as comma-separated string
- Scripts are self-contained — no shared modules

## Secrets

- `API_URL` — upload endpoint (image-upload.js)
- `API_KEY` — upload auth key (image-upload.js)
- `GOOGLE_MAPS_API_KEY` — geocoding key (map-coords.js)
