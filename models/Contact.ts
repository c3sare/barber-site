import { Schema, createConnection } from "mongoose";

interface IContacts {
  address: string;
  city: string;
  zipcode: string;
  phone: string;
  mail: string;
  nip: number;
  regon: number;
}

const contactSchema = new Schema<IContacts>({
  address: { type: String, required: true },
  city: { type: String, required: true },
  zipcode: { type: String, required: true },
  phone: { type: String, required: true },
  mail: { type: String, required: true },
  nip: { type: Number, required: true },
  regon: { type: Number, required: true },
});

const Contacts = createConnection(
  process.env.MONGO_URI as string
).model<IContacts>("contacts", contactSchema);

export default Contacts;
