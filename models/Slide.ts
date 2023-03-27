import { Schema, createConnection } from "mongoose";

interface ISlide {
  title: string;
  desc: string;
  image: string;
}

const slidesSchema = new Schema<ISlide>({
  title: { type: String, required: true },
  desc: { type: String, required: true },
  image: { type: String, required: true },
});

const Slide = createConnection(process.env.MONGO_URI as string).model<ISlide>(
  "Slide",
  slidesSchema
);

export default Slide;
