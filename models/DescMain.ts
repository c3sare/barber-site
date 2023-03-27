import { Schema, Types, model, models } from "mongoose";

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

export default models.Descmain || model<IDescMain>("Descmain", descmainSchema);
