// Vercel serverless function: proxies the Census Bureau Geocoder so the
// browser doesn't have to deal with the Census API's lack of CORS support.
// GET /api/geocode?address=<full street address>

const CENSUS_GEOCODER_URL = "https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ matched: false, error: "Method not allowed" });
  }

  const address = (req.query.address || "").toString().trim();
  if (!address) {
    return res.status(400).json({ matched: false, error: "Missing required 'address' query parameter" });
  }
  if (address.length > 250) {
    return res.status(400).json({ matched: false, error: "Address is too long" });
  }

  const url = new URL(CENSUS_GEOCODER_URL);
  url.searchParams.set("address", address);
  url.searchParams.set("benchmark", "Public_AR_Current");
  url.searchParams.set("vintage", "Current_Current");
  url.searchParams.set("layers", "all");
  url.searchParams.set("format", "json");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  let census;
  try {
    const response = await fetch(url.toString(), { signal: controller.signal });
    if (!response.ok) {
      return res.status(502).json({ matched: false, error: `Census geocoder returned HTTP ${response.status}` });
    }
    census = await response.json();
  } catch (e) {
    const message = e.name === "AbortError" ? "Census geocoder timed out" : "Failed to reach Census geocoder";
    return res.status(502).json({ matched: false, error: message });
  } finally {
    clearTimeout(timeout);
  }

  const matches = census?.result?.addressMatches || [];
  if (matches.length === 0) {
    return res.status(200).json({
      matched: false,
      error: "No match found for that address. Check the spelling and include city/state/ZIP.",
    });
  }

  const match = matches[0];
  const geographies = match.geographies || {};
  const tract = geographies["Census Tracts"]?.[0];
  const county = geographies["Counties"]?.[0];
  const state = geographies["States"]?.[0];

  if (!tract || !tract.GEOID) {
    return res.status(200).json({
      matched: false,
      error: "Address matched, but no census tract was returned for it.",
    });
  }

  return res.status(200).json({
    matched: true,
    inputAddress: address,
    matchedAddress: match.matchedAddress,
    coordinates: match.coordinates,
    geoid: tract.GEOID,
    tractName: tract.NAME,
    county: county?.NAME || null,
    state: state?.NAME || null,
    stateAbbr: state?.STUSAB || null,
  });
}
