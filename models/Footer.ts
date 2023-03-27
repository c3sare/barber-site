import { Schema, Types, createConnection } from "mongoose";

interface Link {
  id: number;
  name: string;
  url: string;
}

interface LinkBox {
  name: string;
  links: Types.DocumentArray<Link>;
}

interface IFooters {
  desc: string;
  logo: string;
  btnMore: boolean;
  btnLink: string;
  btnTitle: string;
  linkBoxes: Types.DocumentArray<LinkBox>;
}

const footerSchema = new Schema<IFooters>({
  desc: { type: String, required: true },
  logo: { type: String, required: true },
  btnMore: { type: Boolean, required: true },
  btnLink: { type: String },
  btnTitle: { type: String },
  linkBoxes: [
    {
      name: String,
      links: Array<Link>,
    },
  ],
});

const Footers = createConnection(
  process.env.MONGO_URI as string
).model<IFooters>("footers", footerSchema);

export default Footers;
