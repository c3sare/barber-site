import { Schema, createConnection } from "mongoose";

interface IMailConfigs {
  host: string;
  mail: string;
  pwd: string;
  port: number;
}

const mailConfigSchema = new Schema<IMailConfigs>({
  host: { type: String, required: true },
  mail: { type: String, required: true },
  pwd: { type: String, required: true },
  port: { type: Number, required: true },
});

const MailConfigs = createConnection(
  process.env.MONGO_URI as string
).model<IMailConfigs>("mailconfigs", mailConfigSchema);

export default MailConfigs;
