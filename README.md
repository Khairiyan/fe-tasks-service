# Kanggo FE — Task Management

Aplikasi frontend manajemen tugas (task management) dengan autentikasi, dibangun dengan [Next.js](https://nextjs.org) (App Router), React 19, Tailwind CSS v4, dan TanStack React Query.

## Fitur

- **Autentikasi** — registrasi & login (JWT disimpan di `localStorage`), dengan auto-logout saat token kedaluwarsa (HTTP 401).
- **Dashboard terproteksi** — hanya bisa diakses setelah login (lihat `components/ProtectedRoute.tsx`).
- **CRUD tugas** — buat, lihat, ubah, dan hapus tugas lewat modal form (`components/TaskFormModal.tsx`).
- **Pagination, filter status, & pencarian** pada daftar tugas.
- **Data fetching & caching** dengan TanStack React Query.

## Teknologi

- Next.js 16 (App Router) + React 19
- Tailwind CSS v4
- TanStack React Query v5
- Vitest + Testing Library untuk pengujian
- Docker / Docker Compose untuk deployment

## Memulai

Install dependency lalu jalankan dev server:

```bash
npm install
npm run dev
```

Aplikasi berjalan di [http://localhost:3001](http://localhost:3001).

## Konfigurasi Environment

Buat file `.env.local` di root proyek:

```bash
# Base URL backend REST API (tanpa trailing slash).
# Default: http://localhost:3001/api
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

Aplikasi memanggil backend pada endpoint:

- `POST /auth/register`, `POST /auth/login`
- `GET /tasks`, `POST /tasks`, `PUT /tasks/:id`, `DELETE /tasks/:id`

## Skrip

| Perintah        | Keterangan                          |
| --------------- | ----------------------------------- |
| `npm run dev`   | Jalankan dev server (port 3001)     |
| `npm run build` | Build untuk produksi                |
| `npm run start` | Jalankan hasil build produksi       |
| `npm run lint`  | Jalankan ESLint                     |
| `npm run test`  | Jalankan unit test dengan Vitest    |

## Pengujian

```bash
npm run test
```

Konfigurasi pengujian ada di `vitest.config.ts` dan `vitest.setup.ts`.

## Docker

Build & jalankan dengan Docker Compose:

```bash
docker compose up --build
```

Frontend dapat diakses di [http://localhost:3002](http://localhost:3002) (port host `3002` dipetakan ke port container `3001`).

Variabel `NEXT_PUBLIC_*` di-_bake_ saat build time, jadi atur `NEXT_PUBLIC_API_BASE_URL` sebelum build jika backend tidak berada di default.

## Struktur Proyek

```
app/
  login/          Halaman login
  register/       Halaman registrasi
  dashboard/      Dashboard terproteksi (daftar & kelola tugas)
components/
  ProtectedRoute.tsx   Guard rute terproteksi
  TaskFormModal.tsx    Modal create/edit tugas
  ui.tsx               Komponen UI dasar
lib/
  api.ts          Fetch wrapper + manajemen token
  auth-api.ts     Endpoint autentikasi
  tasks-api.ts    Endpoint tugas
  auth-context.tsx     Context autentikasi
  providers.tsx        Provider React Query
  types.ts             Tipe bersama
```
