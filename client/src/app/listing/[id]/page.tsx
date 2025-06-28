import { Suspense } from "react";
import ProductDetailsSkeleton from "./productSkeleton";
import ProductDetailsContent from "./productDetails";
import Categories from "@/components/dashboard/category";

async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <div>
      <Suspense fallback={<ProductDetailsSkeleton />}>
        <ProductDetailsContent id={id} />
      </Suspense>
    </div>
  );
}

export default ProductDetailsPage;
