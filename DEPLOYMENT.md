# 🚀 E-commerce Website Deployment Guide

This guide will help you deploy your Next.js e-commerce application with a Node.js backend to get feedback from others.

## 📋 Prerequisites

- [Git](https://git-scm.com/) installed
- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/) database (or use a cloud service)
- [Cloudinary](https://cloudinary.com/) account for image storage
- [Netlify](https://netlify.com/) account (for frontend)
- [Railway](https://railway.app/) or [Render](https://render.com/) account (for backend)

## 🏗️ Architecture

- **Frontend**: Next.js 15 (deployed on Netlify)
- **Backend**: Node.js + Express + Prisma (deployed on Railway/Render)
- **Database**: PostgreSQL
- **Image Storage**: Cloudinary
- **Authentication**: JWT with cookies

## 🚀 Deployment Steps

### 1. **Prepare Your Repository**

Make sure your code is pushed to a GitHub repository:

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. **Set Up Database**

#### Option A: Railway (Recommended)
1. Go to [Railway](https://railway.app/)
2. Create a new project
3. Add a PostgreSQL database
4. Copy the database URL

#### Option B: Render
1. Go to [Render](https://render.com/)
2. Create a new PostgreSQL database
3. Copy the database URL

### 3. **Set Up Cloudinary**

1. Create a [Cloudinary](https://cloudinary.com/) account
2. Get your Cloud Name, API Key, and API Secret
3. Note these credentials for later

### 4. **Deploy Backend**

#### Using Railway:
1. Connect your GitHub repository to Railway
2. Set the root directory to `server`
3. Add environment variables:
   ```
   DATABASE_URL=your_postgresql_url
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   CLIENT_URL=https://your-frontend-url.netlify.app
   ```
4. Deploy and note the backend URL

#### Using Render:
1. Create a new Web Service
2. Connect your GitHub repository
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add the same environment variables as above

### 5. **Deploy Frontend**

#### Using Netlify:
1. Go to [Netlify](https://netlify.com/)
2. Connect your GitHub repository
3. Set build settings:
   - Build command: `cd client && npm install && npm run build`
   - Publish directory: `client/.next`
   - Base directory: `client`
4. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   ```
5. Deploy

### 6. **Populate Database**

After deployment, run the database seeding:

```bash
# If using Railway CLI
railway run npm run prisma:seed

# If using Render, add this to your build script
npm run prisma:seed
```

Or manually run the seed script after deployment.

## 🔧 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://username:password@host:port/database"
JWT_SECRET="your-super-secret-jwt-key"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
CLIENT_URL="https://your-frontend-url.netlify.app"
PORT=3001
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL="https://your-backend-url.railway.app"
```

## 📊 Database Population

The deployment will automatically populate your database with:

1. **Users**:
   - Admin: `admin@gmail.com` / `admin123`
   - User: `user@example.com` / `user123`

2. **Categories**: Imported from `client/src/categoryData/newCat.json`

3. **Products**: Imported from `data/Products1.csv`

## 🔍 Testing Your Deployment

1. **Frontend**: Visit your Netlify URL
2. **Admin Panel**: Login with `admin@gmail.com` / `admin123`
3. **User Features**: Login with `user@example.com` / `user123`

## 🛠️ Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure `CLIENT_URL` is set correctly in backend
2. **Database Connection**: Verify `DATABASE_URL` is correct
3. **Image Upload**: Check Cloudinary credentials
4. **Build Failures**: Check Node.js version compatibility

### Debug Commands:

```bash
# Check backend logs
railway logs

# Check frontend build
netlify build --debug

# Test database connection
railway run npx prisma db push
```

## 📈 Performance Optimization

1. **Enable caching** in your hosting provider
2. **Use CDN** for static assets
3. **Optimize images** before upload
4. **Enable compression** on your server

## 🔒 Security Checklist

- [ ] Use strong JWT secrets
- [ ] Enable HTTPS
- [ ] Set up proper CORS
- [ ] Validate all inputs
- [ ] Use environment variables for secrets
- [ ] Regular security updates

## 📞 Support

If you encounter issues:
1. Check the logs in your hosting provider
2. Verify all environment variables are set
3. Test locally first
4. Check the troubleshooting section above

## 🎉 Success!

Once deployed, share your website URL with others for feedback. The admin panel will allow you to:
- Manage products
- Upload banner images
- Set featured products
- Manage orders
- Handle coupons

---

**Happy Deploying! 🚀** 