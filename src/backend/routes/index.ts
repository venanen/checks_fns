import express from "express";
import authRoutes from "./auth";
import tripRoutes from "./trip";
const router = express.Router();
router.use('/auth', authRoutes);
router.use('/trip', tripRoutes);

export default router
