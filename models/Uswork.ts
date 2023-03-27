import { Schema, model, models } from "mongoose";

interface IUswork {
  image: string;
}

const usworkSchema = new Schema<IUswork>({
  image: { type: String, required: true },
});

export default models.Uswork || model<IUswork>("Uswork", usworkSchema);
