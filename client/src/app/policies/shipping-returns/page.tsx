'use client'

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const ShippingReturnsPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Shipping & Returns Policy</h1>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Shipping Information</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We offer fast and reliable shipping to ensure your automotive parts arrive when you need them.
                </p>
                
                <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Shipping Methods</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Standard Shipping:</strong> 3-5 business days</li>
                  <li><strong>Express Shipping:</strong> 1-2 business days</li>
                  <li><strong>Overnight Shipping:</strong> Next business day delivery</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Shipping Costs</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Free shipping on orders over $100</li>
                  <li>Standard shipping: $9.99</li>
                  <li>Express shipping: $19.99</li>
                  <li>Overnight shipping: $29.99</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Delivery Areas</h3>
                <p>
                  We ship to all 50 states in the United States. International shipping is not currently available.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Returns & Exchanges</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We want you to be completely satisfied with your purchase. If you're not happy with your order, we're here to help.
                </p>

                <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Return Policy</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>30-day return window from date of delivery</li>
                  <li>Items must be in original condition and packaging</li>
                  <li>Return shipping costs are the responsibility of the customer</li>
                  <li>Refunds will be processed within 5-7 business days</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Non-Returnable Items</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Custom or special order items</li>
                  <li>Items marked as "Final Sale"</li>
                  <li>Used or damaged items</li>
                  <li>Items without original packaging</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">How to Return</h3>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Contact our customer service team</li>
                  <li>Provide your order number and reason for return</li>
                  <li>Receive return authorization and shipping label</li>
                  <li>Package item securely and ship back</li>
                  <li>Refund will be processed upon receipt</li>
                </ol>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Warranty Information</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Most of our automotive parts come with manufacturer warranties. Warranty terms vary by product and manufacturer.
                </p>

                <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Warranty Coverage</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Manufacturer defects</li>
                  <li>Workmanship issues</li>
                  <li>Material defects</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Warranty Exclusions</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Normal wear and tear</li>
                  <li>Improper installation</li>
                  <li>Accident damage</li>
                  <li>Modifications to the product</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  If you have any questions about our shipping or returns policy, please don't hesitate to contact us:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Email:</strong> support@autoparts.com</li>
                  <li><strong>Phone:</strong> 1-800-AUTO-PARTS</li>
                  <li><strong>Hours:</strong> Monday-Friday, 8AM-6PM EST</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingReturnsPage; 