---
name: vault-manager
description: Beheer van de Athena Vault (Cold Storage) voor het veilig parkeren en terughalen van sites.
---

# Vault Manager

Deze skill zorgt voor het veilige transport van sites tussen de actieve Factory (`y/werkplaats/`) en de kluis (`../athena-vault-v8-1/`).

## Belangrijke Regels (Architectural Mandate)
1. **Vault = Cold Storage**: De Vault is bevroren. Geen `node_modules`, geen actieve servers.
2. **Factory = Workbench**: Hydratatie (`pnpm install`) en previews gebeuren alleen in de Factory.
3. **No Cross-Pollution**: Wijzig nooit bestanden direct in de Vault.

## Workflows

### 1. Site Parkeren (Naar de Vault)
Gebruik dit als een project klaar is of tijdelijk gepauzeerd wordt. De site wordt gedehydrateerd.
```bash
node factory/5-engine/vault-forklift.js --to-vault <site-naam>
```

### 2. Site Terughalen (Uit de Vault)
Gebruik dit om een site te previewen of te bewerken. De site wordt naar de Factory verplaatst en gehydrateerd.
```bash
node factory/5-engine/vault-forklift.js --from-vault <site-naam>
```

### 3. Status Controleren
Bekijk welke sites er momenteel in de Vault staan.
```bash
ls -F ../athena-vault-v8-1/sites/
```

## Script Locatie
Het hart van deze skill is `factory/5-engine/vault-forklift.js`.
