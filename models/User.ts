import { Schema, createConnection } from "mongoose";

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

const Users = createConnection(process.env.MONGO_URI as string).model<IUser>(
  "User",
  usersSchema
);

export default Users;
