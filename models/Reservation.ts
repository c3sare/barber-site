import { Schema, Types, createConnection } from "mongoose";

interface Time {
  time: string;
  reseved: boolean;
  mail: string;
  token: string;
  resevedDate: "" | number;
  person: string;
  phone: string;
}

interface IReservation {
  barber_id: string;
  date: string;
  times: Types.DocumentArray<Time>;
}

const reservationsSchema = new Schema<IReservation>({
  barber_id: { type: String, required: true },
  date: { type: String, required: true },
  times: [
    {
      time: String,
      reserved: Boolean,
      mail: String,
      token: String,
      reservedDate: Number,
      person: String,
      phone: String,
    },
  ],
});

const Reservation = createConnection(
  process.env.MONGO_URI as string
).model<IReservation>("Reservation", reservationsSchema);

export default Reservation;
