import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { Types } from "mongoose";
import Barbers from "@/models/Barber";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export default withIronSessionApiRoute(workersRoute, sessionOptions);

const nameRegex =
  /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u;

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

    const workers = await Barbers.find({});
    res.json(workers);
  } else if (req.method === "PUT") {
    if (!session?.isLoggedIn || !user?.permissions?.users)
      return res
        .status(403)
        .json({ message: "Nie masz uprawnień do tej ścieżki!" });

    const { name } = req.body;
    if (!nameRegex.test(name) || name.length === 0 || name.length > 30)
      return res
        .status(400)
        .json({ message: "Nieprawidłowe argumenty zapytania!" });

    const insert = await Barbers.collection.insertOne({ name });

    if (!insert)
      res
        .status(500)
        .json({ message: "Wystąpił błąd przy wykonywaniu zapytania!" });

    res.status(200).json({ error: false });
  } else if (req.method === "DELETE") {
    if (!session?.isLoggedIn || !user?.permissions?.users)
      return res
        .status(403)
        .json({ message: "Nie masz uprawnień do tej ścieżki!" });

    const { id } = req.body;

    if (!Types.ObjectId.isValid(id as string))
      return res
        .status(400)
        .json({ message: "Nieprawidłowe parametry zapytania!" });

    const _id = new Types.ObjectId(id);
    const exist = await Barbers.findOne({ _id });

    if (!exist)
      return res
        .status(404)
        .json({ message: "Pracownik o id " + id + " nie istnieje!" });

    const delReservations = await Barbers.deleteMany({ barber_id: id });

    if (!delReservations)
      return res
        .status(500)
        .json({ message: "Błąd przy wykonywaniu zapytania!" });

    const delWorker = await Barbers.deleteOne({ _id });

    if (!delWorker)
      return res
        .status(500)
        .json({ message: "Błąd przy wykonywaniu zapytania!" });

    res.status(200).json({ error: false });
  } else {
    res.status(404);
  }
}
