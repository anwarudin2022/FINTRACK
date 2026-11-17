# FINTRACK — Personal Finance Tracker

FINTRACK adalah aplikasi pencatat keuangan responsif berbasis HTML, CSS, Vanilla JavaScript, MDBootstrap CDN, Chart.js, dan localStorage.

## Fitur
- Dashboard saldo berjalan, pemasukan, pengeluaran, dan tabungan bersih.
- Grafik line chart pemasukan vs pengeluaran.
- Doughnut chart distribusi pengeluaran per kategori.
- Tambah, edit, hapus, cari, dan filter transaksi.
- Filter periode dashboard dan rentang tanggal histori.
- Kategori pemasukan/pengeluaran yang dapat ditambah dan dihapus.
- Dark mode dan light mode.
- Export CSV, backup JSON, dan restore JSON.
- Simulasi notifikasi bank/e-wallet.
- Android Notification Listener + WebView JavaScript bridge (source awal tersedia di `android/`).

## Menjalankan website
1. Ekstrak ZIP.
2. Buka `index.html` di browser modern. Untuk hasil terbaik gunakan server statis lokal atau GitHub Pages.
3. CDN memerlukan koneksi internet.
4. Semua data disimpan di localStorage browser/perangkat yang digunakan.

> Catatan: browser biasa tidak dapat membaca notifikasi aplikasi lain. Integrasi otomatis sungguhan memerlukan aplikasi Android pendamping dengan Notification Listener Service. Source Android contoh ada di folder `android/`.

## Android companion (source starter)
Folder `android/` berisi source Kotlin inti untuk NotificationListenerService, WebView Activity, JavaScript bridge, manifest, dan konfigurasi akses notifikasi. Buka folder `android/` melalui Android Studio, sinkronkan Gradle dan Android SDK 35, lalu build APK. Aset website sudah disalin ke `android/app/src/main/assets/fintrack/`.

### Alur integrasi
Android NotificationListenerService -> WebView JavaScript bridge -> `window.FintrackAndroid.onNotification(payload)` -> parser FINTRACK -> localStorage.

Payload bridge:
```javascript
{
  app: "BCA Mobile",
  title: "Transfer Berhasil",
  text: "Transfer sebesar Rp 250.000 berhasil dilakukan.",
  timestamp: 1794800000000
}
```

## Privasi dan batasan
- Akses notifikasi Android sangat sensitif. Berikan akses hanya jika pengguna memahami risikonya.
- Jangan membaca/menyimpan OTP, PIN, password, atau kredensial perbankan.
- Aplikasi ini tidak mengirim isi notifikasi ke server pihak ketiga.
- localStorage hanya tersedia pada origin/browser yang sama; membersihkan data browser dapat menghapus data. Lakukan backup JSON secara berkala.
- Parser notifikasi bersifat heuristik. Format pesan antarbank dapat berbeda; periksa transaksi otomatis dan koreksi jika diperlukan.
