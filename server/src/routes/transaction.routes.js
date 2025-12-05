import { Router } from "express";
import { uploadCsv } from "../controllers/transaction.controllers.js";
import multer from "multer";

const router = Router();
// Save files to a temporary 'uploads' folder
const upload = multer({ dest: "uploads/" });

// Upload CSV of transactions
router.post("/upload", upload.single("file"), uploadCsv);

export default router;
