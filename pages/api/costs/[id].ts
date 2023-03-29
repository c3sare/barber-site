import { sessionOptions } from "@/lib/AuthSession/Config";
import dbConnect from "@/lib/dbConnect";
import { CostsData } from "@/lib/types/CostsData";
import Cost from "@/models/Cost";
import User from "@/models/User";
import { withIronSessionApiRoute } from "iron-session/next";
import { Types } from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(costsRoute, sessionOptions);

const categoryServiceRegex = /^(.|\s)*[a-zA-Z]+(.|\s)*$/;

async function costsRoute(req: NextApiRequest, res: NextApiResponse) {
  const session = req.session.user;
  await dbConnect();
  let user = null;
  if (session?.id && session.isLoggedIn) {
    user = await User.findOne({ _id: new Types.ObjectId(session?.id) });
  }
  const { id } = req.query;

  if (!Types.ObjectId.isValid(id as string))
    return res.status(500).json({ message: "Zapytanie jest nieprawidłowe!" });

  if (req.method === "GET") {
    if (!session?.isLoggedIn || !user?.permissions.menu)
      return res
        .status(403)
        .json({ message: "Nie posiadasz uprawnień do tej ścieżki!" });

    const item = await Cost.findOne({ _id: new Types.ObjectId(id as string) });

    if (item === null)
      return res
        .status(404)
        .json({ message: `Nie znaleziono obiektu o identyfikatorze ${id}` });

    return res.status(200).json({
      category: item.category,
      services: item.services,
    });
  } else if (req.method === "POST") {
    if (!session?.isLoggedIn || !user?.permissions.menu)
      return res.status(403).json({ message: "Brak uprawnień!" });

    const { category, services }: CostsData = req.body;

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

      const result = await Cost.updateOne(
        {
          _id: new Types.ObjectId(id as string),
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
