import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.js";
import propertyRoutes from "./routes/properties.js";

dotenv.config();
const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/", (_req, res) => res.json({ ok: true, service: "realestate-api" }));

app.use("/auth", authRoutes);
app.use("/properties", propertyRoutes);

const start = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  app.listen(process.env.PORT, () =>
    console.log(`API running on http://localhost:${process.env.PORT}`)
  );
};
start();
