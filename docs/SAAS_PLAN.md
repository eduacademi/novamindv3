# NovaMind: SaaS planı

## 1. Dürüst değerlendirme

**Bugünkü haliyle kimse para ödemez.** Sebep fikir değil, odak: uygulama bir "her şey kutusu"
(link kaydetme, hatırlatıcı, alışveriş listesi, zihin haritası, günlük özet, sohbet, proje
alanları). Genel "bookmark + AI" pazarında Raindrop, mymind, Readwise Reader, Notion ve ücretsiz
NotebookLM var; Türkçe arayüz tek başına ödeme sebebi değil.

**Para ödenebilecek dar bir kullanım var:** Türkçe içerik üreticileri (Instagram/TikTok/YouTube).
Bu kişiler her gün onlarca reels/video kaydediyor ama kaydettikleri hiçbir şeye dönüşmüyor.
NovaMind'ın zaten sahip olduğu parçalar (Instagram/TikTok/Threads metadata çekme, "Üretici"
onboarding'i, Fikir Üretici) tam bu soruna denk geliyor. Pocket'ın kapanmasıyla (2025) "kaydet"
alışkanlığı olan kullanıcılar da yeni ev arıyor.

**Karar:** projeyi bırakma, ama ürünü daralt. Tek cümlelik vaat:

> "Kaydettiğin reels ve videoları haftalık içerik planına çeviren asistan."

Başarı ölçütü: yeni özellik eklemeden önce **10 kişinin 99 ₺/ay ödemesi**. 6–8 haftada bu
olmazsa başka projeye geçmek mantıklı.

## 2. Bu turda yapılanlar (yayına engel olan sorunlar)

| Alan | Sorun | Çözüm |
| --- | --- | --- |
| Güvenlik | Admin şifresi kodda sabitti (`maviadam123`, `admin123`) ve arayüzde yazıyordu | Yalnızca `ADMIN_SECRET_KEY` (min. 16 karakter), sabit zamanlı karşılaştırma, deneme sınırı; panel menüden kaldırıldı (`/?admin`) |
| Güvenlik | Firestore kuralı kullanıcının kendi `subscription` belgesine yazmasına izin veriyordu (kendine Premium verebiliyordu) | Kurallar koleksiyon bazında yeniden yazıldı; abonelik ve kota yalnızca sunucuda |
| Güvenlik | Eklenti kuyruğu `userId` parametresiyle herkesin kuyruğunu okuyup silmeye izin veriyordu | Kuyruk kaldırıldı; eklenti uygulamanın paylaşım ekranını açıyor |
| Güvenlik | Metadata çekici iç ağ adreslerine istek atabiliyordu (SSRF) | Sadece genel http(s) adresleri, her yönlendirmede kontrol, boyut/süre sınırı |
| Güvenlik | Oturum jetonu gönderilmiyordu: tüm kullanıcılar aynı "dev" kullanıcısıydı | Ön yüz her isteğe Firebase ID token ekliyor, sunucu doğruluyor |
| Gelir | Kullanım limitleri hiç sayılmıyordu: ücretsiz kullanıcı sınırsız AI kullanıyordu | Gün/ay bazlı kota (Firestore transaction), başarısız AI çağrısı kotadan düşmüyor, kart limiti |
| Gelir | Shopier ödemesi çalışamazdı (form GET ile açılıyordu, imza yanlıştı, webhook gövdesi okunmuyordu, yıllık ödeme 30 gün veriyordu) | HMAC imzalı form POST, doğru callback doğrulaması, tekrar eden bildirimlere karşı koruma, yıllık = 365 gün |
| Altyapı | Vercel'de sadece admin rotaları vardı: AI, metadata, abonelik canlıda 404 dönüyordu | `server/app.ts` tek uygulama; `api/index.ts` onu sunuyor |
| Altyapı | `npm start` var olmayan `dist/server.cjs` dosyasını çalıştırıyordu, `npm run build` tip hatasıyla düşüyordu | esbuild ile sunucu paketi; build temiz |
| AI | Model adları geçersiz/emekli (`gemini-1.5-flash`, `gemini-3.6-flash`) | `GEMINI_MODEL` (varsayılan `gemini-flash-latest`), istem boyutu sınırlı, JSON ayrıştırma sağlam |
| Performans | 1.39 MB tek JS paketi; her 5 sn eklenti sorgusu; her kart değişiminde tüm kartlar Neo4j'ye | Ana paket ~460 KB (firebase ayrı, ağır ekranlar tembel yükleniyor), sorgu kaldırıldı, senkron gecikmeli |
| Görsel | Koyu sayfa + bej başlık + mor/beyaz bölümler karışık; kartlarda tarih iki kez; mobilde sekmeler yoktu ve başlık taşıyordu | Tek "kağıt & mürekkep" paleti (tasarım token'ları), mobil sekme çubuğu, kart düzeltmeleri |

## 3. Yol haritası

### Faz 1: Ödeme alabilir hale gel (1–2 hafta)
- [ ] Firebase servis hesabı, Shopier hesabı ve alan adıyla canlıya çık; webhook'u Shopier panelinde tanımla
- [ ] Firebase Console'da Google ve e-posta girişini aç, `firestore.rules` deploy et
- [ ] KVKK aydınlatma metni, gizlilik politikası, mesafeli satış sözleşmesi, iptal/iade sayfası (Shopier için zorunlu)
- [ ] Hata takibi (Sentry) ve basit ürün analitiği (PostHog/Plausible): kayıt → ilk kart → ilk AI kullanımı → ödeme hunisi
- [ ] Abonelik bitişinden 3 gün önce hatırlatma e-postası (Shopier otomatik yenileme yapmadığı için)

### Faz 2: Ürünü daralt (2–4 hafta)
- [ ] Onboarding'i tek yola indir: "Instagram/TikTok linkini yapıştır → 30 sn'de 3 içerik fikri"
- [ ] Fikir Üretici'yi "Haftalık içerik planı"na çevir: kaydedilenlerden 5 hook + kısa senaryo + yayın takvimi
- [ ] Alışveriş listesi, hatırlatıcı, günlük özet gibi odağı dağıtan bölümleri gizle/kaldır
- [ ] Mobil paylaşım (PWA share target) akışını kusursuz yap: içerik üreticileri telefonda kaydeder
- [ ] Kartları ve projeleri tamamen Firestore'a taşı (şu an projeler yalnızca tarayıcıda)

### Faz 3: Büyüme (sonrası)
- [ ] 10 ödeyen kullanıcıyla görüşme; fiyatı ve paketleri verilere göre ayarla
- [ ] Ajans/ekip paketi (paylaşılan proje alanı)
- [ ] Chrome Web Store'da eklenti yayını
- [ ] Iyzico ile otomatik yenilenen abonelik

## 4. Birim ekonomisi (kaba tahmin)

Gemini Flash ile tipik bir fikir üretimi/zihin haritası isteği birkaç kuruş tutar. Pro paketin
aylık 30+30 ağır isteği + günlük etiketleme/sohbet kotası tam kullanılsa bile AI maliyeti
99 ₺'nin küçük bir kısmında kalır; asıl maliyet Shopier komisyonu ve barındırmadır. Kotalar
artık gerçekten sayıldığı için ücretsiz kullanıcılar maliyeti kontrolsüz büyütemez.
