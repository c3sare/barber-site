import { Schema, createConnection } from "mongoose";

interface IBarbers {
  name: string;
}

const barberSchema = new Schema<IBarbers>({
  name: { type: String, required: true },
});

const Barbers = createConnection(
  process.env.MONGO_URI as string
).model<IBarbers>("barbers", barberSchema);

export default Barbers;
