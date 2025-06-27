"use client";
import React from 'react';
import { Product } from '@/store/useProductStore';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const imageUrl = product?.imageUrl?.[0] || 'https://placehold.co/600x400';
  
  return (
    <div className="bg-white flex shadow overflow-hidden hover:shadow-lg transition-shadow h-full">
      <div className="relative w-36 flex-shrink-0">
        <img 
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 flex-1">
        <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
        {product.description && (
          <p className="text-gray-600 mb-2 line-clamp-2">{product.description}</p>
        )}
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold">£{product.price.toFixed(2)}</span>
          {product.brand && (
            <span className="text-sm text-gray-500">
              {typeof product.brand === 'string' ? product.brand : product.brand.name}
            </span>
          )}
        </div>
        {product.model && (
          <div className="mt-2 text-sm text-gray-500">
            Model: {typeof product.model === 'string' ? product.model : product.model.name}
          </div>
        )}
        {product.category && (
          <div className="mt-2 text-sm text-gray-500">
            Category: {typeof product.category === 'string' ? product.category : product.category.name}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard; 