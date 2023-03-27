import { Schema, model, models } from "mongoose";

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

export default models.Slide || model<ISlide>("Slide", slidesSchema);
