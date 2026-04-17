// Airtable Automation: "When a record is updated" → watch the Address field
// Input variables (configured in the automation UI):
//   recordId → Record ID from trigger
//   address  → Address field from trigger

let table = base.getTable('GTREx:DB');
let inputConfig = input.config();
let recordId = inputConfig.recordId;
let address = inputConfig.address;

if (!address) {
  console.log('No address, skipping.');
} else {
  console.log(`Geocoding: ${address}`);

  let encodedAddress = encodeURIComponent(address);
  let geo = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${input.secret('GOOGLE_MAPS_API_KEY')}`
  ).then(r => r.json());

  if (!geo.results || geo.results.length === 0) {
    console.log(`No geocode results found for: ${address}`);
  } else {
    let { geometry: { location: { lat, lng } }, formatted_address } = geo.results[0];

    console.log(`${formatted_address} → ${lat}, ${lng}`);

    await table.updateRecordAsync(recordId, {
      geoString: formatted_address,
      Coordinates: `${lng},${lat}`
    });

    console.log('Done!');
  }
}