// ========================================
// Configuration - Inputs (Airtable left hand side)
// ========================================
// Input variables configured in the automation UI:
// - Name: recordId, Value: Airtable record ID
// - Name: tableId, Value: Table ID

// ========================================
// Configuration - Secrets (Airtable left hand side)
// ========================================
// - Name: API_URL, Secret: Enter plain text API URL
// - Name: API_KEY, Secret: Enter plain text API key / password for accessing API

// ========================================
// Configuration - Fields
// ========================================
// - Enter in plain text the exact name of the field where you are adding images
const inputField = "media";
// - Enter in plain text the exact name of the field where you want the S3 image URLs saved
const outputField = "custom_fields.media";
// - Enter true / false, choose true if you only want the URL of the latest image saved back to the output field
const singleUrl = true;



const inputConfig = input.config();
const tableId = inputConfig.tableId;
const recordId = inputConfig.recordId;

// Add variable for field name
const table = base.getTable(tableId);
const record = await table.selectRecordAsync(recordId, { fields: [inputField] })

if (!record) {
  console.log('Record not found, skipping.');
} else {
  let media = record.getCellValue(inputField) ?? [];
  const res = await fetch(input.secret('API_URL').trim(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': input.secret('API_KEY').trim(),
    },
    body: JSON.stringify({
      prefix: `images/${table.name}/${recordId}`,
      attachments: media.map(({ id, url, filename, type }) => ({
        id: id, 
        sourceUrl: url, 
        filename: filename, 
        contentType: type
      }))
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Upload failed (${res.status}): ${errorText}`);
  }

  const { data } = await res.json();

  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value) && value.length > 0) {
      console.log(`${key}: ${value.length} item(s)`, value);
    }
  }

  if (data.failed?.length > 0) {
    throw new Error(
      `${data.failed.length} of ${media.length} upload(s) failed. ` +
      `First failure: ${data.failed[0].error ?? 'unknown error'}`
    );
  }

  await table.updateRecordAsync(recordId, {
    [outputField]: singleUrl ? (data.urls[0] ?? "") : data.urls.join(",")
  });

  console.log(`Saved ${singleUrl ? "URL" : "URLs"} back to "${outputField}"`);
}