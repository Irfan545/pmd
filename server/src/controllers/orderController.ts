import axios from "axios";
import { AuthRequest } from "../middleware/authMiddleware";
import { NextFunction, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../app";

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

async function getPaypalAccessToken() {
  try {
    console.log("Getting PayPal access token...");
    console.log("PayPal Base URL:", PAYPAL_BASE_URL);
    console.log("PayPal Client ID exists:", !!PAYPAL_CLIENT_ID);
    console.log("PayPal Client Secret exists:", !!PAYPAL_CLIENT_SECRET);
    
    const response = await axios.post(
      `${PAYPAL_BASE_URL}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
          ).toString("base64")}`,
        },
      }
    );

    console.log("PayPal access token obtained successfully");
    return response.data.access_token;
  } catch (error) {
    console.error("Failed to get PayPal access token:", error);
    console.error("PayPal auth error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error("Failed to authenticate with PayPal");
  }
}

export const createPaypalOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { items, total } = req.body;
    console.log("createPaypalOrder - Request body:", { items, total });
    
    const accessToken = await getPaypalAccessToken();

    // Map items to PayPal format, handling different item structures
    const paypalItems = items.map((item: any) => {
      // Handle both cart item structure and product structure
      const itemName = item.name || item.product?.name || 'Product';
      const itemPrice = item.price || item.product?.price || 0;
      const itemId = item.id || item.productId || item.product?.id || 'unknown';
      const itemDescription = item.description || item.product?.description || '';
      
      return {
        name: itemName,
        description: itemDescription,
        sku: itemId.toString(),
        unit_amount: {
          currency_code: "GBP",
          value: itemPrice.toFixed(2),
        },
        quantity: item.quantity.toString(),
        category: "PHYSICAL_GOODS",
      };
    });

    console.log("PayPal items mapped:", paypalItems);

    const itemTotal = paypalItems.reduce(
      (sum: any, item: any) =>
        sum + parseFloat(item.unit_amount.value) * parseInt(item.quantity),
      0
    );

    console.log("Item total calculated:", itemTotal);
    console.log("Final total:", total);

    // Check if there's a discount applied (item total > final total)
    const hasDiscount = itemTotal > total;
    const discountAmount = hasDiscount ? itemTotal - total : 0;

    const paypalOrderData = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "GBP",
            value: total.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: "GBP",
                value: itemTotal.toFixed(2),
              },
              ...(hasDiscount && {
                discount: {
                  currency_code: "GBP",
                  value: discountAmount.toFixed(2),
                }
              }),
            },
          },
          items: paypalItems,
        },
      ],
    };

    console.log("PayPal order data:", paypalOrderData);

    const response = await axios.post(
      `${PAYPAL_BASE_URL}/v2/checkout/orders`,
      paypalOrderData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "PayPal-Request-ID": uuidv4(),
        },
      }
    );

    console.log("PayPal order created successfully:", response.data);
    res.status(200).json(response.data);
  } catch (e) {
    console.error("PayPal order creation error:", e);
    console.error("Error details:", {
      message: e.message,
      response: e.response?.data,
      status: e.response?.status,
    });
    
    res.status(500).json({
      success: false,
      message: "Failed to create PayPal order",
      error: e.message,
    });
  }
};

export const capturePaypalOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId } = req.body;
    const accessToken = await getPaypalAccessToken();

    console.log("Capturing PayPal order:", orderId);

    const response = await axios.post(
      `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    console.log("PayPal capture response:", response.data);
    res.status(200).json(response.data);
  } catch (e) {
    console.error("PayPal capture error:", e);
    res.status(500).json({
      success: false,
      message: "Unexpected error occured!",
    });
  }
};

export const createFinalOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { items, addressId, couponId, total, paymentId } = req.body;
    const userId = req.user?.userId;

    console.log("createFinalOrder - Request body:", req.body);
    console.log("createFinalOrder - User ID:", userId);
    console.log("createFinalOrder - Items:", items);

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthenticated user",
      });

      return;
    }

    if (!addressId) {
      res.status(400).json({
        success: false,
        message: "Address ID is required",
      });
      return;
    }

    if (!items || items.length === 0) {
      res.status(400).json({
        success: false,
        message: "Items are required",
      });
      return;
    }

    //start our transaction

    const order = await prisma.$transaction(async (prisma) => {
      //create new order
      const newOrder = await prisma.order.create({
        data: {
          userId,
          addressId: Number(addressId),
          couponId: couponId ? Number(couponId) : null,
          totalAmount: total,
          paymentMethod: "CREDIT_CARD",
          paymentStatus: "COMPLETED",
          paymentId,
          items: {
            create: items.map((item: any) => ({
              productId: parseInt(item.productId),
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      console.log("Order created successfully:", newOrder);

      for (const item of items) {
        await prisma.product.update({
          where: { id: parseInt(item.productId) },
          data: {
            stock: { decrement: item.quantity },
            soldCount: { increment: item.quantity },
          },
        });
      }

      await prisma.cartItem.deleteMany({
        where: {
          cart: { userId },
        },
      });

      await prisma.cart.delete({
        where: { userId },
      });

      if (couponId) {
        await prisma.coupon.update({
          where: { id: Number(couponId) },
          data: { userCount: { increment: 1 } },
        });
      }

      return newOrder;
    });

    res.status(201).json(order);
  } catch (e) {
    console.log(e, "createFinalOrder");
    console.error("Order creation error details:", {
      error: e,
      userId: req.user?.userId,
      body: req.body
    });

    res.status(500).json({
      success: false,
      message: "Unexpected error occured!",
    });
  }
};

export const getOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { orderId } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthenticated user",
      });

      return;
    }

    const order = await prisma.order.findFirst({
      where: {
        id: Number(orderId),
        userId,
      },
      include: {
        items: true,
        coupon: true,
      },
    });

    res.status(200).json(order);
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Unexpected error occured!",
    });
  }
};

export const updateOrderStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { orderId } = req.params;
    const { status } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthenticated user",
      });

      return;
    }

    await prisma.order.updateMany({
      where: {
        id: Number(orderId),
      },
      data: {
        status,
      },
    });

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Unexpected error occured!",
    });
  }
};

export const getAllOrdersForAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
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

    const orders = await prisma.order.findMany({
      include: {
        items: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json(orders);
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Unexpected error occured!",
    });
  }
};

export const getOrdersByUserId = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
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

    const orders = await prisma.order.findMany({
      where: {
        userId: userId,
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(orders);
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Unexpected error occured!",
    });
  }
};

export const checkPaypalHealth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("Checking PayPal health...");
    
    // Check if environment variables are set
    const hasClientId = !!PAYPAL_CLIENT_ID;
    const hasClientSecret = !!PAYPAL_CLIENT_SECRET;
    const baseUrl = PAYPAL_BASE_URL;
    
    if (!hasClientId || !hasClientSecret) {
      res.status(400).json({
        success: false,
        message: "PayPal credentials not configured",
        details: {
          hasClientId,
          hasClientSecret,
          baseUrl
        }
      });
      return;
    }
    
    // Try to get access token
    try {
      const accessToken = await getPaypalAccessToken();
      res.status(200).json({
        success: true,
        message: "PayPal is configured correctly",
        details: {
          hasClientId,
          hasClientSecret,
          baseUrl,
          accessToken: accessToken ? "Valid" : "Invalid"
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "PayPal authentication failed",
        details: {
          hasClientId,
          hasClientSecret,
          baseUrl,
          error: error.message
        }
      });
    }
  } catch (e) {
    console.error("PayPal health check error:", e);
    res.status(500).json({
      success: false,
      message: "PayPal health check failed",
      error: e.message,
    });
  }
};
