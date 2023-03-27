import { Schema, Types, createConnection } from "mongoose";

interface Pro {
  desc: string;
  img: string;
}

interface IDescMains {
  title: string;
  description: string;
  pros: Types.DocumentArray<Pro>;
}

const descmainSchema = new Schema<IDescMains>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  pros: [
    {
      desc: String,
      img: String,
    },
  ],
});

const Descmains = createConnection(
  process.env.MONGO_URI as string
).model<IDescMains>("descmains", descmainSchema);

export default Descmains;
