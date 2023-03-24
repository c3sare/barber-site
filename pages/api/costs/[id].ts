import { sessionOptions } from "@/lib/AuthSession/Config";
import { CostsData } from "@/lib/types/CostsData";
import { withIronSessionApiRoute } from "iron-session/next";
import { MongoClient, ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(costsRoute, sessionOptions);

const categoryServiceRegex = /^(.|\s)*[a-zA-Z]+(.|\s)*$/;

async function costsRoute(req: NextApiRequest, res: NextApiResponse) {
  const user = req.session.user;
  const { id } = req.query;

  if (!ObjectId.isValid(id as string))
    return res.status(500).json({ message: "Zapytanie jest nieprawidłowe!" });

  if (req.method === "GET") {
    if (!user?.isLoggedIn || !user?.permissions.menu)
      return res
        .status(403)
        .json({ message: "Nie posiadasz uprawnień do tej ścieżki!" });

    const client = new MongoClient(process.env.MONGO_URI as string);
    const database = client.db("site");
    const tab = database.collection("costs");
    const item = await tab.findOne({ _id: new ObjectId(id as string) });

    if (item === null)
      return res
        .status(404)
        .json({ message: `Nie znaleziono obiektu o identyfikatorze ${id}` });

    return res.status(200).json({
      category: item.category,
      services: item.services,
    });
  } else if (req.method === "POST") {
    if (!user?.isLoggedIn || !user?.permissions.menu)
      return res.status(403).json({ message: "Brak uprawnień!" });

    const { category, services }: CostsData = req.body;
    const client = new MongoClient(process.env.MONGO_URI as string);
    const database = client.db("site");
    const tab = database.collection("costs");

    const validRegex = categoryServiceRegex.test(category);
    const validServices = [];

    for (let i = 0; i < services.length; i++) {
      validServices.push(
        categoryServiceRegex.test(services[i].service) &&
          services[i].cost >= 0 &&
          services[i].time >= 0
      );
    }

    if (
      validRegex &&
      validServices.filter((item) => item === false).length === 0
    ) {
      const newServices = services.map((item, i) => ({
        ...item,
        id: i + 1,
      }));

      const result = await tab.updateOne(
        {
          _id: new ObjectId(id as string),
        },
        {
          $set: {
            category,
            services: newServices,
          },
        }
      );

      res.status(200).json({ error: result.acknowledged === undefined });
    }
  } else {
    return res.status(404).json({ message: "Nie odnaleziono takiej ścieżki" });
  }
}
