import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parse';


const prisma = new PrismaClient();

async function importProducts() {
  try {
    const csvFilePath = path.join(__dirname, '../../../data/products.csv');
    const fileContent = fs.readFileSync(csvFilePath, 'utf-8');

    const records: any[] = [];
    const parser = csv.parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });

    for await (const record of parser) {
      records.push(record);
    }

    console.log(`Found ${records.length} products to import`);

    for (const record of records) {
      // Debug logging
      console.log('Raw record:', record);

      // Find the category by name
      const category = await prisma.category.findFirst({
        where: {
          name: record.category,
          type: 'home_page'
        }
      });

      if (!category) {
        console.log(`Category not found for product: ${record.description}, category: ${record.category}`);
        continue;
      }

      // Validate part number
      if (!record.partNumber) {
        console.log(`Skipping record - missing part number:`, record);
        continue;
      }

      try {
        // Create or update the product
        const product = await prisma.product.create({
          data: {
            name: record.name,
            description: record.description,
            price: parseFloat(record.price),
            stock: 10, // Default stock
            categoryId: category.id,
            imageUrl: [], // Empty array for now
            imagePublicIds: [],
            partNumbers: {
              create: [{
                number: String(record.partNumber),
                type: 'original',
                manufacturer: record.name,
                isOriginal: true
              }]
            }
          }
        });

        console.log(`Successfully imported product: ${product.name}`);
      } catch (error) {
        console.error('Error creating product:', error);
        console.error('Failed record:', record);
      }
    }

    console.log('Products imported successfully');
  } catch (error) {
    console.error('Error importing products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importProducts(); 