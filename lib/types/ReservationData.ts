import { ObjectId } from "mongodb";

export default interface ReservationData {
  _id: string | ObjectId;
  barber_id: string;
  date: string;
  times: {
    time: string;
    reserved: boolean;
    mail: string;
    token: string;
    reservedDate: string | number;
    person: string;
    phone: string;
  }[];
}
