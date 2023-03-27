import { Schema, createConnection } from "mongoose";

interface IInfos {
  companyName: string;
  yearOfCreate: number;
  slogan: string;
}

const infoSchema = new Schema<IInfos>({
  companyName: { type: String, required: true },
  yearOfCreate: { type: Number, required: true },
  slogan: { type: String, required: true },
});

const Infos = createConnection(process.env.MONGO_URI as string).model<IInfos>(
  "info",
  infoSchema
);

export default Infos;
