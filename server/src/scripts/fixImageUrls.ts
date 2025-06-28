import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function fixImageUrls() {
  try {
    console.log('Starting to fix image URLs...');
    
    // Get all products that have imagePublicIds but empty imageUrl
    const products = await prisma.product.findMany({
      where: {
        AND: [
          {
            imagePublicIds: {
              isEmpty: false
            }
          },
          {
            imageUrl: {
              isEmpty: true
            }
          }
        ]
      }
    });

    console.log(`Found ${products.length} products to fix`);

    for (const product of products) {
      console.log(`Fixing product ${product.id}: ${product.name}`);
      
      // Convert public IDs to URLs
      const imageUrls = product.imagePublicIds.map(publicId => {
        return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/v1/${publicId}`;
      });

      // Update the product
      await prisma.product.update({
        where: { id: product.id },
        data: {
          imageUrl: imageUrls
        }
      });

      console.log(`Fixed product ${product.id} with ${imageUrls.length} images`);
    }

    console.log('Finished fixing image URLs');
  } catch (error) {
    console.error('Error fixing image URLs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixImageUrls(); 