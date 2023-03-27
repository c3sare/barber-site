import { Schema, createConnection } from "mongoose";

interface IUsworks {
  image: string;
}

const usworkSchema = new Schema<IUsworks>({
  image: { type: String, required: true },
});

const Usworks = createConnection(
  process.env.MONGO_URI as string
).model<IUsworks>("usworks", usworkSchema);

export default Usworks;
