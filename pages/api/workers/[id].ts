import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import Barbers from "@/models/Barber";
import dbConnect from "@/lib/dbConnect";
import { Types } from "mongoose";
import User from "@/models/User";

export default withIronSessionApiRoute(workersRoute, sessionOptions);

async function workersRoute(req: NextApiRequest, res: NextApiResponse) {
  const session = req.session.user;
  await dbConnect();
  let user = null;
  if (session?.id && session.isLoggedIn) {
    user = await User.findOne({ _id: new Types.ObjectId(session?.id) });
  }
  if (req.method === "GET") {
    if (!session?.isLoggedIn || !user?.permissions?.users)
      return res
        .status(403)
        .json({ message: "Nie masz uprawnień do tej ścieżki!" });

    const { id } = req.query;

    if (!Types.ObjectId.isValid(id as string))
      return res
        .status(400)
        .json({ message: "Nieprawidłowe argumenty zapytania!" });

    const _id = new Types.ObjectId(id as string);
    const worker = await Barbers.findOne({ _id });
    if (!worker)
      return res
        .status(404)
        .json({ message: "Pracownik o id " + id + " nie istnieje" });

    res.status(200).json(worker);
  } else if (req.method === "POST") {
    const nameRegex =
      /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u;
    const { id, name } = req.body;
    if (
      !name ||
      !Types.ObjectId.isValid(id as string) ||
      nameRegex.test(name) ||
      name.length === 0 ||
      name.length > 30
    )
      return res
        .status(400)
        .json({ message: "Nieprawidłowe parametry zapytania!" });

    const _id = new Types.ObjectId(id);
    const exist = await Barbers.findOne({ _id });

    if (!exist)
      return res
        .status(404)
        .json({ message: "Nie odnaleziono użytkownika od id " + id });

    const update = await Barbers.updateOne({ _id }, { $set: { name } });

    if (!update)
      res
        .status(500)
        .json({ message: "Wystąpił błąd przy wykonywaniu zapytania!" });

    res.json({ error: false });
  } else {
    return res.status(404);
  }
}
