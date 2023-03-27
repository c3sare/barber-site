import { Schema, Types, model, models } from "mongoose";

interface Service {
  cost: number;
  id: number;
  service: string;
  time: number;
}

interface ICost {
  category: string;
  services: Types.DocumentArray<Service>;
}

const costsSchema = new Schema<ICost>({
  category: { type: String, required: true },
  services: [
    {
      cost: Number,
      id: Number,
      service: String,
      time: Number,
    },
  ],
});

export default models.Cost || model<ICost>("Cost", costsSchema);
