# Coffee Shop Coffee Stamping App

A lightweight coffee shop loyalty tracker for managing customer stamp counts and custom coffee rewards.

## Features
- Custom shop name and brand colour
- Adjustable free coffee threshold for each shop
- Add, track, and remove customer stamps
- Award a free coffee automatically when the threshold is reached
- Customer progress indicators and free coffee totals
- Data saved in the browser with localStorage

## Run locally
Open `index.html` directly in a browser, or serve the folder with a local static server.

Example:

```bash
python3 -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## Files
- `index.html` – app structure
- `styles.css` – styling and responsive layout
- `app.js` – app logic and local persistence

## Customisation
Use the settings panel to change:
- shop name
- number of coffees required for one free coffee
- accent colour for the brand

This creates a flexible, coffee-shop-friendly loyalty system that can be used by multiple shops with different reward rules.
