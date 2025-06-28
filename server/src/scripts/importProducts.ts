import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parse';

const prisma = new PrismaClient();

// Category mapping from Product Group to subcategory IDs
const categoryMapping: { [key: string]: number } = {
  'Engine Oils': 115,        // Engine Oils subcategory
  'Gear Oil': 121,           // Gear Oil subcategory
  'Transmission Oils': 120,  // Transmission Oils subcategory
  'Coolant Fluids': 114,     // Coolants Fluids subcategory
  'Steering Fluids': 118,    // Steering Fluids subcategory
  'Other Fluids': 117,       // Other Fluids subcategory
  'Accessories': 167,        // Accessories subcategory in Misc
  'Break Fluids': 113,       // Break Fluids subcategory
  'Suspension Fluids': 119   // Suspension Fluids subcategory
};

// Function to check existing products
async function checkExistingProducts() {
  const productCount = await prisma.product.count();
  const partNumberCount = await prisma.partNumber.count();
  
  console.log(`\n📊 Current Database Status:`);
  console.log(`- Products: ${productCount}`);
  console.log(`- Part Numbers: ${partNumberCount}`);
  
  return { productCount, partNumberCount };
}

// Function to clear all products (use with caution)
async function clearAllProducts() {
  console.log('\n⚠️  Clearing all products and part numbers...');
  
  // Delete all part numbers first (due to foreign key constraints)
  await prisma.partNumber.deleteMany({});
  console.log('✅ Part numbers cleared');
  
  // Delete all products
  await prisma.product.deleteMany({});
  console.log('✅ Products cleared');
  
  console.log('🗑️  All products and part numbers have been removed');
}

async function importProducts(options: { force?: boolean } = {}) {
  try {
    // Check existing products first
    const { productCount, partNumberCount } = await checkExistingProducts();
    
    if (productCount > 0 && !options.force) {
      console.log(`\n⚠️  Found ${productCount} existing products in database.`);
      console.log('💡 Use { force: true } option to clear and re-import all products.');
      console.log('💡 Or use the existing products - they will not be duplicated.');
      return;
    }
    
    if (options.force) {
      await clearAllProducts();
    }

    const csvFilePath = path.join(__dirname, '../../../data/Products1.csv');
    const fileContent = fs.readFileSync(csvFilePath, 'utf-8');

    const records: any[] = [];
    const parser = csv.parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    for await (const record of parser) {
      records.push(record);
    }

    console.log(`\n📦 Found ${records.length} products to import`);

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const record of records) {
      // Debug logging
      console.log('Processing record:', record);

      // Map Product Group to category ID
      const productGroup = record['Product Group'];
      const categoryId = categoryMapping[productGroup];

      if (!categoryId) {
        console.log(`No category mapping found for Product Group: ${productGroup}, skipping product: ${record['Part Number']}`);
        skippedCount++;
        continue;
      }

      // Find the category by ID
      const category = await prisma.category.findUnique({
        where: {
          id: categoryId
        }
      });

      if (!category) {
        console.log(`Category not found for ID: ${categoryId}, Product Group: ${productGroup}, skipping product: ${record['Part Number']}`);
        skippedCount++;
        continue;
      }

      // Validate part number
      if (!record['Part Number']) {
        console.log(`Skipping record - missing part number:`, record);
        skippedCount++;
        continue;
      }

      // Clean price - remove quotes and commas, then parse
      let price = 0;
      try {
        const priceStr = record.Retail?.replace(/[",]/g, '') || '0';
        price = parseFloat(priceStr);
        if (isNaN(price)) {
          price = 0;
        }
      } catch (error) {
        console.log(`Invalid price for ${record['Part Number']}: ${record.Retail}`);
        price = 0;
      }

      try {
        // Check if product already exists by part number (only if not forcing)
        if (!options.force) {
          const existingProduct = await prisma.product.findFirst({
            where: {
              partNumbers: {
                some: {
                  number: String(record['Part Number'])
                }
              }
            },
            include: {
              partNumbers: true
            }
          });

          if (existingProduct) {
            console.log(`Product already exists with part number ${record['Part Number']}, skipping: ${existingProduct.name}`);
            skippedCount++;
            continue;
          }
        }

        // Create the product since it doesn't exist
        const product = await prisma.product.create({
          data: {
            name: record.Description || record['Part Number'],
            description: record.Description || '',
            price: price,
            stock: 10, // Default stock
            categoryId: category.id,
            imageUrl: [], // Empty array for now
            imagePublicIds: [],
            partNumbers: {
              create: [{
                number: String(record['Part Number']),
                type: 'original',
                manufacturer: record.Manufacturer || 'Unknown',
                isOriginal: true
              }]
            }
          }
        });

        console.log(`Successfully created product: ${product.name} (${record['Part Number']}) - Price: $${price} - Category: ${category.name}`);
        createdCount++;
      } catch (error) {
        console.error('Error creating product:', error);
        console.error('Failed record:', record);
        skippedCount++;
      }
    }

    console.log('\n=== Import Summary ===');
    console.log(`Total records processed: ${records.length}`);
    console.log(`Products created: ${createdCount}`);
    console.log(`Products updated: ${updatedCount}`);
    console.log(`Products skipped: ${skippedCount}`);
    console.log('Products imported successfully');
  } catch (error) {
    console.error('Error importing products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import if this file is executed directly
if (require.main === module) {
  const force = process.argv.includes('--force');
  console.log(`🚀 Starting product import${force ? ' (FORCE MODE)' : ''}...`);
  
  importProducts({ force })
    .then(() => {
      console.log('Product import script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Product import script failed:', error);
      process.exit(1);
    });
}

export { importProducts, checkExistingProducts, clearAllProducts }; 