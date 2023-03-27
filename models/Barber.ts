import { Schema, createConnection } from "mongoose";

interface IBarber {
  name: string;
}

const barberSchema = new Schema<IBarber>({
  name: { type: String, required: true },
});

const Barbers = createConnection(
  process.env.MONGO_URI as string
).model<IBarber>("Barber", barberSchema);

export default Barbers;
