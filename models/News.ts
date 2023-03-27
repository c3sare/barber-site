import { Schema, createConnection } from "mongoose";

interface INews {
  desc: string;
  title: string;
  date: string;
  img: string;
  slug: string;
}

const newsSchema = new Schema<INews>({
  desc: { type: String, required: true },
  title: { type: String, required: true },
  date: { type: String, required: true },
  img: { type: String, required: true },
  slug: { type: String, required: true },
});

const News = createConnection(process.env.MONGO_URI as string).model<INews>(
  "New",
  newsSchema
);

export default News;
