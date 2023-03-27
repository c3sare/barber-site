import { Schema, model, models } from "mongoose";

interface IMailConfig {
  host: string;
  mail: string;
  pwd: string;
  port: number;
}

const mailConfigSchema = new Schema<IMailConfig>({
  host: { type: String, required: true },
  mail: { type: String, required: true },
  pwd: { type: String, required: true },
  port: { type: Number, required: true },
});

export default models.Mailconfig ||
  model<IMailConfig>("Mailconfig", mailConfigSchema);
