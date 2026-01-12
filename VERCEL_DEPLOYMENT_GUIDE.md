# Deploy TIA Portal ke Vercel - Step by Step

## 🎯 Mengapa Vercel?

✅ **100% GRATIS** untuk Next.js projects  
✅ Auto-scaling & Global CDN  
✅ Instant deployment dari GitHub  
✅ Perfect untuk Next.js (dibuat oleh creator Next.js)  
✅ Unlimited bandwidth & deployments

---

## 📋 Prerequisites

-   [x] GitHub repository: `https://github.com/achmadarw/tia_portal.git` ✅
-   [x] Backend Railway URL: `https://tiasecuritybackend-production.up.railway.app` ✅
-   [ ] Akun Vercel (buat gratis di vercel.com)

---

## 🚀 Step-by-Step Deployment

### Step 1: Login ke Vercel

1. Buka https://vercel.com
2. Klik **Sign Up** (atau **Login** jika sudah punya akun)
3. Pilih **Continue with GitHub**
4. Authorize Vercel untuk akses GitHub repository

### Step 2: Import Project

1. Klik **Add New...** → **Project**
2. Pilih **Import Git Repository**
3. Cari repository: `achmadarw/tia_portal`
4. Klik **Import**

### Step 3: Configure Project

**Framework Preset:**

-   Vercel akan auto-detect: **Next.js** ✅
-   Biarkan default settings

**Root Directory:**

-   Biarkan default (root) jika tia-portal di root repo
-   ATAU set `.` jika sudah benar

**Build and Output Settings:**

-   Build Command: `next build` (auto-detected) ✅
-   Output Directory: `.next` (auto-detected) ✅
-   Install Command: `npm install` (auto-detected) ✅

### Step 4: Environment Variables (PENTING!)

Klik **Environment Variables** section:

**Add Variable:**

```
Name:  NEXT_PUBLIC_API_URL
Value: https://tiasecuritybackend-production.up.railway.app/api
```

**Environments:**

-   ☑ Production
-   ☑ Preview
-   ☑ Development

Klik **Add**

### Step 5: Deploy!

1. Klik **Deploy** button
2. Tunggu ~1-2 menit (build process)
3. 🎉 Deployment sukses!

---

## 🌐 Akses Production URL

Setelah deploy sukses, Vercel akan generate URL:

```
https://tia-portal.vercel.app
```

atau

```
https://tia-portal-{random}.vercel.app
```

**Custom Domain (Optional):**

-   Settings → Domains → Add domain kamu sendiri

---

## 🔧 Update Backend CORS

**PENTING:** Backend harus allow requests dari Vercel URL!

### Via Railway Dashboard:

1. Buka Railway dashboard: https://railway.app
2. Project **brilliant-insight**
3. Service **tia_security_backend**
4. Tab **Variables**
5. Edit variable `CORS_ORIGIN`

**Update value menjadi:**

```
http://localhost:3001,http://localhost:5173,https://tia-portal.vercel.app
```

_Ganti `tia-portal.vercel.app` dengan URL actual dari Vercel_

6. Backend akan auto-restart (~30 detik)

---

## ✅ Test Deployment

1. **Open URL:** https://tia-portal.vercel.app
2. **Login:**
    - Email: `admin@tia.com`
    - Password: `admin123`
3. **Check Browser Console (F12):**
    - Tidak boleh ada CORS errors
    - API calls harus sukses (status 200)
4. **Test Features:**
    - Dashboard
    - User management
    - Attendance reports
    - Roster management

---

## 🔄 Re-deployment (Auto!)

Setiap push ke GitHub main branch:

```powershell
cd D:\WORKSPACE\PROJECT\TIA\tia-portal
git add .
git commit -m "Update feature X"
git push
```

Vercel akan **otomatis re-deploy** dalam ~1 menit! ✨

---

## 🎨 Vercel Features (FREE!)

✅ Automatic HTTPS/SSL  
✅ Global CDN (300+ locations)  
✅ Instant cache invalidation  
✅ Preview deployments (setiap PR)  
✅ Real-time logs & analytics  
✅ 100GB bandwidth/month (free tier)  
✅ Unlimited deploys

---

## 📊 Deployment Dashboard

Vercel dashboard menampilkan:

-   **Deployments:** History semua deployments
-   **Analytics:** Page views, top pages, performance
-   **Logs:** Real-time logs untuk debugging
-   **Domains:** Manage custom domains

---

## 🆘 Troubleshooting

### Build Failed

**Error:** `Module not found` atau dependency error

**Fix:**

```powershell
cd D:\WORKSPACE\PROJECT\TIA\tia-portal
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

### CORS Error

**Error:** Browser console shows CORS blocked

**Fix:**

-   Check `CORS_ORIGIN` di Railway backend
-   Pastikan include URL Vercel
-   Restart backend service

### API Connection Failed

**Error:** Cannot connect to backend

**Fix:**

-   Check environment variable `NEXT_PUBLIC_API_URL`
-   Pastikan backend Railway running
-   Test backend health: `https://tiasecuritybackend-production.up.railway.app/health`

### Blank Page / 404

**Error:** Page shows blank or 404

**Fix:**

-   Check Vercel build logs
-   Pastikan Next.js build sukses
-   Check routing di `src/app` atau `src/pages`

---

## 💡 Tips & Best Practices

1. **Preview Deployments:**

    - Setiap PR otomatis dapat preview URL
    - Test fitur baru sebelum merge ke main

2. **Environment Variables:**

    - Gunakan Vercel env vars untuk production
    - `.env.local` untuk development
    - Jangan commit sensitive data

3. **Analytics:**

    - Enable Vercel Analytics untuk monitoring
    - Track real user metrics (free!)

4. **Performance:**
    - Vercel auto-optimize images (Next.js Image)
    - Auto-minify & compress assets
    - Edge caching untuk response cepat

---

## 📞 Support

**Vercel Docs:** https://vercel.com/docs  
**Next.js Docs:** https://nextjs.org/docs  
**Railway Docs:** https://docs.railway.app

---

## ✨ Summary

```
Frontend (tia-portal):  Vercel       FREE!
Backend (tia-backend):  Railway      ~$10-15/month
Database (PostgreSQL):  Railway      (included)
---------------------------------------------------
TOTAL COST:                          ~$10-15/month ✅
```

**Perfect untuk:**

-   ✅ Demo projects
-   ✅ Small production apps
-   ✅ MVP/prototype
-   ✅ Personal projects

Selamat! 🎉 TIA Portal sekarang live di internet!
