## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Cloudinary account for image storage
- PayPal Developer account for payments

### Environment Variables

Create `.env` files in both `client/` and `server/` directories:

**Server (.env):**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce"
JWT_SECRET="your-super-secret-jwt-key"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
PAYPAL_CLIENT_ID="your-paypal-client-id"
PAYPAL_CLIENT_SECRET="your-paypal-client-secret"
CLIENT_URL="http://localhost:3000"
PORT=3001
```

**Client (.env.local):**
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_PAYPAL_CLIENT_ID="your-paypal-client-id"
```

### PayPal Setup

1. Create a [PayPal Developer](https://developer.paypal.com/) account
2. Create a new app in the PayPal Developer Dashboard
3. Get your Client ID and Client Secret
4. For development, use Sandbox environment
5. For production, use Live environment
6. Add the credentials to your environment variables

### Installation & Setup

1. **Install dependencies:**
   ```bash
   # Install server dependencies
   cd server && npm install
   
   # Install client dependencies  
   cd ../client && npm install
   ```

2. **Set up environment variables** (see Environment Variables section above)

3. **Set up database:**
   ```bash
   cd server
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   ```

4. **Start the development servers:**
   ```bash
   # Start backend (from server directory)
   npm run dev
   
   # Start frontend (from client directory)
   npm run dev
   ```

## 🗄️ Database Management

### Preventing Duplicate Products

The system now automatically checks for existing products before importing to prevent duplicates:

- **Normal seeding**: Only imports if database is empty
- **Safe import**: Checks for existing part numbers before creating new products
- **Force import**: Clears all products and re-imports (use with caution)

### Database Commands

```bash
# Check current database status
npm run check:products

# Import products safely (skips existing ones)
npm run import:products

# Force re-import all products (clears existing data)
npm run import:products:force

# Clear all products (use with caution)
npm run clear:products

# Full database setup (users, categories, products)
npm run prisma:seed
```

### Deployment Considerations

When redeploying:

1. **First deployment**: Products will be imported automatically
2. **Subsequent deployments**: Products will be skipped if they already exist
3. **Force re-import**: Use `npm run import:products:force` if you need to update all products

### Product Import Logic

- Products are identified by their **part numbers**
- If a product with the same part number exists, it will be skipped
- This prevents duplicate entries during redeployment
- You can force re-import if you need to update product data 