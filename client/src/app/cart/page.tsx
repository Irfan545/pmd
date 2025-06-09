"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function UserCartPage() {
  const {
    fetchCart,
    items,
    isLoading,
    updateCartItemQuantity,
    removeFromCart,
  } = useCartStore();
  const { user, isLoading: isAuthLoading } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading) {
      if (user) {
        fetchCart();
      } else {
        router.push('/auth/login');
      }
    }
  }, [fetchCart, user, router, isAuthLoading]);

  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    setIsUpdating(true);
    await updateCartItemQuantity(id, Math.max(1, newQuantity));
    setIsUpdating(false);
  };

  const handleRemoveItem = async (id: string) => {
    setIsUpdating(true);
    await removeFromCart(id);
    setIsUpdating(false);
  };

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (isLoading || isAuthLoading || !user) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">YOUR CART</h1>
        {items.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-lg text-gray-600">Your cart is empty</p>
            <Button
              onClick={() => router.push('/listing')}
              className="mt-4"
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-4">PRODUCT</th>
                  <th className="text-right py-4 px-4">PRICE</th>
                  <th className="text-center py-4 px-4">QUANTITY</th>
                  <th className="text-right py-4 px-4">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover"
                        />
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                          {item.color && (
                            <p className="text-sm text-gray-700">
                              Color: {item.color}
                            </p>
                          )}
                          {item.size && (
                            <p className="text-sm text-gray-700">
                              Size: {item.size}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="text-right py-4 px-4">
                      £{item.price.toFixed(2)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={isUpdating || item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value))}
                          className="w-16 text-center"
                          min={1}
                          disabled={isUpdating}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={isUpdating}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                    <td className="text-right py-4 px-4">
                      <div className="flex flex-col items-end gap-2">
                        <span>£{(item.price * item.quantity).toFixed(2)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={isUpdating}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-8 flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-4 border-t">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold">£{total.toFixed(2)}</span>
                </div>
                <Button
                  className="w-full mt-4"
                  onClick={() => router.push('/checkout')}
                >
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserCartPage;
