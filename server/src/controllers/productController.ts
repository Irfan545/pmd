import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import cloudinary from "../config/cloudinary";
import { prisma } from "../lib/prisma";
import { parse } from "path";
import fs from "fs";

//create a product
export const createProduct = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      description,
      price,
      categoryId,
      stock,
      isFeatured,
      partNumbers,
    } = req.body;
    const files = req.files as Express.Multer.File[];
    
    // Parse part numbers if provided
    let parsedPartNumbers = [];
    if (partNumbers) {
      try {
        parsedPartNumbers = JSON.parse(partNumbers);
      } catch (error) {
        console.error('Error parsing part numbers:', error);
        parsedPartNumbers = [];
      }
    }
    
    // Get category name for part number type
    let categoryName = "Unknown";
    if (categoryId) {
      try {
        const category = await prisma.category.findUnique({
          where: { id: parseInt(categoryId) }
        });
        if (category) {
          categoryName = category.name;
        }
      } catch (error) {
        console.error('Error fetching category:', error);
      }
    }
    
    //upload images to cloudinary
    const uploadPromises = files.map((file) => {
      return cloudinary.uploader.upload(file.path, {
        folder: "products",
      });
    });
    const uploadResults = await Promise.all(uploadPromises);
    const imageUrls = uploadResults.map((result) => result.secure_url);
    const imagePublicIds = uploadResults.map((result) => result.public_id);

    const newlyCreatedProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        categoryId: parseInt(categoryId),
        stock: parseInt(stock),
        imageUrl: imageUrls,
        imagePublicIds: imagePublicIds,
        isFeatured: isFeatured === 'true',
        // Create part numbers if provided
        partNumbers: {
          create: parsedPartNumbers.map((pn: any) => ({
            number: pn.number,
            type: categoryName,
            manufacturer: pn.manufacturer,
            isOriginal: pn.isOriginal || false,
          }))
        }
      },
      include: {
        partNumbers: true,
        brand: true,
        model: true,
        category: true,
      }
    });
    
    files.forEach((file) => {
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });
    
    res.status(201).json({
      message: "Product created successfully",
      product: newlyCreatedProduct,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error", success: false });
  }
};

// get all products
export const fetchAllProductsForAdmin = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const fetchProducts = await prisma.product.findMany({
      include: {
        partNumbers: true,
        brand: true,
        model: true,
        category: true,
      }
    });

    res.status(200).json(fetchProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error", success: false });
  }
};

// get a product by id
export const getProductById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        partNumbers: true,
        brand: true,
        model: true,
        category: true,
      }
    });
    if (!product) {
      res.status(404).json({
        error: "Product not found",
        success: false,
      });
      return;
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error", success: false });
  }
};

// update a product by id (admin only)
export const updateProductById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    console.log('Updating product with ID:', id);
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    
    const {
      name,
      description,
      price,
      categoryId,
      brandId,
      modelId,
      stock,
      compatibilities,
      isFeatured,
      compatibleEngineId,
      partNumbers,
      existingImages,
      imagesToDelete,
    } = req.body;

    console.log('Extracted fields:', {
      name,
      description,
      price,
      categoryId,
      brandId,
      modelId,
      stock,
      isFeatured,
      compatibleEngineId,
      partNumbers,
      existingImages,
      imagesToDelete,
    });
    
    // Parse part numbers if provided
    let parsedPartNumbers = [];
    if (partNumbers) {
      try {
        parsedPartNumbers = JSON.parse(partNumbers);
        console.log('Parsed part numbers:', parsedPartNumbers);
      } catch (error) {
        console.error('Error parsing part numbers:', error);
        parsedPartNumbers = [];
      }
    }

    // Parse existing images and images to delete
    let existingImagesArray = [];
    let imagesToDeleteArray = [];
    
    if (existingImages) {
      try {
        existingImagesArray = JSON.parse(existingImages);
        console.log('Parsed existing images:', existingImagesArray);
      } catch (error) {
        console.error('Error parsing existing images:', error);
      }
    }
    
    if (imagesToDelete) {
      try {
        imagesToDeleteArray = JSON.parse(imagesToDelete);
        console.log('Parsed images to delete:', imagesToDeleteArray);
      } catch (error) {
        console.error('Error parsing images to delete:', error);
      }
    }

    // Get category name for part number type
    let categoryName = "Unknown";
    if (categoryId) {
      try {
        const category = await prisma.category.findUnique({
          where: { id: parseInt(categoryId) }
        });
        if (category) {
          categoryName = category.name;
          console.log('Category name for part numbers:', categoryName);
        }
      } catch (error) {
        console.error('Error fetching category:', error);
      }
    }

    const files = req.files as Express.Multer.File[];
    console.log('Files to upload:', files?.length || 0);
    let imageUrls = [...existingImagesArray];
    let newImagePublicIds: string[] = [];

    // Handle new image uploads
    if (files && files.length > 0) {
      try {
        console.log('Starting image upload to Cloudinary...');
        // Upload new images to cloudinary
        const uploadPromises = files.map((file) => {
          return cloudinary.uploader.upload(file.path, {
            folder: "products",
          });
        });
        const uploadResults = await Promise.all(uploadPromises);
        const newImageUrls = uploadResults.map((result) => result.secure_url);
        newImagePublicIds = uploadResults.map((result) => result.public_id);
        
        imageUrls = [...imageUrls, ...newImageUrls];
        console.log('Image upload successful:', newImageUrls.length, 'images');

        // Clean up uploaded files
        files.forEach((file) => {
          if (file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      } catch (uploadError) {
        console.error('Error uploading images:', uploadError);
        // Clean up uploaded files in case of error
        files.forEach((file) => {
          if (file.path && fs.existsSync(file.path)) {
            try {
              fs.unlinkSync(file.path);
            } catch (error) {
              console.error('Error deleting file:', file.path, error);
            }
          }
        });
        throw uploadError;
      }
    }

    // Get existing product to handle image public IDs properly
    console.log('Fetching existing product...');
    const existingProduct = await prisma.product.findUnique({
      where: { id: Number(id) },
    });

    if (!existingProduct) {
      console.log('Product not found with ID:', id);
      res.status(404).json({ error: "Product not found", success: false });
      return;
    }

    console.log('Existing product found:', {
      id: existingProduct.id,
      name: existingProduct.name,
      imageCount: existingProduct.imageUrl.length,
      publicIdsCount: existingProduct.imagePublicIds.length
    });

    // Use existing images from the frontend or from the database
    let actualExistingImages = existingImagesArray.length > 0 ? existingImagesArray : existingProduct.imageUrl;
    let actualExistingPublicIds = existingProduct.imagePublicIds;

    // Handle image deletions from Cloudinary
    if (imagesToDeleteArray.length > 0 && actualExistingPublicIds.length > 0) {
      try {
        console.log('Deleting images from Cloudinary...');
        const publicIdsToDelete = actualExistingPublicIds.filter((publicId, index) => 
          imagesToDeleteArray.includes(actualExistingImages[index])
        );

        // Delete from Cloudinary
        await Promise.all(
          publicIdsToDelete.map((publicId) => cloudinary.uploader.destroy(publicId))
        );
        console.log('Deleted', publicIdsToDelete.length, 'images from Cloudinary');
      } catch (error) {
        console.error('Error deleting images from Cloudinary:', error);
      }
    }

    // Filter out deleted images from existing arrays
    const finalImageUrls = actualExistingImages.filter((url: string) => 
      !imagesToDeleteArray.includes(url)
    );
    
    const finalImagePublicIds = actualExistingPublicIds.filter((publicId: string, index: number) => 
      !imagesToDeleteArray.includes(actualExistingImages[index])
    );

    // Add new image public IDs
    const allImagePublicIds = [...finalImagePublicIds, ...newImagePublicIds];

    console.log('Final image arrays:', {
      urls: finalImageUrls.length,
      publicIds: allImagePublicIds.length
    });

    const updateData: any = {
      name,
      description,
      price: parseFloat(price),
      categoryId: parseInt(categoryId),
      stock: parseInt(stock),
      isFeatured: isFeatured === 'true',
      imageUrl: finalImageUrls,
      imagePublicIds: allImagePublicIds,
    };

    // Add optional fields if provided
    if (brandId) {
      updateData.brandId = parseInt(brandId);
      console.log('Added brandId:', updateData.brandId);
    }
    if (modelId) {
      updateData.modelId = parseInt(modelId);
      console.log('Added modelId:', updateData.modelId);
    }
    if (compatibleEngineId) {
      updateData.compatibleEngineId = parseInt(compatibleEngineId);
      console.log('Added compatibleEngineId:', updateData.compatibleEngineId);
    }

    console.log('Final update data:', updateData);
    console.log('ImageUrl being sent to DB:', updateData.imageUrl);
    console.log('ImagePublicIds being sent to DB:', updateData.imagePublicIds);

    // Use transaction to handle part numbers update
    console.log('Starting database transaction...');
    const updatedProduct = await prisma.$transaction(async (tx) => {
      // Delete existing part numbers
      console.log('Deleting existing part numbers...');
      await tx.partNumber.deleteMany({
        where: { productId: Number(id) }
      });

      // Update product with new part numbers
      console.log('Updating product...');
      const updated = await tx.product.update({
        where: { id: Number(id) },
        data: {
          ...updateData,
          partNumbers: {
            create: parsedPartNumbers.map((pn: any) => ({
              number: pn.number,
              type: categoryName,
              manufacturer: pn.manufacturer,
              isOriginal: pn.isOriginal || false,
            }))
          }
        },
        include: {
          partNumbers: true,
          brand: true,
          model: true,
          category: true,
        }
      });

      console.log('Product updated successfully');
      return updated;
    });
    
    console.log('Transaction completed successfully');
    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
      success: true,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({ error: "Internal Server Error", success: false });
  }
};

// delete a product by id
export const deleteProductById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.product.delete({
      where: { id: Number(id) },
    });
    res.status(200).json({
      message: "Product deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error", success: false });
  }
};

//fetch products by category
export const fetchProductsByCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { page = '1', limit = '20', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Get the category and its subcategories
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: {
        subcategories: true
      }
    });

    if (!category) {
      res.status(404).json({ 
        error: "Category not found",
        success: false 
      });
      return;
    }

    // Get all category IDs (main category + subcategories)
    const categoryIds = [
      category.id,
      ...category.subcategories.map((sub: { id: number }) => sub.id)
    ];

    const products = await prisma.product.findMany({
      where: {
        categoryId: {
          in: categoryIds
        }
      },
      include: {
        brand: true,
        model: true,
        category: true,
        partNumbers: true
      },
      skip,
      take: parseInt(limit as string),
      orderBy: { [sortBy as string]: sortOrder }
    });

    const total = await prisma.product.count({
      where: {
        categoryId: {
          in: categoryIds
        }
      }
    });

    res.json({
      products,
      total,
      page: parseInt(page as string),
      totalPages: Math.ceil(total / parseInt(limit as string))
    });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ 
      error: "Failed to fetch products",
      success: false 
    });
  }
};

// Upload images for a product by part number
export const uploadImagesByPartNumber = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { partNumber } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({ 
        success: false, 
        error: "No images provided" 
      });
      return;
    }

    // Find product by part number
    const product = await prisma.product.findFirst({
      where: {
        partNumbers: {
          some: {
            number: partNumber
          }
        }
      },
      include: {
        partNumbers: true
      }
    });

    if (!product) {
      res.status(404).json({ 
        success: false, 
        error: "Product not found with the given part number" 
      });
      return;
    }

    // Upload images to Cloudinary
    const uploadPromises = files.map((file) => {
      return cloudinary.uploader.upload(file.path, {
        folder: "products",
        public_id: `${partNumber}_${Date.now()}`,
      });
    });

    const uploadResults = await Promise.all(uploadPromises);
    const imageUrls = uploadResults.map((result) => result.secure_url);
    const imagePublicIds = uploadResults.map((result) => result.public_id);

    // Update product with new images
    const updatedProduct = await prisma.product.update({
      where: { id: product.id },
      data: {
        imageUrl: [...product.imageUrl, ...imageUrls],
        imagePublicIds: [...(product.imagePublicIds || []), ...imagePublicIds],
      },
    });

    // Clean up uploaded files
    files.forEach((file) => {
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });

    res.status(200).json({
      success: true,
      message: "Images uploaded successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error uploading images:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to upload images" 
    });
  }
};

export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { search, page = '1', limit = '20', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    console.log('Search request received:', { search, page, limit, sortBy, sortOrder });

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        {
          partNumbers: {
            some: {
              number: { contains: search as string, mode: 'insensitive' }
            }
          }
        }
      ];
    }

    console.log('Search query:', where);

    const products = await prisma.product.findMany({
      where,
      include: { 
        brand: true, 
        model: true, 
        category: true,
        partNumbers: true
      },
      skip,
      take: parseInt(limit as string),
      orderBy: { [sortBy as string]: sortOrder },
    });

    console.log('Found products:', products.length);

    const total = await prisma.product.count({ where });

    res.json({
      products,
      total,
      page: parseInt(page as string),
      totalPages: Math.ceil(total / parseInt(limit as string)),
    });
  } catch (error) {
    console.error('Error in searchProducts:', error);
    res.status(500).json({ 
      error: "Failed to fetch products",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
