"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useProductStore } from "@/store/useProductStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { ImageIcon, Upload, X, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function SuperAdminCouponsPage() {
  const [uploadedFiles, setuploadedFiles] = useState<File[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { products, fetchAllProductsForAdmin } = useProductStore();
  const [filteredProducts, setFilteredProducts] = useState(products);
  const {
    featuredProducts,
    banners,
    isLoading,
    error,
    fetchBanners,
    fetchFeaturedProducts,
    addBanners,
    updateFeaturedProducts,
  } = useSettingsStore();
  const pageLoadRef = useRef(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!pageLoadRef.current) {
      fetchBanners();
      fetchAllProductsForAdmin();
      fetchFeaturedProducts();
      pageLoadRef.current = true;
    }
  }, [fetchAllProductsForAdmin, fetchFeaturedProducts, fetchBanners]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      // Sort products: featured first, then others
      const sortedProducts = [...products].sort((a, b) => {
        const aIsFeatured = selectedProducts.includes(a.id);
        const bIsFeatured = selectedProducts.includes(b.id);
        
        if (aIsFeatured && !bIsFeatured) return -1;
        if (!aIsFeatured && bIsFeatured) return 1;
        return 0;
      });
      setFilteredProducts(sortedProducts);
    } else {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (typeof product.category === 'object' && product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (typeof product.category === 'string' && product.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.partNumbers && product.partNumbers.some(part => 
          part.number.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
      
      // Sort filtered results: featured first, then others
      const sortedFiltered = filtered.sort((a, b) => {
        const aIsFeatured = selectedProducts.includes(a.id);
        const bIsFeatured = selectedProducts.includes(b.id);
        
        if (aIsFeatured && !bIsFeatured) return -1;
        if (!aIsFeatured && bIsFeatured) return 1;
        return 0;
      });
      
      setFilteredProducts(sortedFiltered);
    }
  }, [searchTerm, products, selectedProducts]);

  console.log(products, "products");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const totalFiles = uploadedFiles.length + newFiles.length;
      
      if (totalFiles > 5) {
        toast({
          title: "Maximum 5 images allowed",
          description: `You can upload up to ${5 - uploadedFiles.length} more images`,
          variant: "destructive",
        });
        return;
      }
      
      setuploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeImage = (getCurrentIndex: number) => {
    setuploadedFiles((prev) => prev.filter((_, i) => i !== getCurrentIndex));
  };

  const handleProductSelection = (productId: number) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }

      if (prev.length > 8) {
        toast({
          title: "You can select up to 8 products as featured",
          variant: "destructive",
        });
        return prev;
      }

      return [...prev, productId];
    });
  };

  const handleSaveChanges = async () => {
    let hasChanges = false;
    let successMessages = [];

    // Handle image uploads
    if (uploadedFiles.length > 0) {
      const result = await addBanners(uploadedFiles);
      if (result) {
        setuploadedFiles([]);
        fetchBanners();
        successMessages.push("Banner images uploaded successfully");
        hasChanges = true;
      } else {
        toast({
          title: "Failed to upload banner images",
          variant: "destructive",
        });
        return;
      }
    }

    // Only update featured products if they've changed
    if (featuredProductsChanged) {
      const result = await updateFeaturedProducts(selectedProducts.map(id => id.toString()));
      if (result) {
        successMessages.push("Featured products updated successfully");
        fetchFeaturedProducts();
        hasChanges = true;
      } else {
        toast({
          title: "Failed to update featured products",
          variant: "destructive",
        });
        return;
      }
    }

    // Show success message
    if (hasChanges) {
      toast({
        title: successMessages.join(" and "),
      });
    } else {
      toast({
        title: "No changes to save",
        description: "Make some changes before saving",
      });
    }
  };

  useEffect(() => {
    setSelectedProducts(featuredProducts.map((pro) => pro.id));
  }, [featuredProducts]);

  // Calculate if featured products have changed
  const currentFeaturedIds = featuredProducts.map(pro => pro.id);
  const featuredProductsChanged = 
    currentFeaturedIds.length !== selectedProducts.length ||
    currentFeaturedIds.some(id => !selectedProducts.includes(id)) ||
    selectedProducts.some(id => !currentFeaturedIds.includes(id));

  return (
    <div className="p-6 space-y-6 pb-24">
      <div className="flex flex-col gap-6">
        <header className="flex items-center justify-between">
          <h1 className="text-lg font-bold">Settings & Features</h1>
        </header>
        <div className="space-y-6">
          <div>
            <h2 className="mb-2">Feature Images</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Label
                  htmlFor="image-upload"
                  className="flex items-center justify-center w-full h-32 px-4 transition border-2 border-gray-200 border-dashed rounded-md appearance-none cursor-pointer hover:border-blue-400"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Upload className="h-7 w-7 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      Click to upload Feature Images
                    </span>
                    <span className="text-xs text-gray-400">
                      {uploadedFiles.length}/5 images selected
                    </span>
                  </div>
                  <Input
                    id="image-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploadedFiles.length >= 5}
                  />
                </Label>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 mt-4">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Uploaded image ${index + 1}`}
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <Button
                    variant="destructive"
                    size={"icon"}
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 hidden group-hover:flex"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="mb-4">Current Feature Banners</h2>
            <div className="grid grid-cols-4 gap-4">
              {banners.map((banner, index) => (
                <div key={banner.id} className="relative group">
                  <img
                    src={banner.imageUrl}
                    alt={`Banner ${index + 1}`}
                    className="w-full h-32 object-cover rounded-md"
                  />
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="mb-4">
              Select up to 8 products to feature on client panel ({products.length} total products)
            </h2>
            
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products by name, description, category, or part number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {/* Featured Products Section */}
              {filteredProducts.filter(product => selectedProducts.includes(product.id)).length > 0 && (
                <>
                  <div className="col-span-full mb-4">
                    <h3 className="text-lg font-semibold text-blue-600 border-b border-blue-200 pb-2">
                      Currently Featured Products ({filteredProducts.filter(product => selectedProducts.includes(product.id)).length})
                    </h3>
                  </div>
                  {filteredProducts.filter(product => selectedProducts.includes(product.id)).map((product) => (
                    <div
                      className={`relative p-4 border rounded-lg ${
                        selectedProducts.includes(product.id)
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200"
                      }`}
                      key={product.id}
                    >
                      <div className="absolute top-2 right-2">
                        <Checkbox
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={() => handleProductSelection(product.id)}
                        />
                      </div>
                      {selectedProducts.includes(product.id) && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                            Featured
                          </span>
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="w-full h-32 bg-gray-100 rounded-md flex items-center justify-center">
                          {product.imageUrl && product.imageUrl.length > 0 ? (
                            <img
                              src={product.imageUrl[0] || "/placeholder.svg"}
                              alt={product.name}
                              className="w-full h-full object-cover rounded-md"
                            />
                          ) : (
                            <ImageIcon className="h-8 w-8 text-gray-500" />
                          )}
                        </div>
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-gray-500">
                          {typeof product.category === 'string' ? product.category : product.category?.name}
                        </p>
                        {product.partNumbers && product.partNumbers.length > 0 && (
                          <p className="text-xs text-blue-600 font-medium">
                            Part: {product.partNumbers[0].number}
                            {product.partNumbers.length > 1 && ` (+${product.partNumbers.length - 1} more)`}
                          </p>
                        )}
                        <p className="font-bold">${product.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </>
              )}
              
              {/* Non-Featured Products Section */}
              {filteredProducts.filter(product => !selectedProducts.includes(product.id)).length > 0 && (
                <>
                  <div className="col-span-full mb-4 mt-8">
                    <h3 className="text-lg font-semibold text-gray-600 border-b border-gray-200 pb-2">
                      Other Products ({filteredProducts.filter(product => !selectedProducts.includes(product.id)).length})
                    </h3>
                  </div>
                  {filteredProducts.filter(product => !selectedProducts.includes(product.id)).map((product) => (
                    <div
                      className={`relative p-4 border rounded-lg ${
                        selectedProducts.includes(product.id)
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200"
                      }`}
                      key={product.id}
                    >
                      <div className="absolute top-2 right-2">
                        <Checkbox
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={() => handleProductSelection(product.id)}
                        />
                      </div>
                      {selectedProducts.includes(product.id) && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                            Featured
                          </span>
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="w-full h-32 bg-gray-100 rounded-md flex items-center justify-center">
                          {product.imageUrl && product.imageUrl.length > 0 ? (
                            <img
                              src={product.imageUrl[0] || "/placeholder.svg"}
                              alt={product.name}
                              className="w-full h-full object-cover rounded-md"
                            />
                          ) : (
                            <ImageIcon className="h-8 w-8 text-gray-500" />
                          )}
                        </div>
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-gray-500">
                          {typeof product.category === 'string' ? product.category : product.category?.name}
                        </p>
                        {product.partNumbers && product.partNumbers.length > 0 && (
                          <p className="text-xs text-blue-600 font-medium">
                            Part: {product.partNumbers[0].number}
                            {product.partNumbers.length > 1 && ` (+${product.partNumbers.length - 1} more)`}
                          </p>
                        )}
                        <p className="font-bold">${product.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
            
            {filteredProducts.length === 0 && searchTerm && (
              <div className="text-center py-8">
                <p className="text-gray-500">No products found matching "{searchTerm}"</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Sticky Save Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedProducts.length} of 8 products selected
              {uploadedFiles.length > 0 && (
                <span className="ml-4 text-blue-600">
                  • {uploadedFiles.length} image{uploadedFiles.length > 1 ? 's' : ''} ready to upload
                </span>
              )}
            </div>
            <Button
              disabled={isLoading || (uploadedFiles.length === 0 && !featuredProductsChanged)}
              onClick={handleSaveChanges}
              className="px-8"
            >
              {isLoading ? "Saving Changes..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuperAdminCouponsPage;
