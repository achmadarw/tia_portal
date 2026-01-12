# TIA Portal - Railway Deployment Quick Reference

## 🚀 Quick Deploy Steps

### Option 1: Deploy ke Railway (Bersama Backend)

1. **Push ke GitHub:**

    ```powershell
    cd d:\WORKSPACE\PROJECT\TIA
    git add tia-portal/
    git commit -m "Add tia-portal Railway config"
    git push
    ```

2. **Buat Service di Railway:**

    - Dashboard → Project "brilliant-insight" → + New → GitHub Repo
    - Pilih monorepo TIA
    - Set Root Directory: `tia-portal`

3. **Set Environment Variable:**

    ```
    NEXT_PUBLIC_API_URL=https://tiasecuritybackend-production.up.railway.app/api
    ```

4. **Update CORS Backend:**
   Tambahkan frontend URL ke `CORS_ORIGIN` di backend service

5. **Generate Public Domain:**
   Settings → Networking → Generate Domain

**Biaya:** ~$5-10/month (dalam Railway Pro $20/month)

---

### Option 2: Deploy ke Vercel (RECOMMENDED - FREE!)

1. **Push ke GitHub:**

    ```powershell
    cd d:\WORKSPACE\PROJECT\TIA\tia-portal
    git init
    git add .
    git commit -m "Initial commit"
    git remote add origin https://github.com/USERNAME/tia-portal.git
    git push -u origin main
    ```

2. **Deploy di Vercel:**

    - Buka https://vercel.com
    - Import GitHub repository
    - Framework: Next.js (auto-detected)
    - Environment Variables:
        ```
        NEXT_PUBLIC_API_URL=https://tiasecuritybackend-production.up.railway.app/api
        ```
    - Deploy

3. **Update CORS Backend:**
   Tambahkan `https://tia-portal.vercel.app` ke `CORS_ORIGIN`

**Biaya:** FREE! ✅

---

## 🔧 Environment Variables

**Development (.env.local):**

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Production (Railway/Vercel):**

```
NEXT_PUBLIC_API_URL=https://tiasecuritybackend-production.up.railway.app/api
```

---

## 📝 Backend CORS Update

Edit di Railway backend service → Variables → `CORS_ORIGIN`:

```
CORS_ORIGIN=http://localhost:3001,http://localhost:5173,https://tia-portal-production.up.railway.app
```

Atau jika di Vercel:

```
CORS_ORIGIN=http://localhost:3001,http://localhost:5173,https://tia-portal.vercel.app
```

---

## ✅ Test Deployment

1. Buka URL production
2. Login: `admin@tia.com` / `admin123`
3. Check console browser (F12) - tidak boleh ada CORS error
4. Test fitur-fitur utama

---

## 💡 Recommendation

**Best Setup untuk Demo:**

-   ✅ **Backend**: Railway ($10-15/month)
-   ✅ **Frontend**: Vercel (FREE)
-   ✅ **Total**: ~$10-15/month

**Keuntungan:**

-   Frontend di Vercel: Global CDN, unlimited bandwidth, auto-scaling
-   Backend di Railway: Database managed, easy deployment
-   Cost-effective untuk demo/production kecil
