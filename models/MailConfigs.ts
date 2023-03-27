import { Schema, createConnection } from "mongoose";

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

const MailConfig = createConnection(
  process.env.MONGO_URI as string
).model<IMailConfig>("Mailconfig", mailConfigSchema);

export default MailConfig;
