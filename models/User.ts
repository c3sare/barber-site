import { Schema, model, models } from "mongoose";

interface Permissions {
  basic: boolean;
  footer: boolean;
  menu: boolean;
  news: boolean;
  workers: boolean;
  reservations: boolean;
  smtpconfig: boolean;
  users: boolean;
}

interface IUser {
  login: string;
  password: string;
  permissions: Permissions;
}

const usersSchema = new Schema<IUser>({
  login: { type: String, required: true },
  password: { type: String, required: true },
  permissions: Object,
});

export default models.User || model<IUser>("User", usersSchema);
