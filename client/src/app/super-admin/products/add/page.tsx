"use client";

import { protectProductFormAction } from "@/actions/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useProductStore } from "@/store/useProductStore";
import { useCategoryStore, Category } from "@/store/useCategoryStore";
import { brands, sizes, colors } from "@/utils/config";
import { Upload, X, Plus } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState, Suspense } from "react";

interface PartNumber {
  number: string;
  manufacturer: string;
  isOriginal: boolean;
}

interface FormState {
  name: string;
  brand: string;
  description: string;
  parentCategory: string;
  category: string;
  price: string;
  stock: string;
}

function SuperAdminManageProductPage() {
  const [formState, setFormState] = useState<FormState>({
    name: "",
    brand: "",
    description: "",
    parentCategory: "",
    category: "",
    price: "",
    stock: "",
  });
  const [selectedfiles, setSelectFiles] = useState<File[]>([]);
  const [selectedColors, setSelectColors] = useState<string[]>([]);
  const [selectedSizes, setSelectSizes] = useState<string[]>([]);
  const [partNumbers, setPartNumbers] = useState<PartNumber[]>([
    { number: "", manufacturer: "", isOriginal: false }
  ]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  const searchParams = useSearchParams();
  const getCurrentEditedProductId = searchParams.get("id");
  const isEditMode = !!getCurrentEditedProductId;

  const router = useRouter();
  const { createProduct, updateProduct, fetchProductById, loading, error } = useProductStore();
  const { categories, fetchCategories, loading: categoriesLoading } = useCategoryStore();
  const { toast } = useToast();

  // Get selected parent category
  const selectedParentCategory = categories.find(cat => cat.id.toString() === formState.parentCategory);
  const availableSubcategories = selectedParentCategory?.subcategories || [];

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (isEditMode) {
      console.log('Fetching product with ID:', getCurrentEditedProductId);
      fetchProductById(getCurrentEditedProductId).then((product) => {
        console.log('Received product data:', product);
        if (product && typeof product === 'object') {
          // Find parent category for the product's category
          let parentCategoryId = "";
          let categoryId = "";
          
          if (typeof product.category === 'object' && product.category && 'id' in product.category) {
            categoryId = product.category.id.toString();
            // Find parent category
            const parentCat = categories.find(cat => 
              cat.subcategories.some(sub => sub.id === (product.category as { id: number; name: string }).id)
            );
            if (parentCat) {
              parentCategoryId = parentCat.id.toString();
            }
          } else if (typeof product.category === 'string') {
            // Handle legacy string category format
            const foundCategory = categories.find(cat => 
              cat.name === product.category || 
              cat.subcategories.some(sub => sub.name === product.category)
            );
            if (foundCategory) {
              if (foundCategory.parentId) {
                // It's a subcategory
                categoryId = foundCategory.id.toString();
                const parentCat = categories.find(cat => cat.id === foundCategory.parentId);
                if (parentCat) {
                  parentCategoryId = parentCat.id.toString();
                }
              } else {
                // It's a parent category, find first subcategory
                parentCategoryId = foundCategory.id.toString();
                if (foundCategory.subcategories.length > 0) {
                  categoryId = foundCategory.subcategories[0].id.toString();
                }
              }
            }
          }
          
          setFormState({
            name: product.name || "",
            brand: typeof product.brand === 'object' && product.brand ? product.brand.name : (product.brand || ""),
            description: product.description || "",
            parentCategory: parentCategoryId,
            category: categoryId,
            price: product.price ? product.price.toString() : "",
            stock: product.stock ? product.stock.toString() : "",
          });
          
          // Set part numbers if they exist
          if (product.partNumbers && Array.isArray(product.partNumbers)) {
            setPartNumbers(product.partNumbers.map(pn => ({
              number: pn.number || "",
              manufacturer: pn.manufacturer || "",
              isOriginal: pn.isOriginal || false
            })));
          }
          
          // Set existing images
          if (product.imageUrl && Array.isArray(product.imageUrl)) {
            console.log('Setting existing images:', product.imageUrl);
            setExistingImages(product.imageUrl);
          } else {
            console.log('No imageUrl found or not an array:', product.imageUrl);
          }
          
          setSelectSizes([]);
          setSelectColors([]);
        } else {
          console.error('Product is null or invalid:', product);
          toast({
            title: "Product not found",
            description: "The product you're trying to edit could not be found.",
            variant: "destructive",
          });
          router.push("/super-admin/products/list");
        }
      }).catch((error) => {
        console.error('Error fetching product:', error);
        toast({
          title: "Error loading product",
          description: "Failed to load product data. Please try again.",
          variant: "destructive",
        });
        router.push("/super-admin/products/list");
      });
    }
  }, [isEditMode, getCurrentEditedProductId, fetchProductById, toast, router, categories]);

  useEffect(() => {
    if (getCurrentEditedProductId === null) {
      setFormState({
        name: "",
        brand: "",
        description: "",
        parentCategory: "",
        category: "",
        price: "",
        stock: "",
      });
      setSelectColors([]);
      setSelectSizes([]);
      setPartNumbers([{ number: "", manufacturer: "", isOriginal: false }]);
    }
  }, [getCurrentEditedProductId]);

  // Reset subcategory when parent category changes
  useEffect(() => {
    if (formState.parentCategory && !isEditMode) {
      setFormState(prev => ({ ...prev, category: "" }));
    }
  }, [formState.parentCategory, isEditMode]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormState((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggleSize = (size: string) => {
    setSelectSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleToggleColor = (color: string) => {
    setSelectColors((prev) =>
      prev.includes(color) ? prev.filter((s) => s !== color) : [...prev, color]
    );
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectFiles(Array.from(event.target.files));
    }
  };

  const removeFile = (index: number) => {
    setSelectFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addPartNumber = () => {
    setPartNumbers(prev => [...prev, { number: "", manufacturer: "", isOriginal: false }]);
  };

  const removePartNumber = (index: number) => {
    setPartNumbers(prev => prev.filter((_, i) => i !== index));
  };

  const updatePartNumber = (index: number, field: keyof PartNumber, value: string | boolean) => {
    setPartNumbers(prev => prev.map((pn, i) => 
      i === index ? { ...pn, [field]: value } : pn
    ));
  };

  const handleImageDelete = (imageUrl: string) => {
    setImagesToDelete(prev => [...prev, imageUrl]);
    setExistingImages(prev => prev.filter(img => img !== imageUrl));
  };

  const handleImageRestore = (imageUrl: string) => {
    setImagesToDelete(prev => prev.filter(img => img !== imageUrl));
    setExistingImages(prev => [...prev, imageUrl]);
  };

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const checkFirstLevelFormSanitization = await protectProductFormAction();

    if (!checkFirstLevelFormSanitization.success) {
      toast({
        title: checkFirstLevelFormSanitization.error,
      });
      return;
    }

    const formData = new FormData();
    Object.entries(formState).forEach(([key, value]) => {
      // Skip parentCategory as it's just for UI, send the actual subcategory ID as categoryId
      if (key === 'parentCategory') return;
      if (key === 'category') {
        formData.append('categoryId', value);
      } else if (key === 'brand') {
        // Skip brand for now to avoid 500 error
        console.log('Skipping brand field:', value);
      } else {
        formData.append(key, value);
      }
    });

    formData.append("sizes", selectedSizes.join(","));
    formData.append("colors", selectedColors.join(","));

    // Handle images for both create and edit modes
    if (isEditMode) {
      // In edit mode, send existing images that should be kept
      formData.append("existingImages", JSON.stringify(existingImages));
      formData.append("imagesToDelete", JSON.stringify(imagesToDelete));
    }
    
    // Add new images if any
    selectedfiles.forEach((file) => {
      formData.append("images", file);
    });

    // Add part numbers as JSON string
    const validPartNumbers = partNumbers.filter(pn => pn.number.trim() !== "");
    formData.append("partNumbers", JSON.stringify(validPartNumbers));

    // Debug: Log what's being sent
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(key, ':', value);
    }

    try {
      if (isEditMode) {
        const updatedProduct = await updateProduct(getCurrentEditedProductId, formData);
        
        // Update the existing images with the new images from the updated product
        if (updatedProduct && updatedProduct.imageUrl) {
          setExistingImages(updatedProduct.imageUrl);
        }
        
        // Clear the selected files since they've been uploaded
        setSelectFiles([]);
      } else {
        await createProduct(formData);
      }
      
      toast({
        title: isEditMode ? "Product updated successfully" : "Product created successfully",
      });
      router.push("/super-admin/products/list");
    } catch (error) {
      toast({
        title: isEditMode ? "Failed to update product" : "Failed to create product",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col gap-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{isEditMode ? "Edit Product" : "Add Product"}</h1>
        </header>
        <form
          onSubmit={handleFormSubmit}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-1"
        >
          {/* Image Upload Section */}
          <div className="mt-2 w-full flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-400 p-12">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4 flex text-sm leading-6 text-gray-600">
                <Label>
                  <span>Click to browse</span>
                  <input
                    type="file"
                    className="sr-only"
                    multiple
                    onChange={handleFileChange}
                  />
                </Label>
              </div>
            </div>
            
            {/* Show existing images in edit mode */}
            {isEditMode && existingImages.length > 0 && (
              <div className="mt-6 w-full">
                <h4 className="text-sm font-medium mb-3">Existing Images ({existingImages.length})</h4>
                <div className="grid grid-cols-3 gap-3">
                  {existingImages.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={imageUrl}
                        alt={`Product ${index + 1}`}
                        width={100}
                        height={100}
                        className="h-24 w-24 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => handleImageDelete(imageUrl)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Debug info */}
            {isEditMode && (
              <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
                <p>Debug: isEditMode={isEditMode.toString()}</p>
                <p>Debug: existingImages.length={existingImages.length}</p>
                <p>Debug: existingImages={JSON.stringify(existingImages)}</p>
              </div>
            )}
            
            {/* Show images to be deleted */}
            {isEditMode && imagesToDelete.length > 0 && (
              <div className="mt-4 w-full">
                <h4 className="text-sm font-medium mb-3 text-red-600">Images to be deleted</h4>
                <div className="grid grid-cols-3 gap-3">
                  {imagesToDelete.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={imageUrl}
                        alt={`To delete ${index + 1}`}
                        width={100}
                        height={100}
                        className="h-24 w-24 object-cover rounded-md opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => handleImageRestore(imageUrl)}
                        className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ↺
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Show new images to be uploaded */}
            {selectedfiles.length > 0 && (
              <div className="mt-4 w-full">
                <h4 className="text-sm font-medium mb-3 text-blue-600">New images to upload</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedfiles.map((file, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        width={80}
                        height={80}
                        className="h-20 w-20 object-cover rounded-md"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label>Product Name *</Label>
              <Input
                name="name"
                placeholder="Enter product name"
                className="mt-1.5"
                onChange={handleInputChange}
                value={formState.name}
                required
              />
            </div>
            
            <div>
              <Label>Brand</Label>
              <Select
                value={formState.brand}
                onValueChange={(value) => handleSelectChange("brand", value)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select Brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand.toLowerCase()}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Parent Category *</Label>
              <Select
                value={formState.parentCategory}
                onValueChange={(value) => handleSelectChange("parentCategory", value)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select Parent Category"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Category *</Label>
              <Select
                value={formState.category}
                onValueChange={(value) => handleSelectChange("category", value)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select Category"} />
                </SelectTrigger>
                <SelectContent>
                  {availableSubcategories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Price *</Label>
              <Input
                name="price"
                type="number"
                step="0.01"
                className="mt-1.5"
                placeholder="Enter price"
                value={formState.price}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label>Stock *</Label>
              <Input
                name="stock"
                type="number"
                className="mt-1.5"
                placeholder="Enter stock quantity"
                value={formState.stock}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Description</Label>
              <Textarea
                name="description"
                className="mt-1.5 min-h-[120px]"
                placeholder="Enter product description"
                onChange={handleInputChange}
                value={formState.description}
              />
            </div>

            {/* Part Numbers Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Part Numbers</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPartNumber}
                  className="flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Part Number
                </Button>
              </div>
              
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {partNumbers.map((partNumber, index) => (
                  <div key={index} className="border rounded-lg p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Part Number {index + 1}</span>
                      {partNumbers.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removePartNumber(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs">Part Number</Label>
                        <Input
                          value={partNumber.number}
                          onChange={(e) => updatePartNumber(index, 'number', e.target.value)}
                          placeholder="Enter part number"
                          className="text-sm"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs">Manufacturer</Label>
                        <Input
                          value={partNumber.manufacturer}
                          onChange={(e) => updatePartNumber(index, 'manufacturer', e.target.value)}
                          placeholder="Enter manufacturer"
                          className="text-sm"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`original-${index}`}
                          checked={partNumber.isOriginal}
                          onChange={(e) => updatePartNumber(index, 'isOriginal', e.target.checked)}
                          className="rounded"
                        />
                        <Label htmlFor={`original-${index}`} className="text-sm">Original Part</Label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              disabled={loading || categoriesLoading}
              type="submit"
              className="px-8"
            >
              {loading ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Product" : "Create Product")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

const SuperAdminManageProductPageWrapper = () => (
  <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="text-lg">Loading...</div></div>}>
    <SuperAdminManageProductPage />
  </Suspense>
);

export default SuperAdminManageProductPageWrapper;
