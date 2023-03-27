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

interface IUsers {
  login: string;
  password: string;
  permissions: Permissions;
}

const usersSchema = new Schema<IUsers>({
  login: { type: String, required: true },
  password: { type: String, required: true },
  permissions: Object,
});

const Users = createConnection(process.env.MONGO_URI as string).model<IUsers>(
  "users",
  usersSchema
);

export default Users;
