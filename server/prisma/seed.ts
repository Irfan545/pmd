import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as fs from 'fs';
import * as path from 'path';

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
  const email = "admin@gmail.com";
  const password = "admin123";
  const name = "SUPER_ADMIN";
  const existingUser = await prisma.user.findFirst({
    where: {
      role: "SUPER_ADMIN",
    },
  });

  if (existingUser) {
    return;
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const superAdminUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: "SUPER_ADMIN",
    },
  });

  console.log(`Super admin user created: ${superAdminUser.email}`);

  try {
    // Read the JSON file
    const jsonPath = path.join(__dirname, '../../client/src/categoryData/HomePageCategoies.json');
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    // Clear existing categories
    await prisma.category.deleteMany({});

    // Create categories recursively
    for (const category of jsonData) {
      await createCategory(category);
    }

    console.log('Categories imported successfully!');
  } catch (error) {
    console.error('Error importing categories:', error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
