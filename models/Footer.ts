import { Schema, Types, model, models } from "mongoose";

interface Link {
  id: number;
  name: string;
  url: string;
}

interface LinkBox {
  name: string;
  links: Types.DocumentArray<Link>;
}

interface IFooter {
  desc: string;
  logo: string;
  btnMore: boolean;
  btnLink: string;
  btnTitle: string;
  linkBoxes: Types.DocumentArray<LinkBox>;
}

const footerSchema = new Schema<IFooter>({
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

export default models.Footer || model<IFooter>("Footer", footerSchema);
