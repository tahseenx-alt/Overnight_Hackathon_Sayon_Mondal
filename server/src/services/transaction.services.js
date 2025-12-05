import fs from "fs";
import csv from "csv-parser";
import axios from "axios";
import { checkHardcodedRules } from "../utils/rules.utils.js";
import Transaction from "../models/transaction.model.js";

export const processTransactionFile = (filePath) => {
    return new Promise((resolve, reject) => {
        const transactions = [];

        // 1. Read and Parse the CSV File
        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (row) => {
                // Optional: Clean/Format data here if needed
                transactions.push(row);
            })
            .on("end", async () => {
                try {
                    const ruleResults = transactions.map((txn) => ({
                        ...txn,
                        ruleScore: checkHardcodedRules(txn), // Returns 0 to 100 or 0.0 to 1.0
                    }));

                    // ML API
                    const mlApiUrl =
                        process.env.ML_API_URL ||
                        "http://localhost:8000/predict";
                    const apiKey = process.env.ML_API_KEY;

                    let mlResponse;
                    try {
                        // Sending the JSON data to the ML server
                        mlResponse = await axios.post(
                            mlApiUrl,
                            { transactions: transactions },
                            { headers: { "x-api-key": apiKey } }
                        );
                    } catch (apiError) {
                        console.error("ML API Failed:", apiError.message);
                        // Fallback: If ML fails, rely 100% on hardcoded rules
                        mlResponse = {
                            data: transactions.map(() => ({ risk_score: 0 })),
                        };
                    }

                    const mlScores = mlResponse.data; // Expecting an array of scores from Python

                    // --- STEP 4: Merge & Calculate Final Verdict ---
                    const finalResults = ruleResults.map((txn, index) => {
                        const mlRisk = mlScores[index]?.risk_score || 0; // Adjust key based on ML response
                        const ruleRisk = txn.ruleScore || 0;

                        // Hybrid Logic:
                        // If Rule says HIGH RISK (e.g. 1.0), we trust it.
                        // Otherwise, we average it with the ML score.
                        let finalRisk = ruleRisk * 0.4 + mlRisk * 0.6;

                        // Hard flag override
                        if (ruleRisk >= 0.9) finalRisk = 1.0;

                        return {
                            transaction_id: txn.txn_id,
                            sender_upi: txn.sender_vpa,
                            amount: txn.amount,
                            risk_score: finalRisk.toFixed(2),
                            verdict: finalRisk > 0.7 ? "FRAUD" : "SAFE",
                            reason:
                                finalRisk > 0.7
                                    ? "High Risk Detected by Hybrid Engine"
                                    : "Clean",
                        };
                    });

                    await Transaction.bulkCreate(finalResults);

                    resolve(finalResults);
                } catch (error) {
                    reject(error);
                }
            });
    });
};
