# 🏗️ Athena CMS Factory
 
This directory contains the central engine and assets for the Athena CMS Factory (v10.1 Unified). It is designed to generate high-end React 19 websites using the **Lego-Bricks** methodology and **Zero-UI** skeletons.

## 🏛️ V10 Directory Structure

The factory is now 100% flattened and unified:

-   **`5-engine/`**: The core operational intelligence (Site Wizards, CLI, Generators).
-   **`2-templates/`**:
    -   `skeletons/`: Unified technical bases (MPA, SPA, WebShop).
    -   `components/legos/`: Centralized library of atomic UI bricks.
-   **`3-sitetypes/`**: The pure data registry containing 28+ industry blueprints.
-   **`6-utilities/`**: Management scripts for batch-updates, audits, and site alignment.
-   **`athena-api/`**: The backend orchestrator for the Athena Dashboard.
-   **`output/`**: Centralized storage for logs, temporary generation artifacts, and site overviews.

## 🚀 Key Workflows

### 1. Starting the Factory Environment
Use the root launcher to start all necessary services (Dashboard, Dock, API):
```bash
# From athena/ root
./athena.sh
```

### 2. Quick-Creating a Site (CLI)
You can quickly scaffold a site using the V10 CLI:
```bash
node factory/cli/quick-create.js [site-name] [site-type]
```

### 3. Site-Wide Alignment
To synchronize all generated sites with the latest V10 documentation standards:
```bash
node factory/6-utilities/regenerate-site-passports.js
```

---
*For a global architectural overview, see [athena/docs/V10_STRUCTURE.md](../docs/V10_STRUCTURE.md).*
