import mongoose, { Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

interface IMeasurement extends Document {
  _id: string;
  measure_datetime: Date;
  measure_type: 'WATER' | 'GAS';
  measure_value: number;
  has_confirmed: boolean;
  customer_code: string;
  image_url: string;
}

const measurementSchema: Schema<IMeasurement> = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  measure_datetime: { type: Date, required: true },
  measure_type: { type: String, enum: ["WATER", "GAS"], required: true },
  measure_value: { type: Number, required: true },
  has_confirmed: { type: Boolean, default: false, required: true },
  customer_code: { type: String, required: true },
  image_url: { type: String, required: true },
});

const Measurement = mongoose.model<IMeasurement>("Measurement", measurementSchema);

export default Measurement;
