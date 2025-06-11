"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProductStore } from "@/store/useProductStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProductDetailsSkeleton from "./productSkeleton";
import { useCartStore } from "@/store/useCartStore";
import { useToast } from "@/hooks/use-toast";
import Image from "./../../../../public/images/F1_Banner.png"

function ProductDetailsContent({ id }: { id: string }) {
  const [product, setProduct] = useState<any>(null);
  const { fetchProductById, loading } = useProductStore();
  const { addToCart } = useCartStore();
  const { toast } = useToast();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id || isNaN(Number(id))) {
          console.error('Invalid product ID:', id);
          router.push("/404");
          return;
        }

        const productDetails = await fetchProductById(id);
        if (productDetails) {
          setProduct(productDetails);
        } else {
          console.error('Product not found:', id);
          router.push("/404");
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        router.push("/404");
      }
    };

    fetchProduct();
  }, [id, fetchProductById, router]);

  const handleAddToCart = async () => {
    if (authLoading) {
      toast({
        title: "Please wait",
        description: "Authentication is in progress",
        variant: "default"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Please login first",
        description: "You need to be logged in to add items to cart",
        variant: "destructive"
      });
      router.push('/auth/login');
      return;
    }

    if (product) {
      try {
        await addToCart(parseInt(product.id), quantity);

        setSelectedSize("");
        setSelectedColor(0);
        setQuantity(1);

        toast({
          title: "Product added to cart",
          description: "Your item has been added to your cart successfully"
        });
      } catch (error) {
        console.error('Add to cart error:', error);
        toast({
          title: "Failed to add to cart",
          description: error instanceof Error ? error.message : "There was an error adding the item to your cart",
          variant: "destructive"
        });
      }
    }
  };

  console.log(id, product);

  if (!product || loading) return <ProductDetailsSkeleton />;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3 flex gap-4">
            <div className="hidden lg:flex flex-col gap-2 w-24">
              {product.images?.map((image: string, index: number) => (
                <button
                  onClick={() => setSelectedImage(index)}
                  key={index}
                  className={`${
                    selectedImage === index
                      ? "border-black"
                      : "border-transparent"
                  } border-2`}
                >
                  <img
                    src={image || Image.src}
                    alt={`Product-${index + 1}`}
                    className="w-full aspect-square object-cover"
                  />
                </button>
              ))}
            </div>
            <div className="flex-1 relative w-[300px]">
              <img
                src={product.images?.[selectedImage] || Image.src}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="lg:w-1/3 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div>
                <span className="text-2xl font-semibold">
                  £{product.price.toFixed(2)}
                </span>
              </div>
            </div>
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Color</h3>
                <div className="flex gap-2">
                  {product.colors.map((color: string, index: number) => (
                    <button
                      key={index}
                      className={`w-12 h-12 rounded-full border-2 ${
                        selectedColor === index
                          ? "border-black"
                          : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(index)}
                    />
                  ))}
                </div>
              </div>
            )}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Size</h3>
                <div className="flex gap-2">
                  {product.sizes.map((size: string, index: number) => (
                    <Button
                      key={index}
                      className={`w-12 h-12`}
                      variant={selectedSize === size ? "default" : "outline"}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <h3 className="font-medium mb-2">Quantity</h3>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  variant="outline"
                >
                  -
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  onClick={() => setQuantity(quantity + 1)}
                  variant="outline"
                >
                  +
                </Button>
              </div>
            </div>
            <div>
              <Button
                className={"w-full bg-black text-white hover:bg-gray-800"}
                onClick={handleAddToCart}
              >
                ADD TO CART
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-16">
          <Tabs defaultValue="details">
            <TabsList className="w-full justify-start border-b">
              <TabsTrigger value="details">PRODUCT DESCRIPTION</TabsTrigger>
              <TabsTrigger value="reviews">REVIEWS</TabsTrigger>
              <TabsTrigger value="shipping">
                SHIPPING & RETURNS INFO
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-5">
              <p className="text-gray-700 mb-4">{product.description}</p>
            </TabsContent>
            <TabsContent value="reviews" className="mt-5">
              Reviews
            </TabsContent>
            <TabsContent value="shipping">
              <p className="text-gray-700 mb-4">
                Shipping and return information goes here.Please read the info
                before proceeding.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailsContent;
