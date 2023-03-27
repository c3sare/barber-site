import { Schema, model, models } from "mongoose";

interface IInfo {
  companyName: string;
  yearOfCreate: number;
  slogan: string;
}

const infoSchema = new Schema<IInfo>({
  companyName: { type: String, required: true },
  yearOfCreate: { type: Number, required: true },
  slogan: { type: String, required: true },
});

export default models.Info || model<IInfo>("Info", infoSchema);
