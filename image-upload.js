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
  let media = record.getCellValue(inputField);
  if (!media || media.length === 0) {
    console.log('No attachments, skipping.');
  } else {
    const results = await Promise.all(
      media.map(async (attachment) => {
        try {
          const res = await fetch(input.secret('API_URL').trim(), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': input.secret('API_KEY').trim(),
            },
            body: JSON.stringify({
              sourceUrl: attachment.url,
              filename: attachment.filename,
              contentType: attachment.type,
              destinationPrefix: `images/${table.name}`,
            }),
          });

          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Upload failed (${res.status}): ${errorText}`);
          }

          const { data } = await res.json();

          return {
            attachmentId: attachment.id,
            filename: attachment.filename,
            s3Url: data.url,
            success: true,
          };
        } catch (err) {
          return {
            attachmentId: attachment.id,
            filename: attachment.filename,
            error: err instanceof Error ? err.message : String(err),
            success: false,
          };
        }
      })
    );

    // Separate successes from failures
    const successes = results.filter(r => r.success);
    const failures = results.filter(r => !r.success);

    if (failures.length > 0) {
      console.log(failures)
      console.log(`${failures.length} of ${results.length} uploads failed`);
    }

    if (successes.length > 0) {
      console.log('Uploads successful')
      const mappedUrls = successes.map((media) => {
        const url = String(media.s3Url)
        console.log(`Received ${url}`)
        return url
      }).join(',');
      if (mappedUrls && mappedUrls.length > 0) {
        await table.updateRecordAsync(recordId, {
          [outputField]: singleUrl ? mappedUrls.split(',')[0] : mappedUrls
        });
      }
      console.log(`Saved ${singleUrl ? "URL": "URLs" } back to "${outputField}"`);
    }
  }
}