# 🚀 Quick Deployment Checklist

## ✅ Pre-Deployment

- [ ] Code is pushed to GitHub
- [ ] All environment variables are ready
- [ ] Database credentials are available
- [ ] Cloudinary account is set up

## 🌐 Backend Deployment (Railway/Render)

### Environment Variables Needed:
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLIENT_URL=https://your-frontend-url.netlify.app
```

### After Backend Deploy:
- [ ] Backend URL is working
- [ ] Run database setup: `npm run deploy:setup`
- [ ] Test API endpoints

## 🎨 Frontend Deployment (Netlify)

### Build Settings:
- Build command: `cd client && npm install && npm run build`
- Publish directory: `client/.next`
- Base directory: `client`

### Environment Variables:
```
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```

### After Frontend Deploy:
- [ ] Frontend loads correctly
- [ ] API calls work
- [ ] Images load properly

## 🗄️ Database Population

The seed script will automatically create:
- [ ] Admin user: `admin@gmail.com` / `admin123`
- [ ] Regular user: `user@example.com` / `user123`
- [ ] Categories from `newCat.json`
- [ ] Products from `Products1.csv`

## 🔍 Testing

- [ ] Homepage loads
- [ ] User registration/login works
- [ ] Product browsing works
- [ ] Admin panel accessible
- [ ] Image uploads work
- [ ] Cart functionality works
- [ ] Checkout process works

## 📱 Share Your Website

Once everything is working:
1. Share the frontend URL with others
2. Provide admin credentials for testing
3. Collect feedback and iterate!

---

**🎉 You're ready to deploy!** 