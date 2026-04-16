# Lesson Learned: Athena Dock Handshake & Script Safety

## Context
When a site is opened in the Athena Dock (iframe), it must actively signal `'SITE_READY'` to the parent window. If this handshake fails, all styling controls and section detection will be disabled.

## Issues Identified & Fixed

### 1. Missing Script Link in Master Template
**Problem:** The `dock-connector.js` script was present in the `public/` directory but not linked in `index.html`.
**Lesson:** Always verify that the master template (`athena/factory/2-templates/config/index.html`) contains the following tag:
```html
<script src="./dock-connector.js"></script>
```
**Why:** Without this, the site never initializes the connector, leaving the Dock in a perpetual "Connecting..." state.

### 2. Relative Path Necessity
**Problem:** Using an absolute path like `/dock-connector.js` fails when the site is served in a subdirectory (e.g., `http://localhost:3034/my-site/`).
**Lesson:** Always use relative paths `./` for scripts in the `public` folder to ensure compatibility across different deployment environments and ports.

### 3. "Public" Script Safety (Vite vs Plain JS)
**Problem:** `dock-connector.js` (located in `public/`) used `import.meta.env.BASE_URL`.
**Lesson:** Files in the `public/` folder are served as-is and are NOT processed by Vite. Using `import.meta` in a plain `<script>` tag causes a silent crash in the browser.
**Solution:** Use standard native JS for base path detection:
```javascript
const baseUrl = window.location.pathname.split('/').slice(0, -1).join('/') || '/';
```

### 4. React State Race Conditions
**Problem:** Calling `athenaScan()` from `main.jsx` (before render) or from an async save callback could happen when the DOM is not yet populated or when the Dock state is null.
**Lesson:** 
- In `DockFrame.jsx`, always include null-checks in state update callbacks: `setSiteStructure(prev => prev ? { ...prev, data: ... } : prev)`.
- In `dock-connector.js`, ensure `scanSections()` is resilient and can be triggered multiple times as the React app mounts.

## Checklist for Future Sitetypes
- [ ] `index.html` template includes `./dock-connector.js`.
- [ ] Components use `data-dock-section` and `data-dock-bind` attributes.
- [ ] No Vite-specific syntax in scripts located in the `public/` folder.
