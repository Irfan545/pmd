import { Response } from "express";
import { Request } from "express";
import { prisma } from "../app";
import { PrismaClient } from "@prisma/client";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
  };
}

type CartItem = {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  color: string | null;
  size: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type Cart = {
  id: number;
  userId: number;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
};

export const addToCart = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { productId, quantity, size, color } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthenticated user",
      });

      return;
    }

    const cart = await (prisma as any).cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    }) as Cart;

    const cartItem = await (prisma as any).cartItem.upsert({
      where: {
        cartId_productId_size_color: {
          cartId: cart.id,
          productId,
          size: size || null,
          color: color || null,
        },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        cartId: cart.id,
        productId,
        quantity,
        size,
        color,
      },
    }) as CartItem;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        name: true,
        price: true,
        imageUrl: true,
      },
    });

    const responseItem = {
      id: cartItem.id,
      productId: cartItem.productId,
      name: product?.name,
      price: product?.price,
      image: product?.imageUrl[0],
      color: cartItem.color,
      size: cartItem.size,
      quantity: cartItem.quantity,
    };

    res.status(201).json({
      success: true,
      data: responseItem,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

export const getCart = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthenticated user",
      });

      return;
    }

    const cart = await (prisma as any).cart.findUnique({
      where: { userId },
      include: {
        items: true,
      },
    }) as Cart;

    if (!cart) {
      res.json({
        success: false,
        messaage: "No Item found in cart",
        data: [],
      });

      return;
    }

    const cartItemsWithProducts = await Promise.all(
      cart?.items.map(async (item: CartItem) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            name: true,
            price: true,
            imageUrl: true,
          },
        });

        return {
          id: item.id,
          productId: item.productId,
          name: product?.name,
          price: product?.price,
          image: product?.imageUrl[0],
          color: item.color,
          size: item.size,
          quantity: item.quantity,
        };
      })
    );

    res.json({
      success: true,
      data: cartItemsWithProducts,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch cart!",
    });
  }
};

export const removeFromCart = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthenticated user",
      });

      return;
    }

    await (prisma as any).cartItem.delete({
      where: {
        id: parseInt(id),
        cart: { userId },
      },
    });

    res.status(200).json({
      success: true,
      message: "Item is removed from cart",
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Failed to remove from cart!",
    });
  }
};

export const updateCartItemQuantity = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { quantity } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthenticated user",
      });

      return;
    }

    const updatedItem = await (prisma as any).cartItem.update({
      where: {
        id: parseInt(id),
        cart: { userId },
      },
      data: { quantity },
    }) as CartItem;

    const product = await prisma.product.findUnique({
      where: { id: updatedItem.productId },
      select: {
        name: true,
        price: true,
        imageUrl: true,
      },
    });

    const responseItem = {
      id: updatedItem.id,
      productId: updatedItem.productId,
      name: product?.name,
      price: product?.price,
      image: product?.imageUrl[0],
      color: updatedItem.color,
      size: updatedItem.size,
      quantity: updatedItem.quantity,
    };

    res.json({
      success: true,
      data: responseItem,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Failed to update cart item quantity",
    });
  }
};

export const clearEntireCart = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthenticated user",
      });

      return;
    }

    await (prisma as any).cartItem.deleteMany({
      where: {
        cart: { userId },
      },
    });

    res.status(200).json({
      success: true,
      message: "cart cleared successfully!",
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Failed to clear cart!",
    });
  }
};
