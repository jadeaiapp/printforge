# PrintForge — Canva ve Ötesi Yol Haritası

Bu belge, uygulamayı Canva’ya daha çok yaklaştırmak veya üzerine çıkarmak için yapılabilecek geliştirmeleri listeler.

---

## ✅ Az önce eklenenler

- **Ctrl+D / Cmd+D** — Seçili öğeleri kopyala (Canva’daki gibi)
- **Kısayol paneli** — Üst bardaki ⌘ butonu ile Undo, Redo, Duplicate, Delete, Group, Ungroup, Pan, Escape listesi

---

## Yüksek etki, nispeten kolay

| Özellik | Açıklama | Canva karşılığı |
|--------|----------|------------------|
| **Marka renkleri (Brand kit)** | Modelde `brandSwatches` var; Theme veya ayrı panelde göster, “Bu rengi uygula” ile metin/şekil rengi seçilebilsin | Brand kit / marka renkleri |
| **Sayfa sıralama (sürükle-bırak)** | Alt şeritte sayfa thumbnail’lerini sürükleyerek sıra değiştirme | Sayfa sırası |
| **Yakınlaştır: Seçime fit** | Zoom menüsüne “Fit to selection” ekle; seçili öğe görünür olsun | Zoom to selection |
| **Resize’da oran kilidi** | Resim/şekil boyutlandırırken Shift basılıysa en-boy oranı kilitlensin | Lock aspect ratio |
| **Son kullanılan renkler** | Renk seçicide son 5–6 kullanılan rengi göster | Recent colors |
| **Sayfa dışına export (PNG/JPEG)** | “Export page as image” ile tek sayfayı PNG/JPEG indirme | Download as image |

---

## Orta etki, orta iş

| Özellik | Açıklama | Canva karşılığı |
|--------|----------|------------------|
| **Ruler / cetvel** | Tuvalin sol ve üstünde mm cetvel; isteğe bağlı göster/gizle | Rulers |
| **Yazdırma kenar boşluğu** | Sayfada “safe area” / margin overlay (baskıda kesilmemesi için) | Print bleed / margin |
| **Stil kopyala (Format painter)** | Bir öğenin stilini kopyalayıp başka öğeye uygulama | Copy style |
| **Daha fazla font** | Google Fonts veya font listesi; font ailesi seçimi | Font library |
| **Öğe gölgesi (shadow)** | Modelde `boxShadow`; Inspector’da gölge aç/kapa, blur, offset | Effects / shadow |
| **İlk açılış ipuçları** | İlk kez açan kullanıcıya “Blokları sürükle”, “Çift tıkla metin düzenle” gibi kısa tooltip’ler | Onboarding |

---

## İleri seviye / uzun vadeli

| Özellik | Açıklama | Canva karşılığı |
|--------|----------|------------------|
| **Eğik metin (curved text)** | Metni yay üzerinde veya eğri path’te gösterme | Text on path |
| **Yorumlar / paylaşım** | Sayfa/öğe bazlı yorum, link ile paylaşım (backend gerekir) | Comments / Share |
| **Versiyon geçmişi** | Proje için “önceki sürümlere dön” (local veya bulut) | Version history |
| **Mobil / dokunmatik** | Touch drag, pinch-zoom, mobilde kullanılabilir layout | Mobile app |
| **Özel sayfa boyutu** | A4/A5 dışında Letter, özel mm cinsinden boyut | Custom size |
| **Çoklu sayfa export (görsel)** | “Tüm sayfaları PNG olarak ZIP’le indir” | Bulk export |

---

## Canva’da olup PrintForge’da (henüz) olmayanlar

- **Animasyon** — Sayfa/öğe animasyonu (sunum tarzı)
- **Video / ses** — Sayfaya video veya ses embed
- **Takım / kurumsal** — Ekip, marka kiti, şablon kütüphanesi paylaşımı
- **Stok görsel/müzik** — Entegre stok fotoğraf/müzik arama

PrintForge baskı ve printable odaklı olduğu için animasyon/video/stok öncelik düşük tutulabilir; istersen “Export as image” ve “Brand colors” ile başlamak en hızlı kazanım olur.

---

## Önerilen sıra (kısa vade)

1. **Brand renkleri** — Theme’de veya küçük bir “Renkler” panelinde `brandSwatches` göster, tıklanınca seçili öğenin rengi (metin/şekil) o rengi alsın.
2. **Sayfa sıralama** — `#pages-list` içindeki butonları sürüklenebilir yap; bırakıldığında `doc.pages` sırasını güncelle.
3. **Zoom to selection** — Zoom dropdown’a “Fit selection” ekle; seçim varken o bölgeye zoom/pan ayarla.

Bu üçü hem Canva hissini güçlendirir hem de günlük kullanımda işe yarar.
