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
