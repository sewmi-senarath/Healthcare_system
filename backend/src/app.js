import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
const app = express();

dotenv.config();

//connect to MONGO DB
connectDB();


// Middleware
app.use(cors());
app.use(express.json());

