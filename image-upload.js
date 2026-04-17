// Input variables configured in the automation UI:
// - recordId: record ID from the trigger
// - media: the attachment field (pick the FIELD, not "attachment url")
let table = base.getTable('GTREx:DB');
let inputConfig = input.config();
let recordId = inputConfig.recordId;
let objectId = inputConfig.objectId;
let record = await table.selectRecordAsync(recordId, { fields: ["media"] })

if (!record) {
  console.log('Record not found, skipping.');
} else {
  let media = record.getCellValue("media");
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
              destinationPrefix: `images/${objectId}`,
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
      const mappedUrls = successes.map((media) => String(media.s3Url)).join(',');
      if (mappedUrls && mappedUrls.length > 0) {
        await table.updateRecordAsync(recordId, {
          "custom_fields.media": mappedUrls
        });
      }
      console.log('Done!');
    }
  }
}