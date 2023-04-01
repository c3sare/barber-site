import { Schema, model, models } from "mongoose";

interface INews {
  desc: string;
  title: string;
  date: string;
  img: string;
  slug: string;
  content: string;
}

const newsSchema = new Schema<INews>({
  desc: { type: String, required: true },
  title: { type: String, required: true },
  date: { type: String, required: true },
  img: { type: String, required: true },
  slug: { type: String, required: true },
  content: { type: String, required: true },
});

export default models.New || model<INews>("New", newsSchema);
