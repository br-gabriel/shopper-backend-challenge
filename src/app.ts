import express, { Express } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import measurementRoutes from "./routes/measurementRoutes";

dotenv.config();
const app: Express = express();

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("MongoDB conectado"))
  .catch((error) => console.log(error));

app.use(express.json());
app.use("/", measurementRoutes);

export default app;