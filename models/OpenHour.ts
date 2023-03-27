import { Schema, model, models } from "mongoose";

interface IOpenHour {
  short: "pon" | "wto" | "sro" | "czw" | "pia" | "sob" | "nie";
  long:
    | "Poniedziałek"
    | "Wtorek"
    | "Środa"
    | "Czwartek"
    | "Piątek"
    | "Sobota"
    | "Niedziela";
  order: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  end: string;
  start: string;
  closed: boolean;
}

const openHoursSchema = new Schema<IOpenHour>({
  short: { type: String, required: true },
  long: { type: String, required: true },
  order: { type: Number, required: true },
  end: { type: String, required: true },
  start: { type: String, required: true },
  closed: { type: Boolean, required: true },
});

export default models.Openhour || model<IOpenHour>("Openhour", openHoursSchema);
