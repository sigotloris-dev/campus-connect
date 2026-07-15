# Deploy — Campus Connect (Vercel + Neon + Vercel Blob)

Guida per pubblicare l'app online. Legenda: 👤 = fai tu · 🤖 = lo fa Claude.

## 0. Account gratuiti da creare 👤

- **GitHub** — https://github.com (per ospitare il codice)
- **Neon** — https://neon.tech (database Postgres)
- **Vercel** — https://vercel.com (hosting; accedi con GitHub)

---

## 1. Database Neon 👤 → poi 🤖

1. Su Neon: **New Project** (regione vicina, es. Europe/Frankfurt).
2. Apri **Connect** / **Connection Details** e copia **due** stringhe:
   - **Pooled** (l'host contiene `-pooler`) → sarà `DATABASE_URL`
   - **Direct** (senza `-pooler`) → sarà `DIRECT_URL`
3. Incollale a Claude (o nel file `.env` locale, campi `DATABASE_URL` e `DIRECT_URL`).

Poi 🤖 crea la prima migrazione e semina i dormitori:

```bash
npx prisma migrate dev --name init   # crea le tabelle su Neon
npm run db:seed                       # inserisce i 7 dormitori
```

---

## 2. Codice su GitHub 👤/🤖

Dalla cartella `ef-app`:

```bash
git add -A
git commit -m "Deploy setup: Postgres, Vercel Blob, PWA"
# crea un repo vuoto su github.com, poi:
git remote add origin https://github.com/<tuo-utente>/campus-connect.git
git push -u origin main
```

---

## 3. Vercel 👤

1. **Add New → Project** e importa il repo GitHub.
2. **Root Directory**: lascia la radice (il progetto Next è già la root del repo).
3. **Storage → Blob → Create**: crea uno store Blob e **collegalo al progetto**
   (Vercel imposta `BLOB_READ_WRITE_TOKEN` da solo).
4. **Settings → Environment Variables**: aggiungi le variabili qui sotto.
5. **Deploy**.

### Variabili d'ambiente su Vercel

| Nome | Valore |
| --- | --- |
| `DATABASE_URL` | stringa **pooled** di Neon |
| `DIRECT_URL` | stringa **direct** di Neon |
| `AUTH_SECRET` | genera: `openssl rand -hex 32` |
| `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` | genera: `openssl rand -base64 32` |
| `BLOB_READ_WRITE_TOKEN` | impostata automaticamente collegando lo store Blob |

> I valori di `AUTH_SECRET` e `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` sono già nel tuo
> `.env` locale: puoi riusare gli stessi in produzione.

---

## 4. Migrazioni in produzione 🤖

Il database Neon è lo stesso per locale e produzione, quindi le tabelle create al
punto 1 sono già online. Per le modifiche future allo schema:

```bash
npx prisma migrate deploy   # applica le migrazioni al DB Neon
```

---

## 5. Dominio (facoltativo) 👤

In **Vercel → Settings → Domains** puoi collegare un dominio tuo (es. `campusconnect.app`).
L'HTTPS è automatico — necessario perché la PWA sia installabile.

---

## Note

- **Foto**: in produzione vanno su Vercel Blob; in locale, senza `BLOB_READ_WRITE_TOKEN`,
  restano in `public/uploads` (non versionato).
- **Sicurezza**: dopo il primo setup, rigenera in Neon la password del DB se l'hai
  condivisa in chat.
- **Utenti demo**: `npx tsx prisma/demo.ts` crea account di test (`TEST-ME` / `1234`).
  Non eseguirlo sul DB di produzione se non vuoi dati finti.
