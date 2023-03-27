import { Schema, createConnection } from "mongoose";

interface ISlides {
  title: string;
  desc: string;
  image: string;
}

const slidesSchema = new Schema<ISlides>({
  title: { type: String, required: true },
  desc: { type: String, required: true },
  image: { type: String, required: true },
});

const Slides = createConnection(process.env.MONGO_URI as string).model<ISlides>(
  "slides",
  slidesSchema
);

export default Slides;
