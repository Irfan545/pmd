import express from "express";
import { authJWT } from "../middleware/authMiddleware";
import { 
  fetchFeaturedProducts, 
  updateFeaturedProducts,
  fetchFeatureBanners,
  addFeatureBanners 
} from "../controllers/settingsController";
import { upload } from "../middleware/uploadMiddleware";

const router = express.Router();

// Public routes
router.get("/fetch-feature-products", fetchFeaturedProducts);
router.get("/get-banners", fetchFeatureBanners);

// Protected routes
router.use(authJWT);
router.post("/update-feature-products", updateFeaturedProducts);
router.post(
  "/banners",
  upload.array("images", 5),
  addFeatureBanners
);

export default router; 