# Campus Talks - Vercel Deployment Guide

## 🚀 Deploy to Vercel

### Step 1: Import Project to Vercel

1. Go to: https://vercel.com/new
2. Click "Import Git Repository"
3. Connect your GitHub account if not already connected
4. Select the repository: **manoalluti27/campustalks**
5. Click "Import"

### Step 2: Configure Project Settings

**Framework Preset:** Vite  
**Root Directory:** `client`  
**Build Command:** `npm run build`  
**Output Directory:** `dist`  
**Install Command:** `npm install`

### Step 3: Add Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```
VITE_API_URL=https://your-backend-url.com
```

**Note:** For now, you can use your local backend or deploy backend separately.

### Step 4: Deploy

Click "Deploy" and wait for build to complete.

---

## 🔧 Important: Backend Deployment

Your frontend is now deployed, but you need to deploy the backend separately!

### Option 1: Deploy Backend to Render.com (Recommended)

1. Go to: https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Select the repository
5. Configure:
   - **Name:** campus-talks-api
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment Variables:**
     ```
     PORT=5000
     MONGO_URI=<your-mongodb-uri>
     JWT_SECRET=<your-jwt-secret>
     ADMIN_PASSWORD=<your-admin-password>
     HASH_PEPPER=<your-hash-pepper>
     NODE_ENV=production
     ```

### Option 2: Deploy Backend to Railway.app

Similar process - connect GitHub, configure environment variables.

---

## 🔗 Update Frontend API URL

Once backend is deployed, update your frontend:

1. In Vercel Dashboard → Settings → Environment Variables
2. Update `VITE_API_URL` to your backend URL
3. Redeploy

---

## ✅ Deployment Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed (Render/Railway)
- [ ] Environment variables configured on both
- [ ] CORS updated in backend to allow Vercel domain
- [ ] API URL updated in frontend env
- [ ] Test all features on production

---

## 🐛 Troubleshooting

### 404 Error on Page Refresh
✅ **FIXED** - vercel.json added with SPA routing

### API Connection Failed
- Check backend is running
- Verify VITE_API_URL is correct
- Update CORS in server/index.js:
```javascript
const allowedOrigins = [
    'https://campustalks.vercel.app',
    'https://your-custom-domain.com'
];
```

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies in package.json
- Verify Node version compatibility

---

## 🎉 Success!

Your app should now be live at: **https://campustalks.vercel.app**

For backend deployment, the app will be fully functional!
