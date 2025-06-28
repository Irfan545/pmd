import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as fs from 'fs';
import * as path from 'path';
import { importNewCategories } from '../src/scripts/importNewCategories';
import { importProducts } from '../src/scripts/importProducts';

const prisma = new PrismaClient();

interface CategoryData {
  id: string;
  name: string;
  type: string;
  parentId?: string;
  subcategories: CategoryData[];
}

async function createCategory(categoryData: CategoryData, parentId: number | null = null) {
  const category = await prisma.category.create({
    data: {
      name: categoryData.name,
      type: categoryData.type,
      parentId: parentId,
    },
  });

  // Recursively create subcategories
  for (const subcategory of categoryData.subcategories) {
    await createCategory(subcategory, category.id);
  }

  return category;
}

async function main() {
  console.log('🚀 Starting database seeding process...');

  // Step 1: Create users
  console.log('\n📝 Creating users...');
  const email = "admin@gmail.com";
  const password = "admin123";
  const name = "SUPER_ADMIN";
  const name1 = "USER";
  const email1 = "user@example.com";
  const password1 = "user123";
  
  const existingUser = await prisma.user.findFirst({
    where: {
      role: "SUPER_ADMIN",
    },
  });

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedPassword1 = await bcrypt.hash(password1, 10);
    
    const superAdminUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "SUPER_ADMIN",
      },
    });

    const user = await prisma.user.create({
      data: {
        email: email1,
        password: hashedPassword1,
        name: name1,
        role: "USER",
      },
    });

    console.log(`✅ Super admin user created: ${superAdminUser.email}`);
    console.log(`✅ User created: ${user.email}`);
  } else {
    console.log('ℹ️  Users already exist, skipping user creation');
  }

  // Step 2: Check if categories exist
  console.log('\n📂 Checking categories...');
  const existingCategories = await prisma.category.count();
  
  if (existingCategories === 0) {
    console.log('📂 Importing categories...');
    try {
      await importNewCategories();
      console.log('✅ Categories imported successfully!');
    } catch (error) {
      console.error('❌ Error importing categories:', error);
      // Continue with other imports even if categories fail
    }
  } else {
    console.log(`ℹ️  Categories already exist (${existingCategories} found), skipping category import`);
  }

  // Step 3: Check if products exist
  console.log('\n📦 Checking products...');
  const existingProducts = await prisma.product.count();
  
  if (existingProducts === 0) {
    console.log('📦 Importing products...');
    try {
      await importProducts();
      console.log('✅ Products imported successfully!');
    } catch (error) {
      console.error('❌ Error importing products:', error);
    }
  } else {
    console.log(`ℹ️  Products already exist (${existingProducts} found), skipping product import`);
    console.log('💡 To re-import products, first clear the database or use the import script directly');
  }

  console.log('\n🎉 Database seeding completed!');
  console.log('\n📋 Summary:');
  console.log('- Users: admin@gmail.com (SUPER_ADMIN) / user@example.com (USER)');
  console.log(`- Categories: ${await prisma.category.count()} categories in database`);
  console.log(`- Products: ${await prisma.product.count()} products in database`);
  console.log('\n🔑 Login credentials:');
  console.log('Admin: admin@gmail.com / admin123');
  console.log('User: user@example.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
