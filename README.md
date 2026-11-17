# NASA Space Explorer

Student project by Tyrone Roundtree Jr. Plain HTML, CSS, and JavaScript; no build dependencies.

Open index.html or serve this folder with `python3 -m http.server 8000`.

Choose exactly nine consecutive days (end date = start date + eight days). The app requests live APOD data from NASA's current WordPress APOD endpoint, which does not require an API key. NASA migrated APOD in September 2026; the old planetary/apod endpoint returned placeholder logos during testing. The app uses hdurl for photos and the original NASA post for video links, and converts HTML metadata to plain text.

Features: nine-item live gallery; full-image dialog with explanation; close button, Escape and outside click; video links; random fact on load; hover zoom; mobile layout; validation, loading, network errors and timeout handling.

## Publish with GitHub Pages
Published through GitHub Pages from the main branch, root directory.

## Verification status
JavaScript syntax checked locally. Live API and browser checks are recorded in the project worksheet. Suggested checks: nine results for April 12–20, 2025; image details; a video entry; Escape/outside close; invalid date ranges; loading/error cleanup; phone and desktop widths.

References: https://api.nasa.gov/ ; https://github.com/nasa/apod-api ; https://nasa.github.io/nasawds-site/components/colors/


## LevelUp: Progressive Web App
- `manifest.json` sets a repository-relative start URL and scope, standalone display, theme colors, and 192/512 px icons.
- `sw.js` caches the app shell first and requests NASA data network-first, falling back to saved responses. API storage is capped at 90 dates and image storage at 30 requests. Images must have been viewed and cached before they work offline.
- `pwa.js` provides a custom install button, Safari home-screen instructions, a visible offline indicator, and a user-triggered notification permission request with a local test notification. This does not implement remote push or scheduled alerts.
- The last successfully loaded date range is remembered so reopening offline can restore saved discoveries.
- No external font dependency is required for the offline app shell.

### Phone demo still required
Open the deployed app online and load a nine-day range. Install through the app's Install button (Android/Chrome) or Safari > Share > Add to Home Screen (iPhone). Launch its home-screen icon, verify there is no address bar, and record 30 seconds showing the gallery and a details dialog. Optionally show previously loaded entries in airplane mode. Upload the recording and put its shareable link in the LevelUp document.

### PWA validation
JavaScript syntax checks passed. Automated service-worker behavior checks passed for shell caching, network-first NASA requests, cached offline responses, uncached offline errors, server-error fallback, and cleanup limited to this app's caches. Physical phone installation and recording must be verified by the student.

Implementation references: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers ; https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeinstallprompt_event ; https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API/Using_the_Notifications_API
