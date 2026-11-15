# Local development and deployment

Prerequisites: Node.js 20.9+ and npm.

```bash
npm install
npm run dev
```

Open http://localhost:3000. Other commands: `npm run build`, `npm run start`, `npm run typecheck`, and `npm test`.

For Vercel, push the **contents of this folder** to a GitHub repository, import it at https://vercel.com/new, select Next.js and deploy. No API key is needed for NASA POWER. For Render, deploy a Node web service; `render.yaml` is included (free-plan availability varies). An internet connection is needed for NASA POWER and map tiles.

API: `GET /api/story?lat=1.37&lon=32.29`. Request coordinates must be numbers between -90 and 90 / -180 and 180 respectively. The API uses NASA POWER daily `PRECTOTCORR,T2M,RH2M,WS2M,ALLSKY_SFC_SW_DWN` with `community=AG`, and requests 45 days ending about 10 days before the present to accommodate data processing lag. It analyses the most recent 30 complete days with valid rainfall and temperature, reports actual included date bounds, and never labels the result as current weather. Recent period can lag further depending on availability. Other metrics may be missing and are omitted rather than invented. The precipitation comparison is a rule-of-thumb within the observed window, **not** a deviation from historical climate averages.

The service caches recent responses in-memory for 30 minutes in each running process. This may not persist across serverless invocations. It rejects malformed coordinates, sets a 14-second upstream timeout, and returns a clear error on NASA outage. For high-traffic production deployment, add persistent shared caching and request-rate protection.

NASA Data Guide: 71 named dataset products and NASA POWER resources with plain-language descriptions. Each official link opens a targeted search of NASA's Earthdata catalog for that product, rather than claiming a fixed granule or download URL. Availability, collection version and access permissions should be checked in the catalog before research use. The guide is a curated discovery reference, not a direct integration with every product.
