# Installasjon og konfigurasjon

Dette dokumentet beskriver alle kommandoene du trenger for lokal kjøring, konfigurasjon og publisering til GitHub Pages.

## 1. Klon repoet

```powershell
git clone https://github.com/vjanrikard/nebius_tracker.git
cd nebius_tracker
```

Hvis du allerede står i ytterste mappe med en nestet git-repo, gå inn i den faktiske repoen:

```powershell
cd .\nebius_tracker
```

## 2. Opprett Python-miljo

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## 3. Konfigurer backend

Backend-en leser CORS-origins fra miljo-variabelen `NEBIUS_ALLOWED_ORIGINS`.

Lokal standard fungerer uten ekstra konfigurasjon for `localhost`, men hvis du vil eksplisitt sette origins kan du kjore:

```powershell
$env:NEBIUS_ALLOWED_ORIGINS="http://127.0.0.1:5500,http://localhost:5500,http://127.0.0.1:4173,http://localhost:4173,https://vjanrikard.github.io"
```

Start backend:

```powershell
uvicorn backend.main:app --reload
```

Test backend lokalt i en ny terminal:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/health
Invoke-WebRequest http://127.0.0.1:8000/api/nbis | Select-Object -ExpandProperty StatusCode
Invoke-RestMethod http://127.0.0.1:8000/api/events
```

## 4. Konfigurer frontend

Frontend-en leser API-base fra `public/config.js`.

Standardinnholdet er:

```javascript
window.NEBIUS_CONFIG = {
  API_BASE: "http://127.0.0.1:8000",
};
```

Hvis du skal bruke en ekstern backend i produksjon, oppdater filen manuelt til riktig URL. Eksempel:

```javascript
window.NEBIUS_CONFIG = {
  API_BASE: "https://din-backend.example.com",
};
```

## 5. Bygg GitHub Pages-filer lokalt

Bygg den statiske pakken:

```powershell
./scripts/build-pages.ps1
```

Forhaandsvis den bygde siden lokalt fra `dist/`:

```powershell
python -m http.server 4173 --directory dist
```

Deretter aapner du denne adressen i nettleseren:

```text
http://127.0.0.1:4173
```

## 6. Publiser til GitHub Pages

Workflowen i `.github/workflows/deploy-pages.yml` publiserer automatisk fra `main`.

Kjor disse kommandoene for aa publisere endringene:

```powershell
git add .
git commit -m "Finish Nebius Tracker and add Pages deployment"
git push origin main
```

Etter push vil GitHub Actions bygge `dist/` og deploye til GitHub Pages.

## 7. GitHub-konfigurasjon som maa vaere riktig

Ingen lokale kommandoer er nodvendige utover `git push`, men disse repo-innstillingene maa vaere riktige i GitHub:

- GitHub Actions maa vaere aktivert for repoet.
- Pages maa bruke GitHub Actions som source.
- Hvis backend kjores eksternt, maa backend-URL-en i `public/config.js` peke til riktig host.
- Hvis backend bruker streng CORS, maa `https://vjanrikard.github.io` vaere tillatt origin.

## 8. Anbefalt lokal arbeidsflyt

Terminal 1:

```powershell
.\.venv\Scripts\Activate.ps1
uvicorn backend.main:app --reload
```

Terminal 2:

```powershell
./scripts/build-pages.ps1
python -m http.server 4173 --directory dist
```

Hvis du endrer frontend-filer, bygg paanytt:

```powershell
./scripts/build-pages.ps1
```
