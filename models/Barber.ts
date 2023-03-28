import { Schema, models, model } from "mongoose";

interface IBarbers {
  name: string;
}

const barberSchema = new Schema<IBarbers>({
  name: { type: String, required: true },
});

export default models.Barber || model<IBarbers>("Barber", barberSchema);
