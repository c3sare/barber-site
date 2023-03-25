import { ObjectId } from "mongodb";

export default interface UserData {
  _id: string | ObjectId;
  login: string;
  password: string;
  permissions: {
    [key: string]: boolean;
  };
}
