import { ObjectId } from "mongodb";

export default interface MailConfigData {
  _id: string | ObjectId;
  host: string;
  pwd: string;
  mail: string;
  port: number;
}
