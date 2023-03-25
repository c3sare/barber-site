import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import getData from "@/utils/getData";
import { MongoClient, ObjectId } from "mongodb";

export default withIronSessionApiRoute(workersRoute, sessionOptions);

const nameRegex =
  /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u;

async function workersRoute(req: NextApiRequest, res: NextApiResponse) {
  const session = req.session.user;
  if (req.method === "GET") {
    if (!session?.isLoggedIn || !session?.permissions?.users)
      return res
        .status(403)
        .json({ message: "Nie masz uprawnień do tej ścieżki!" });

    const workers = await getData("barbers");
    res.json(workers);
  } else if (req.method === "PUT") {
    if (!session?.isLoggedIn || !session?.permissions?.users)
      return res
        .status(403)
        .json({ message: "Nie masz uprawnień do tej ścieżki!" });

    const { name } = req.body;
    if (!nameRegex.test(name) || name.length === 0 || name.length > 30)
      return res
        .status(400)
        .json({ message: "Nieprawidłowe argumenty zapytania!" });

    const client = new MongoClient(process.env.MONGO_URI as string);
    const database = client.db("site");
    const tab = database.collection("barbers");
    const insert = await tab.insertOne({ name });

    if (!insert)
      res
        .status(500)
        .json({ message: "Wystąpił błąd przy wykonywaniu zapytania!" });

    res.status(200).json({ error: false });
  } else if (req.method === "DELETE") {
    if (!session?.isLoggedIn || !session?.permissions?.users)
      return res
        .status(403)
        .json({ message: "Nie masz uprawnień do tej ścieżki!" });

    const { id } = req.body;

    if (!ObjectId.isValid(id as string))
      return res
        .status(400)
        .json({ message: "Nieprawidłowe parametry zapytania!" });

    const client = new MongoClient(process.env.MONGO_URI as string);
    const database = client.db("site");
    const tab = database.collection("barbers");
    const _id = new ObjectId(id);
    const exist = tab.findOne({ _id });

    if (!exist)
      return res
        .status(404)
        .json({ message: "Pracownik o id " + id + " nie istnieje!" });

    const delReservations = await tab.deleteMany({ barber_id: id });

    if (!delReservations)
      return res
        .status(500)
        .json({ message: "Błąd przy wykonywaniu zapytania!" });

    const delWorker = await tab.deleteOne({ _id });

    if (!delWorker)
      return res
        .status(500)
        .json({ message: "Błąd przy wykonywaniu zapytania!" });

    res.status(200).json({ error: false });
  } else {
    res.status(404);
  }
}
