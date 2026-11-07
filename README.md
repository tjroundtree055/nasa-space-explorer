# NASA Space Explorer

Student project by Tyrone Roundtree Jr. Plain HTML, CSS, and JavaScript; no build dependencies.

Open index.html or serve this folder with `python3 -m http.server 8000`.

Choose exactly nine consecutive days (end date = start date + eight days). The app requests live APOD data using NASA's public DEMO_KEY. This key has shared rate limits; failures are displayed clearly. For heavier use, replace DEMO_KEY in script.js with your own NASA API key.

Features: nine-item live gallery; full-image dialog with explanation; close button, Escape and outside click; video links; random fact on load; hover zoom; mobile layout; validation, loading, network errors and timeout handling.

## Publish with GitHub Pages
Create a public repository named nasa-space-explorer, upload these files to its main branch, and choose Settings → Pages → Deploy from a branch → main / (root). Copy the actual published URL into the project worksheet once deployment succeeds.

## Verification status
JavaScript syntax checked locally. Live API and browser interactions still need verification after publishing. Suggested checks: nine results for April 12–20, 2025; image details; a video entry; Escape/outside close; invalid date ranges; loading/error cleanup; phone and desktop widths.

References: https://api.nasa.gov/ ; https://github.com/nasa/apod-api ; https://nasa.github.io/nasawds-site/components/colors/
