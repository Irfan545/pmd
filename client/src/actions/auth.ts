"use server";
import { ProtectLoginRules, ProtectSignUpRules } from "@/arcjet";
import { request } from "@arcjet/next";
import { error } from "console";

export const ProtectSignUpActions = async (email: string) => {
  const req = await request();
  const decision = await ProtectSignUpRules.protect(req, { email });
  if (decision.isDenied()) {
    if (decision.reason.isEmail()) {
      const emailType = decision.reason.emailTypes;
      if (emailType.includes("DISPOSABLE")) {
        return {
          error: "Disposable email are not allowed",
          //   reason: decision.reason,
          success: false,
          status: 403,
        };
      } else if (emailType.includes("INVALID")) {
        return {
          error: "Invalid email",
          //   reason: decision.reason,
          success: false,
          status: 403,
        };
      } else if (emailType.includes("NO_MX_RECORDS")) {
        return {
          error: "Email does not have MX records!",
          //   reason: decision.reason,
          success: false,
          status: 403,
        };
      }
    } else if (decision.reason.isBot()) {
      return {
        error: "Bot detected",
        //   reason: decision.reason,
        success: false,
        status: 403,
      };
    } else if (decision.reason.isRateLimit()) {
      return {
        error: "Rate limit exceeded",
        //   reason: decision.reason,
        success: false,
        status: 403,
      };
    }
  }
  return {
    success: true,
  };
};
export const ProtectLoginActions = async (email: string) => {
  const req = await request();
  const decision = await ProtectLoginRules.protect(req, { email });
  if (decision.isDenied()) {
    if (decision.reason.isEmail()) {
      const emailType = decision.reason.emailTypes;
      if (emailType.includes("DISPOSABLE")) {
        return {
          error: "Disposable email are not allowed",
          //   reason: decision.reason,
          success: false,
          status: 403,
        };
      } else if (emailType.includes("INVALID")) {
        return {
          error: "Invalid email",
          //   reason: decision.reason,
          success: false,
          status: 403,
        };
      } else if (emailType.includes("NO_MX_RECORDS")) {
        return {
          error: "Email does not have MX records!",
          //   reason: decision.reason,
          success: false,
          status: 403,
        };
      }
    }
  }
  return {
    success: true,
  };
};
