# Dokumentasi API Firebase Realtime Database (RTDB) & Express Server

Proyek ini adalah aplikasi Node.js dengan Express yang menyediakan antarmuka Dashboard HTML serta REST API lengkap untuk berinteraksi dengan **Firebase Realtime Database (RTDB)**.

---

## 1. Konfigurasi Lingkungan (`.env`)

Pastikan file `.env` di root direktori proyek memiliki variabel `RTDB_URL` atau `FIREBASE_DATABASE_URL`:

```env
PORT=3000
RTDB_URL=https://nama-project-default-rtdb.firebaseio.com
```

---

## 2. Daftar Endpoint API

Semua endpoint API RTDB tersedia melalui prefix `/api/rtdb`. Parameter `:path(*)` bersifat opsional, sehingga Anda dapat mengakses root database maupun node bersarang (nested child).

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| **GET** | `/` | Dashboard HTML interaktif untuk melihat data RTDB secara real-time. |
| **GET** | `/api/data` | Endpoint JSON bawaan untuk mengambil seluruh data root. |
| **GET** | `/api/rtdb` / `/api/rtdb/:path` | Mengambil data dari root atau path tertentu. |
| **POST** | `/api/rtdb` / `/api/rtdb/:path` | Menambahkan data baru dengan **Auto-Generated ID** (Firebase `push()`). |
| **PUT** | `/api/rtdb` / `/api/rtdb/:path` | Menimpa atau membuat data baru pada path tertentu (Firebase `set()`). |
| **PATCH** | `/api/rtdb` / `/api/rtdb/:path` | Memperbarui sebagian data (merge) pada path tertentu (Firebase `update()`). |
| **DELETE** | `/api/rtdb` / `/api/rtdb/:path` | Menghapus data pada path tertentu (Firebase `remove()`). |

---

## 3. Cara Penggunaan & Contoh Kode

### A. Menjalankan Server
```bash
npm start
```
Server akan berjalan di `http://localhost:3000`.

---

### B. Menggunakan `curl`

1. **Mengambil Data (GET)**
   ```bash
   # Ambil semua data root
   curl http://localhost:3000/api/rtdb

   # Ambil data pada path tertentu (misal: /users)
   curl http://localhost:3000/api/rtdb/users
   ```

2. **Menambah Data dengan Auto-ID (POST)**
   ```bash
   curl -X POST http://localhost:3000/api/rtdb/users \
     -H "Content-Type: application/json" \
     -d '{"nama": "Budi Santoso", "email": "budi@example.com"}'
   ```

3. **Menimpa Data (PUT)**
   ```bash
   curl -X PUT http://localhost:3000/api/rtdb/config \
     -H "Content-Type: application/json" \
     -d '{"maintenance": false, "version": "1.0.0"}'
   ```

4. **Memperbarui Sebagian Data (PATCH)**
   ```bash
   curl -X PATCH http://localhost:3000/api/rtdb/users/-Oa1b2c3d4e \
     -H "Content-Type: application/json" \
     -d '{"email": "budi.baru@example.com"}'
   ```

5. **Menghapus Data (DELETE)**
   ```bash
   curl -X DELETE http://localhost:3000/api/rtdb/users/-Oa1b2c3d4e
   ```

---

### C. Penggunaan di Frontend / Client (JavaScript Fetch)

```javascript
// 1. Mengambil data (GET)
async function getData(path = '') {
  const response = await fetch(`http://localhost:3000/api/rtdb/${path}`);
  const result = await response.json();
  return result.data;
}

// 2. Menambah data baru (POST)
async function postData(path, payload) {
  const response = await fetch(`http://localhost:3000/api/rtdb/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return await response.json();
}

// Contoh pemanggilan
getData('users').then(users => console.log('Users:', users));
```
