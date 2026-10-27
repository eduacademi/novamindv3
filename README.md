# NovaMind

Instagram, TikTok, YouTube, X ve makalelerden kaydettiklerini tek yerde topla; yapay zekâ ile
etiketle, aralarındaki bağlantıları gör ve içerik fikrine dönüştür.

- **Ön yüz:** React 19 + Vite + Tailwind v4 (PWA, Web Share Target)
- **Sunucu:** Express (`server/app.ts`): metadata çekme, Gemini AI, abonelik, kota
- **Veri:** Firebase Auth (anonim + Google + e-posta) ve Firestore (kullanıcı başına izole)
- **Ödeme:** Shopier (TRY)

## Yerelde çalıştırma

```bash
npm install
cp .env.example .env      # en azından GEMINI_API_KEY
npm run dev               # http://localhost:3000
```

Geliştirme modunda oturum jetonu olmayan istekler tek bir "dev" kullanıcısına düşer.
Üretimdeki davranışı denemek için `STRICT_AUTH=1` verin.

## Komutlar

| Komut | Açıklama |
| --- | --- |
| `npm run dev` | Vite + API tek süreçte |
| `npm run build` | `dist/` (ön yüz) + `dist/server.cjs` (sunucu) |
| `npm start` | Üretim sunucusu (`NODE_ENV=production`) |
| `npm run lint` | TypeScript tip kontrolü |

## Yayına alma

**Render / herhangi bir Node sunucusu (önerilen):** `render.yaml` hazır. Build: `npm run build`,
start: `npm start`, health check: `/api/health`.

**Vercel:** ön yüz statik olarak `dist/`'ten, API `api/index.ts` üzerinden aynı Express uygulamasıyla
sunulur (`vercel.json` tüm `/api/*` isteklerini oraya yönlendirir).

Üretimde mutlaka tanımlanması gerekenler: `GEMINI_API_KEY`, `FIREBASE_SERVICE_ACCOUNT_KEY`,
`APP_URL`, `ADMIN_SECRET_KEY`, `SHOPIER_API_KEY`, `SHOPIER_API_SECRET`. Ayrıca
`firestore.rules` dosyasını Firebase'e deploy edin (`firebase deploy --only firestore:rules`).

Admin paneli: `https://<alan-adı>/?admin` (şifre = `ADMIN_SECRET_KEY`).

## Tarayıcı eklentisi

`extension/` klasörünü Chrome'da "Paketlenmemiş öğe yükle" ile ekleyin. Eklenti, açık sayfayı
NovaMind'ın paylaşım ekranında açar; uygulama adresini eklenti penceresindeki
"Uygulama adresi" alanından ayarlayın.

Ürün ve iş planı: [docs/SAAS_PLAN.md](docs/SAAS_PLAN.md)
