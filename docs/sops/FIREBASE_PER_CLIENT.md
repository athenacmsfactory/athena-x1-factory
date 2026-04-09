# SOP: Firebase Configuratie per Webshop-Klant

> **Status:** Actief | **Versie:** 1.0 | **Datum:** April 2026
> **Auteur:** Athena Factory V10.1

---

## ⚠️ GOUDEN REGEL

> **Elke webshop krijgt zijn EIGEN, APART Firebase Project.**

Dit is een niet-onderhandelbare standaard in de Athena Factory. Nooit meerdere klanten samenvoegen in één Firebase project.

---

## Waarom Aparte Firebase Projecten?

### 1. 💰 Maximaal gebruik van de Gratis Tier (Spark Plan)

Firebase geeft **per project** een genereus gratis quotum:
- **Firestore:** 50.000 leesacties / dag gratis
- **Storage:** 5 GB gratis
- **Hosting:** 10 GB transfers / maand gratis

**Scenario A — Alles in 1 project (FOUT):**
```
Firebase Project "athena-central"
├── database: bakkerij-janssen     ─┐
├── database: fietsenwinkel-peeters  ├─ Delen samen de gratis limieten
└── database: kapper-de-vos        ─┘
```
Als één webshop veel bezoekers krijgt, verbruikt die het quotum van de anderen.
**Risico: Onverwachte facturen voor alle klanten.**

**Scenario B — Eén project per klant (CORRECT ✅):**
```
Firebase Project "bakkerij-janssen-shop"   → Eigen gratis quotum
Firebase Project "fietsenwinkel-peeters"   → Eigen gratis quotum
Firebase Project "kapper-de-vos-shop"      → Eigen gratis quotum
```
Elke kleine webshop blijft vrijwel altijd binnen zijn eigen gratis tier.
**Resultaat: Nagenoeg geen hosting/database kosten voor de klant.**

---

### 2. 🔒 Totale Data-Isolatie & Veiligheid

Klanten zijn wettelijk beschermd (GDPR/AVG). Klant A mag **nooit** de data van klant B zien.

- In aparte Firebase projecten is dit **fysiek onmogelijk** — het zijn compleet gescheiden systemen met eigen API-sleutels.
- De API-keys in de `.env` van elke webshop horen exclusief bij dat project.
- Een eventuele inbreuk op één project tast de andere shops **niet** aan.

---

### 3. 🤝 Professioneel Eigenaarschap & Overdraagbaarheid

Als een klant later besluit om zelfstandig te gaan of een andere developer inschakelt:

```
Firebase Console → Project Settings → Leden → 
Eigenaar wijzigen naar klant@emailadres.be
```

Het volledige project — met alle data, statistieken, en history — wordt netjes overgedragen.  
Dit is **professioneel en marktconform**. Met een multi-database aanpak in één project is dit onmogelijk zonder alle klanten te beïnvloeden.

---

### 4. 🛡️ Geen "Single Point of Failure"

Bij facturatiedispute, technisch probleem, of overschrijding bij één project:
- **Eén project oplossen:** Alle andere webshops draaien ongestoord door.
- **Alles in één project:** Een blokkering treft ALLE klanten tegelijk.

---

## Stap-voor-Stap Workflow: Nieuwe Webshop Aanmaken

### Stap 1: Firebase project aanmaken

1. Ga naar [console.firebase.google.com](https://console.firebase.google.com)
2. Klik **"Project toevoegen"**
3. Geef het een duidelijke naam: `klantnaam-shop` (bv. `bakkerij-janssen-shop`)
4. Google Analytics: optioneel (aanbevolen voor de klant)
5. Klik door en wacht tot het project aangemaakt is

### Stap 2: Firestore Database activeren

1. In het project → **Build → Firestore Database**
2. Klik **"Database aanmaken"**
3. Kies modus: **Productie-modus** (beveiligd)
4. Kies locatie: **`europe-west3`** (Frankfurt — dichtstbij voor België)
5. Bevestig

### Stap 3: Firebase App registreren

1. In het project → ⚙️ **Projectinstellingen**
2. Scroll naar **"Jouw apps"** → klik het **`</>`** web-icoon
3. Registreer de app (geen Firebase Hosting nodig)
4. Kopieer het `firebaseConfig` object:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "bakkerij-janssen-shop.firebaseapp.com",
  projectId: "bakkerij-janssen-shop",
  storageBucket: "bakkerij-janssen-shop.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### Stap 4: `.env` van de nieuwe webshop invullen

Ga naar het nieuwe site-project (bv. `athena/sites/bakkerij-janssen/`):

```bash
# .env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=bakkerij-janssen-shop.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=bakkerij-janssen-shop
VITE_FIREBASE_STORAGE_BUCKET=bakkerij-janssen-shop.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### Stap 5: Firestore Security Rules instellen

In de Firestore Console → **Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Orders: alleen lezen via server/admin, schrijven vanuit de app
    match /orders/{orderId} {
      allow create: if true; // Klant kan order plaatsen
      allow read, update, delete: if false; // Alleen via Admin Hub
    }
    // Klanten: alleen vanuit Admin Hub
    match /klanten/{klantId} {
      allow read, write: if false;
    }
  }
}
```

> **Let op:** Pas de rules aan naargelang de authenticatiestrategie van de klant.

### Stap 6: Admin Hub testen

1. Start de site lokaal: `pnpm dev`
2. Navigeer naar `http://localhost:<port>/#/admin`
3. Login met de admin code (standaard: `athena2026`)
4. Verifieer dat er verbinding is met Firestore (groene "LIVE CONNECTION" indicator)

---

## Overzicht per Sitetype

| Sitetype         | Admin Hub | Firestore | Aparte `.env` vereist |
|------------------|:---------:|:---------:|:---------------------:|
| `webshop-mollie` | ✅        | ✅        | ✅                    |
| `webshop-order`  | ✅        | ✅        | ✅                    |
| `webshop-stripe` | ✅        | ✅        | ✅                    |
| Andere types     | ❌        | Optioneel | Optioneel             |

---

## Veelgestelde Vragen

**V: Kan ik geen multi-database gebruiken binnen één project om werk te besparen?**  
A: Firebase ondersteunt dit technisch, maar het is uitdrukkelijk **niet** de standaard voor de Athena Factory. De isolatie, gratis tier per project, en overdraagbaarheid wegen zwaarder dan het gemak van één dashboard.

**V: Wat kost een Firebase project per maand voor een kleine webshop?**  
A: Voor de meeste kleine webshops (minder dan 50.000 leesacties/dag): **€0**. Het Spark-plan is gratis en ruim voldoende.

**V: Moet ik de admin code (`athena2026`) per klant aanpassen?**  
A: **Ja, sterk aanbevolen.** Pas de admin code aan in de `Admin.jsx` van het specifieke project, of zet hem in de `.env` als `VITE_ADMIN_CODE=...`. Dit is een toekomstige verbetering op de planning.

**V: Hoe beheer ik al die Firebase projecten?**  
A: Via [console.firebase.google.com](https://console.firebase.google.com) is alles overzichtelijk per project te beheren. Gebruik een naamconventie: `klantnaam-shop` of `klantnaam-YYYY`.

---

## Gerelateerde Docs

- [`docs/sops/MAINTENANCE.md`](./MAINTENANCE.md) — Onderhoud en monitoring
- [`docs/core/ARCHITECTURE.md`](../core/ARCHITECTURE.md) — Systeemarchitectuur
- [`docs/core/DEVELOPER_MANUAL.md`](../core/DEVELOPER_MANUAL.md) — Developer handleiding
- [`factory/6-utilities/rollout-admin-hub.cjs`](../../factory/6-utilities/rollout-admin-hub.cjs) — Admin Hub rollout script

---

*Athena Factory V10.1 — Standaard Operationele Procedure*
