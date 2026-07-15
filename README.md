# Campus Connect (EF App)

PWA per connettere gli studenti di un campus a immersione linguistica, aiutandoli
a conoscere persone **fuori dalla propria cerchia**. Meccanica in stile "swipe":
scorri i profili, e quando c'è un match si apre uno di due flussi (test A/B).

## Funzionalità

- **Registrazione** multi-step: codice studente (identificativo univoco, non
  verificato — deterrente anti-fake), nome/cognome, email, PIN (4-6 cifre),
  data di nascita, nazionalità, livello d'inglese, dormitorio, fine permanenza, foto.
- **Login**: codice studente + PIN. Sessione via cookie firmato (JWT).
- **Scopri**: deck di profili con foto, età, nazionalità (bandiera), livello
  d'inglese, tempo rimasto nel campus, dormitorio, bio.
- **Match**: al like reciproco scatta il match, con **assegnazione casuale 50/50**
  di una delle due varianti:
  - **Incontro al buio** (`MEETUP`): niente chat, si propone luogo + orario nel campus.
  - **Chat** (`CHAT`): messaggistica in-app.
- **Profilo**: anteprima del proprio profilo + dati account + logout.

## Stack

- Next.js 16 (App Router) · React 19 · Tailwind CSS v4
- Prisma 7 + SQLite (driver adapter `better-sqlite3`) — in sviluppo
- Auth custom: `jose` (JWT) + `bcryptjs` (PIN), validazione con `zod`

## Avvio

```bash
npm install
npm run db:reset   # crea/azzera il DB, applica le migrazioni e semina i dormitori
npm run dev        # http://localhost:3000
```

### Dati demo (opzionale)

```bash
npx tsx prisma/demo.ts
```

Crea 6 utenti fittizi + un account di test **codice `TEST-ME`, PIN `1234`**.
Gli utenti demo mettono like all'account di test, così basta ricambiare per fare match.

## Script

| Comando | Descrizione |
| --- | --- |
| `npm run dev` | Server di sviluppo |
| `npm run db:seed` | Semina i dormitori |
| `npm run db:reset` | Azzera il DB + migrazioni + seed |
| `npx tsx prisma/demo.ts` | Popola utenti demo |

## Note per la produzione

- **Database**: SQLite va bene in sviluppo. Per il deploy (es. Vercel) migrare a
  Postgres (Neon/Supabase) cambiando il driver adapter di Prisma.
- **Foto**: in sviluppo salvate in `public/uploads`. In produzione usare uno
  storage a oggetti (S3, Supabase Storage, ecc.).
- **Chat**: attualmente in polling ogni 3s. Passare a realtime (Supabase Realtime
  / WebSocket) per la produzione.

## PWA

L'app è installabile su Home:

- `src/app/manifest.ts` → manifest servito su `/manifest.webmanifest`
- icone in `public/` (`icon-192`, `icon-512`, `icon-maskable-512`, `apple-touch-icon`),
  rigenerabili con `node scripts/gen-icons.mjs`
- service worker `public/sw.js` (fallback offline + handler push predisposto)
- `src/components/pwa.tsx` registra il SW e mostra il prompt d'installazione
  (pulsante su Android/Chrome, istruzioni "Aggiungi a Home" su iOS Safari)

> Le notifiche push sono predisposte nel service worker ma non ancora collegate
> (mancano chiavi VAPID + salvataggio subscription). L'installazione richiede HTTPS
> in produzione (in locale funziona su `localhost`).
