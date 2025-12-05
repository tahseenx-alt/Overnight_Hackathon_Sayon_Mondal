import { processTransactionFile } from "../services/transaction.services.js";
import fs from "fs";

export const uploadCsv = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const filePath = req.file.path;

        // Call service to process the file
        const analysisResult = await processTransactionFile(filePath);

        // Cleanup: Delete the temp file after processing
        fs.unlinkSync(filePath);

        // Return the JSON result to the frontend
        res.status(200).json({
            message: "Analysis Complete",
            data: analysisResult,
        });
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
