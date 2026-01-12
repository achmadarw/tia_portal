# Railway Deployment Guide - TIA Portal (Frontend)

## 📋 Prerequisites

-   Railway account (sama dengan yang digunakan untuk backend)
-   GitHub repository untuk tia-portal
-   Backend sudah deploy di Railway dengan URL: `https://tiasecuritybackend-production.up.railway.app`

## 🚀 Deployment Steps

### 1. Push Code ke GitHub

Pastikan folder tia-portal sudah ada di repository GitHub (bisa di repository terpisah atau monorepo):

```powershell
cd d:\WORKSPACE\PROJECT\TIA\tia-portal
git init  # Jika belum init
git add .
git commit -m "Initial commit for tia-portal"
git remote add origin https://github.com/YOUR_USERNAME/tia_portal.git
git push -u origin main
```

**ATAU** jika dalam monorepo yang sama dengan backend, cukup commit:

```powershell
cd d:\WORKSPACE\PROJECT\TIA
git add tia-portal/
git commit -m "Add tia-portal configuration for Railway deployment"
git push
```

### 2. Buat Service Baru di Railway

1. Buka Railway dashboard: https://railway.app
2. Pilih project **brilliant-insight** (project yang sama dengan backend)
3. Klik **+ New** → **GitHub Repo**
4. Pilih repository tia-portal (atau monorepo TIA)
5. Jika monorepo, Railway akan detect multiple services

### 3. Configure Service

**Jika Monorepo:**

-   Railway akan menanyakan root directory
-   Set **Root Directory**: `tia-portal`

**Service Name:**

-   Beri nama: `tia_portal` atau `tia_frontend`

### 4. Set Environment Variables

Di Railway dashboard untuk service tia-portal, tambahkan variable:

```
NEXT_PUBLIC_API_URL=https://tiasecuritybackend-production.up.railway.app/api
```

**Cara set variable:**

1. Klik service `tia_portal`
2. Tab **Variables**
3. Klik **+ New Variable**
4. Key: `NEXT_PUBLIC_API_URL`
5. Value: `https://tiasecuritybackend-production.up.railway.app/api`
6. Klik **Add**

### 5. Deploy

Railway akan otomatis detect Next.js dan build:

-   Build command: `npm run build` (auto-detected)
-   Start command: `npm run start` (auto-detected)
-   Port: `3000` (auto-detected dari Next.js)

Deploy akan dimulai otomatis. Tunggu ~2-3 menit.

### 6. Get Public URL

Setelah deploy sukses:

1. Tab **Settings**
2. Section **Networking**
3. Klik **Generate Domain**
4. Railway akan generate URL seperti: `https://tia-portal-production.up.railway.app`

### 7. Update CORS di Backend

Update backend environment variable `CORS_ORIGIN` untuk include frontend URL:

```
CORS_ORIGIN=http://localhost:3001,http://localhost:5173,https://tia-portal-production.up.railway.app
```

**Cara update:**

1. Buka service backend di Railway
2. Tab **Variables**
3. Edit `CORS_ORIGIN`, tambahkan URL frontend
4. Backend akan auto-restart

## ✅ Verifikasi Deployment

1. Buka `https://tia-portal-production.up.railway.app`
2. Coba login dengan:
    - Email: `admin@tia.com`
    - Password: `admin123`
3. Check browser console untuk memastikan API calls ke backend sukses

## 📝 File Configuration

File yang dibuat untuk deployment:

1. **`.env.example`** - Template environment variables
2. **`.env.local`** - Local development (tidak di-commit)
3. **`railway.json`** - Railway platform configuration
4. **`.gitignore`** - Update untuk exclude `.env.local`

## 🔄 Re-deployment

Setiap kali push ke GitHub branch `main`:

```powershell
git add .
git commit -m "Update feature"
git push
```

Railway akan otomatis re-deploy tia-portal.

## 💰 Estimasi Biaya

**Railway Pro Plan ($20/bulan):**

-   2 services (backend + frontend): ~$500 credit/month
-   Frontend (Next.js): ~$5-10/month
-   Backend (Node.js + PostgreSQL): ~$10-15/month
-   Total: ~$15-25/month (masih dalam $20 plan dengan $5 credit untuk usage)

**Optimasi:**

-   Frontend bisa di-deploy ke **Vercel** (free) sebagai alternatif
-   Hanya backend di Railway

## 🌐 Alternative: Deploy Frontend ke Vercel (Free)

Jika ingin hemat, deploy frontend ke Vercel:

1. Connect GitHub repo ke Vercel
2. Set environment variable `NEXT_PUBLIC_API_URL`
3. Deploy (free untuk Next.js)
4. Vercel URL: `https://tia-portal.vercel.app`

Keuntungan:

-   ✅ Free unlimited
-   ✅ Auto-scaling
-   ✅ Global CDN
-   ✅ Perfect untuk Next.js

Kerugian:

-   ❌ Backend tetap di Railway ($10-15/month untuk backend + DB)

## 📚 Resources

-   Railway Docs: https://docs.railway.app
-   Next.js Deployment: https://nextjs.org/docs/deployment
-   Vercel Deployment: https://vercel.com/docs

## 🆘 Troubleshooting

**Build Failed:**

-   Check logs di Railway dashboard
-   Pastikan `package.json` ada di root tia-portal
-   Pastikan dependencies lengkap

**Cannot connect to API:**

-   Check `NEXT_PUBLIC_API_URL` sudah benar
-   Check CORS di backend sudah include frontend URL
-   Check browser console untuk error details

**Page not found:**

-   Pastikan Next.js build sukses
-   Check Railway logs untuk startup errors
