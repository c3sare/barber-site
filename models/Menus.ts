import { Schema, createConnection } from "mongoose";

interface IMenus {
  title: string;
  on: boolean;
  default: boolean;
  custom: boolean;
  parent: string;
  order: number;
  slug: string;
}

const menuSchema = new Schema<IMenus>({
  title: { type: String, required: true },
  on: { type: Boolean, required: true },
  default: { type: Boolean, required: true },
  custom: { type: Boolean, required: true },
  parent: { type: String, required: true },
  order: { type: Number, required: true },
  slug: { type: String, required: true },
});

const Menu = createConnection(process.env.MONGO_URI as string).model<IMenus>(
  "menus",
  menuSchema
);

export default Menu;
