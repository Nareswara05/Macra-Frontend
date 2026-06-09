# Macra - Calorie Tracker & Health Assistant

Macra adalah aplikasi pemantau asupan kalori harian, pemenuhan nutrisi makro, dan pelacak aktivitas fisik terpadu. Dilengkapi dengan **MacraAI**, sebuah asisten pintar berbasis kecerdasan buatan (Meta Llama 3 via Groq) untuk mempermudah pencatatan nutrisi, analisis aktivitas olahraga, dan konsultasi kesehatan langsung.

---

## 🚀 Fitur Utama

### 📊 1. Dashboard Kesehatan Interaktif
* Perhitungan target harian personal berdasarkan data fisik pengguna (Berat Badan, Tinggi Badan, Usia, Target Diet, dan Tingkat Aktivitas).
* Visualisasi lingkaran kalori (Calorie Ring) untuk melacak asupan tersisa secara real-time.
* Pemantauan ringkas makronutrisi harian (Protein, Karbohidrat, Lemak, Serat).

### 🥗 2. Pencatatan Makanan & Nutrisi
* Pencatatan makanan yang dikonsumsi sepanjang hari.
* **MacraAI Food Analyzer**: Pengguna cukup menuliskan nama makanan, dan AI akan menganalisis porsi standar beserta kandungan gizinya secara otomatis melalui popup interaktif sebelum disimpan.

### 🏃 3. Pelacak Aktivitas Olahraga
* Pencatatan durasi dan intensitas olahraga harian.
* **MacraAI Activity Analyzer**: Cukup masukkan nama aktivitas fisik, dan AI akan mengestimasikan kalori yang terbakar serta merangkum risiko kesehatan/cedera jika aktivitas tersebut dilakukan secara berlebihan.

### 💬 4. MacraAI Chatbot
* Widget chat melayang yang dapat diakses di pojok kanan bawah semua halaman.
* Diskusi interaktif seputar tips diet, resep makanan sehat, rekomendasi olahraga, dan konsultasi kesehatan umum secara responsif.

---

## 🛠️ Stack Teknologi

* **Frontend**: Next.js 16 (App Router), React, TypeScript.
* **Styling**: Tailwind CSS v3, PostCSS, Autoprefixer (desain dark mode premium terstandarisasi).
* **HTTP Client**: Axios (dengan interceptor token JWT otomatis).
* **AI Engine**: Meta Llama 3 (`llama-3.3-70b-versatile`) via Groq API.
* **Backend API**: Java Spring Boot (berjalan di port `8080`).

---

## ⚙️ Persiapan & Instalasi

### 1. Prasyarat
Pastikan Anda memiliki:
* Node.js v18 atau versi terbaru.
* Service Backend Java Spring Boot berjalan pada port `8080`.

### 2. Kloning & Instalasi Dependensi
Jalankan perintah berikut di terminal:
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Buat berkas `.env.local` pada direktori root proyek dan masukkan konfigurasi berikut:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
GROQ_API_KEY=gsk_placeholder_meta_llama_api_key_9988776655
```
> **Catatan**: Jika `GROQ_API_KEY` tidak diatur atau masih berupa placeholder, MacraAI akan otomatis berjalan dalam **Mode Demo** (menggunakan respon simulasi yang aman agar tidak terjadi error pada UI). Segera ganti dengan kunci API asli dari Groq untuk mengaktifkan AI secara penuh.

### 4. Menjalankan Server Pengembangan
Jalankan perintah berikut untuk memulai server lokal:
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.

### 5. Membangun Bundle Produksi
Untuk melakukan build versi produksi yang dioptimalkan:
```bash
npm run build
```

---

## 🧠 Cara Kerja MacraAI

Sistem kecerdasan buatan pada aplikasi ini memanfaatkan endpoint `/api/ai` Next.js sebagai *secure gateway* ke Groq API:
* **Analisis Aktivitas & Makanan**: Menginstruksikan LLM menggunakan sistem instruksi yang ketat agar membalas dalam format JSON terstruktur (`response_format: { type: "json_object" }`). Hal ini menjamin parsing gizi dan kalori 100% konsisten.
* **Keamanan Kunci API**: Permintaan Groq diproses di sisi server (*server-side*), mencegah kunci API terekspos ke browser pengguna (*client-side*).
