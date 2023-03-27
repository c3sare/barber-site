import { Schema, createConnection } from "mongoose";

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

const Info = createConnection(process.env.MONGO_URI as string).model<IInfo>(
  "Info",
  infoSchema
);

export default Info;
