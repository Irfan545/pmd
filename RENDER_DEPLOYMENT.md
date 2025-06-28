# 🚀 Render Deployment Guide

## Prerequisites
- Render account
- GitHub repository with your code
- Database URL (PostgreSQL)
- Environment variables ready

## Step 1: Create New Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository

## Step 2: Configure Build Settings

### Basic Settings:
- **Name**: `your-app-name-backend`
- **Root Directory**: `server` (important!)
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### Environment Variables:
Add these environment variables in Render dashboard:

```
DATABASE_URL=postgresql://your-database-url
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLIENT_URL=https://your-frontend-url.netlify.app
```

## Step 3: Advanced Settings

### Build & Deploy:
- **Auto-Deploy**: Yes
- **Branch**: `main` (or your default branch)

### Health Check Path:
- **Health Check Path**: `/api/health` (if you have one)

## Step 4: Deploy

1. Click "Create Web Service"
2. Wait for the build to complete
3. Check the build logs for any errors

## Step 5: Post-Deployment Setup

After successful deployment, run the database setup:

1. Go to your service dashboard
2. Click on "Shell"
3. Run: `npm run deploy:setup`

This will:
- Generate Prisma client
- Run database migrations
- Seed the database with initial data

## Troubleshooting

### If you get TypeScript errors:
1. Make sure the root directory is set to `server`
2. Check that all dependencies are in `package.json`
3. Verify the build command is correct

### If Prisma errors occur:
1. Make sure `DATABASE_URL` is set correctly
2. Check that the database is accessible
3. Run `npx prisma generate` manually in the shell

### Common Issues:
- **Module not found errors**: Usually means dependencies aren't installed
- **TypeScript compilation errors**: Check `tsconfig.json` settings
- **Database connection errors**: Verify `DATABASE_URL` format

## Verification

After deployment, test these endpoints:
- `GET /api/health` (if available)
- `GET /api/products`
- `POST /api/auth/register`

Your backend should now be running on: `https://your-app-name.onrender.com` 