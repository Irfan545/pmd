import { NextFunction, Request, Response } from "express";
import { jwtVerify, JWTPayload } from "jose";

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: string;
  };
}

export const authJWT = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies.accessToken;
  if (!accessToken) {
    res.status(401).json({ error: "Unauthorized", success: false });
    return;
  }
  jwtVerify(accessToken, new TextEncoder().encode(process.env.JWT_SECRET))
    .then((result) => {
      const payload = result.payload as JWTPayload & {
        userId: number;
        email: string;
        role: string;
      };
      req.user = {
        userId: Number(payload.id),
        email: payload.email as string,
        role: payload.role as string,
      };
      next();
    })
    .catch((err) => {
      console.error(err);
      res.status(401).json({ error: "Unauthorized", success: false });
    });
};

export const isSuperAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role === "SUPER_ADMIN") {
    next();
  } else {
    res.status(403).json({
      error: "Access Denied! Super Admin Access Required...",
      success: false,
    });
    return;
  }
};
