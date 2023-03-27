import { Schema, Types, createConnection } from "mongoose";

interface Service {
  cost: number;
  id: number;
  service: string;
  time: number;
}

interface ICosts {
  category: string;
  services: Types.DocumentArray<Service>;
}

const costsSchema = new Schema<ICosts>({
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

const Costs = createConnection(process.env.MONGO_URI as string).model<ICosts>(
  "costs",
  costsSchema
);

export default Costs;
