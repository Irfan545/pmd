import { Suspense } from "react";
import ProductDetailsSkeleton from "./productSkeleton";
import ProductDetailsContent from "./productDetails";
import Categories from "@/components/dashboard/category";

function ProductDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div>

    <Suspense fallback={<ProductDetailsSkeleton />}>
      <ProductDetailsContent id={params.id} />
    </Suspense>
    </div>
  );
}

export default ProductDetailsPage;
