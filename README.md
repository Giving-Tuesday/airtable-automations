# Airtable Automations — Giving Tuesday

Airtable automation scripts for the **GTREx:DB** table. These run inside Airtable's built-in automation editor (not Node.js).

## Scripts

### image-upload.js

Transfers media attachments from an Airtable record to cloud storage via an external upload API, then writes the resulting URLs back to the record.

**Trigger:** Any trigger that yields a record ID and table ID (e.g. "When record updated").

**Input variables (configured in Airtable UI):**

| Variable   | Source                    |
|------------|---------------------------|
| `recordId` | Record ID from trigger    |
| `tableId`  | Table ID from trigger     |

**Secrets:**

| Name      | Description                          |
|-----------|--------------------------------------|
| `API_URL` | Upload API endpoint                  |
| `API_KEY` | Upload API authentication key        |

**Fields used:**

- `media` (attachment) — source attachments (field name configurable via `inputField`)
- `custom_fields.media` (text) — destination URLs joined by `separator` (default `|`)

**In-script configuration constants:**

| Constant      | Default              | Purpose                                                    |
|---------------|----------------------|------------------------------------------------------------|
| `inputField`  | `"media"`            | Attachment field to read from                              |
| `outputField` | `"custom_fields.media"` | Text field to write URLs to                             |
| `singleUrl`   | `false`              | If `true`, write only the latest URL instead of the list   |
| `separator`   | `"\|"`               | Joins multiple URLs in the output field                    |
| `imageSize`   | `{}`                 | Optional `{ width, height }` max dimensions for resizing   |

### map-coords.js

Geocodes an address using the Google Maps Geocoding API and writes the formatted address and coordinates back to the record.

**Trigger:** Record updated (Address field)

**Input variables (configured in Airtable UI):**

| Variable  | Source                   |
|-----------|--------------------------|
| `recordId`| Record ID from trigger   |
| `address` | Address field from trigger |

**Secrets:**

| Name                  | Description              |
|-----------------------|--------------------------|
| `GOOGLE_MAPS_API_KEY` | Google Maps API key      |

**Fields used:**

- `geoString` (text) — formatted address from Google
- `Coordinates` (text) — `{longitude},{latitude}`

## Setup

1. Open the Airtable base containing the **GTREx:DB** table.
2. Go to **Automations** and create a new automation.
3. Set the trigger (e.g., "When record updated").
4. Add a **Run a script** action and paste the script contents.
5. Configure input variables in the automation UI to map trigger values.
6. Add the required secrets under the script's secret configuration.

## Required Table Fields (GTREx:DB)

| Field                | Type       | Used by          |
|----------------------|------------|------------------|
| `media`              | Attachment | image-upload.js  |
| `custom_fields.media`| Text       | image-upload.js  |
| `Address`            | Text       | map-coords.js    |
| `geoString`          | Text       | map-coords.js    |
| `Coordinates`        | Text       | map-coords.js    |

## Notes

- `image-upload.js` takes `tableId` as an input variable, so it can be wired up against any table — not just `GTREx:DB`.
- `map-coords.js` hardcodes `base.getTable('GTREx:DB')`; update the script if you want to reuse it elsewhere.
