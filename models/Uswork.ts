import { Schema, createConnection } from "mongoose";

interface IUswork {
  image: string;
}

const usworkSchema = new Schema<IUswork>({
  image: { type: String, required: true },
});

const Uswork = createConnection(process.env.MONGO_URI as string).model<IUswork>(
  "Uswork",
  usworkSchema
);

export default Uswork;
