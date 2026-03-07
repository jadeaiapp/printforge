# PrintForge — Ürün Hazırlığı ve Eksikler

Bu belge, uygulamanın “tüm insanların kullanabileceği” bir ürün olması için **neyin tamam olduğunu** ve **neyin eksik / iyileştirilebilir** olduğunu özetler.

---

## ✅ Şu an sağlam olanlar

- **Temel tasarım akışı:** Blok ekleme, sürükle-bırak, metin düzenleme, sayfa ekleme/çoğaltma/silme, katmanlar, hizalama, gruplama.
- **Çıktı:** PDF export, sayfa PNG export, yazdırma önizleme, yazdır.
- **Çok dilli arayüz:** Türkçe / İngilizce (app + landing), tüm metinler locale’den.
- **Veri:** Yerel kaydet/yükle, JSON export/import, son projeler.
- **Canva benzeri özellikler:** Zoom (fit / seçime sığdır), cetvel, yazdırma alanı (safe area), marka + son renkler, stil kopyala/yapıştır, gölge, kısayollar (Ctrl+D, Ctrl+Z, vb.), ipuçları (?) paneli.
- **Erişilebilirlik temeli:** `aria-label`, `role`, `lang` kullanımı; viewport ve `prefers-reduced-motion` desteği.
- **Onay metinleri:** “Projeyi temizle?” ve “Katman kilitli, yine de sil?” artık i18n ile (EN/TR).

Bu haliyle **masaüstü tarayıcıda, EN veya TR kullanan biri** için uygulama kullanılabilir ve anlamlı bir “tasarım → PDF/PNG/yazdır” deneyimi sunar.

---

## ⚠️ Eksik veya sınırlı olanlar

### 1. Mobil / dokunmatik

- **Durum:** Viewport var, bazı `@media` ile panel düzeni küçük ekranda değişiyor; ancak **tuval sürükleme, pinch-zoom, dokunmatik seçim** gibi mobil UX iyileştirmeleri yok.
- **Etki:** Telefonda “herkes rahatça kullansın” hedefi için yetersiz; “mobilde sadece önizleme/export” için yeterli olabilir.
- **Öneri:** Landing’deki gibi “En iyi deneyim masaüstü/tablet” notu app içinde de (ör. ilk açılış veya küçük ekranda) gösterilebilir.

### 2. Hata mesajları ve boş durumlar

- **Durum:** PDF/PNG export hata verirse toast ile “failed” gösteriliyor; **detaylı hata metni veya “tekrar dene”** yok. JSON import hatalı dosyada “Invalid JSON” var.
- **Eksik:** Ağ hatası, storage dolu, desteklenmeyen tarayıcı gibi senaryolar için kullanıcıya net mesaj ve yönlendirme yok.
- **Öneri:** Toast’lara kısa, i18n’li hata mesajları; kritik hatalar için küçük bir “Something went wrong” + “Retry” alanı eklenebilir.

### 3. “İlk kez kullanan” yönlendirmesi

- **Durum:** Şablon seçici ilk açılışta çıkıyor; “?” ile ipuçları açılabiliyor.
- **Eksik:** Boş tuvalde “Buraya blok sürükle” gibi tek satırlık bir empty state veya çok kısa bir “Hoş geldin” adımı yok.
- **Öneri:** Tuval boşken hafif bir placeholder metin veya ilk blok eklenene kadar küçük bir ipucu gösterilebilir.

### 4. Performans ve büyük dokümanlar

- **Durum:** Sayfa/node sayısı çok artınca (ör. 20+ sayfa, yüzlerce öğe) render/undo davranışı test edilmemiş olabilir.
- **Öneri:** Çok sayfalı / çok öğeli senaryolarda test; gerekirse sayfa bazlı lazy render veya undo stack sınırı (zaten 50) dokümante edilebilir.

### 5. Tarayıcı desteği

- **Durum:** Modern tarayıcılar (Chrome, Firefox, Safari, Edge) hedefleniyor; eski IE veya çok eski mobil tarayıcılar desteklenmiyor.
- **Öneri:** README veya “Help” içinde “Chrome, Firefox, Safari, Edge (son sürümler)” yazılabilir; gerekirse basit bir “Your browser might not be fully supported” uyarısı eklenebilir.

### 6. Gizlilik ve veri

- **Durum:** Veri yalnızca cihazda (localStorage) tutuluyor; sunucuya gönderilmiyor.
- **Eksik:** Kullanıcıya “Verileriniz yalnızca cihazınızda saklanır” gibi kısa bir bilgi (footer veya ilk açılış) verilmiyor.
- **Öneri:** Footer veya Help/Tips’te tek cümlelik açıklama eklenebilir.

---

## Sonuç: “Tüm insanlar kullanabilsin” için

| Hedef kitle | Durum |
|-------------|--------|
| **Masaüstü, EN/TR, modern tarayıcı** | ✅ Uygun; tasarla → PDF/PNG/yazdır akışı tamam. |
| **Mobil kullanıcı** | ⚠️ Sınırlı; önizleme/export mümkün, tam tasarım deneyimi için masaüstü önerilir. |
| **Erişilebilirlik (ekran okuyucu, klavye)** | ⚠️ Temel var; tüm etkileşimlerin klavye ve ARIA ile tam uyumu ayrı iyileştirme gerektirir. |
| **İlk kez kullanan** | ✅ Şablon + ipuçları (?) ile başlayabilir; istenirse empty state ile güçlendirilebilir. |

**Kısa cevap:** Evet, **masaüstü odaklı ve EN/TR için** şu an “tüm insanların kullanabileceği” bir ürün sayılır: tasarım yapılır, PDF/PNG indirilir, yazdırılır. Mobil ve her tür kullanıcı için “her yerde mükemmel” deneyim ise yukarıdaki maddelerle adım adım iyileştirilebilir.
