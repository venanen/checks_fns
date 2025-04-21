import express from "express";
import authRoutes from "./auth";
import tripRoutes from "./trip";
import checkRoutes from "./check";
import goodRoutes from "./good";

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/trip', tripRoutes);
router.use('/check', checkRoutes);
router.use('/good', goodRoutes);

export default router
