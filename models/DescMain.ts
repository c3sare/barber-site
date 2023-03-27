import { Schema, Types, createConnection } from "mongoose";

interface Pro {
  desc: string;
  img: string;
}

interface IDescMain {
  title: string;
  description: string;
  pros: Types.DocumentArray<Pro>;
}

const descmainSchema = new Schema<IDescMain>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  pros: [
    {
      desc: String,
      img: String,
    },
  ],
});

const Descmain = createConnection(
  process.env.MONGO_URI as string
).model<IDescMain>("Descmain", descmainSchema);

export default Descmain;
