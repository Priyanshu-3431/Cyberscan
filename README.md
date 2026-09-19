# CyberLens — Production-ready static cybersecurity site

## Features
- Dynamic browser detection
- Current viewport dimensions
- Battery status where supported
- Visitor public IP + ISP lookup using ipapi.co
- Conservative device-brand detection
- Permission-based geolocation with live `watchPosition()` while page is active
- OpenStreetMap map embed for the current coordinates
- Local-only password strength analysis
- Mobile-first responsive UI

## Deployment
This is intentionally frontend-only. No database or backend is required.

Upload the contents of `frontend/` to GitHub Pages, Vercel, Netlify, or another HTTPS static host.

### Important
- Geolocation requires HTTPS in normal production browsers.
- IP/ISP lookup depends on the third-party `https://ipapi.co/json/` service being reachable and subject to that service's limits/policies.
- Battery information is unavailable in browsers that do not expose the Battery Status API.
- Exact device brand is intentionally shown as unavailable when the browser does not expose enough reliable information.
- Password text is never sent anywhere by this application and is not logged.
- Location is only requested after the user clicks **Allow Location**.

## Files
- `index.html`
- `style.css`
- `script.js`
