import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../app";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: string;
  };
}

export const authJWT = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log('Auth middleware - cookies:', req.cookies);
    const token = req.cookies.accessToken;

    if (!token) {
      console.log('Auth middleware - No token provided');
      res.status(401).json({ message: "No token provided" });
      return;
    }

    console.log('Auth middleware - Token found, verifying...');
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      email: string;
      role: string;
    };

    console.log('Auth middleware - Token decoded:', { userId: decoded.userId, email: decoded.email, role: decoded.role });

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      console.log('Auth middleware - User not found in database');
      res.status(401).json({ message: "User not found" });
      return;
    }

    console.log('Auth middleware - User found:', { id: user.id, email: user.email, role: user.role });

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.log('Auth middleware - Error:', error);
    res.status(401).json({ message: "Invalid token" });
  }
};

export const isSuperAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== "SUPER_ADMIN") {
    res.status(403).json({ message: "Access denied" });
    return;
  }
  next();
};
