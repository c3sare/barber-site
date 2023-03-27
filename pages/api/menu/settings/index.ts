import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { MongoClient, ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(menuRoute, sessionOptions);

interface MenuSettings {
  _id: string;
  title: string;
  on: boolean;
  slug: string;
  custom: boolean;
}

async function menuRoute(req: NextApiRequest, res: NextApiResponse) {
  const user = req.session.user;
  if (req.method === "POST") {
    if (!user?.isLoggedIn || !user?.permissions?.menu)
      return res
        .status(403)
        .json({ message: "Brak uprawnień do tej ścieżki!" });

    const menu: MenuSettings = req.body.menu;

    if (!ObjectId.isValid(menu._id))
      return res
        .status(400)
        .json({ message: "Nieprawidłowe parametry zapytania!" });

    const client = new MongoClient(process.env.MONGO_URI as string);
    const database = client.db("site");
    const tab = database.collection("menus");
    const result = await tab.updateOne(
      { _id: new ObjectId(menu._id) },
      {
        $set: {
          custom: menu.custom,
          title: menu.title,
          on: menu.on,
          slug: menu.slug,
        },
      }
    );
    client.close();

    if (!result.acknowledged)
      res
        .status(500)
        .json({ message: "Wystąpił błąd przy wykonywaniu zapytania!" });

    return res.status(200).json({ error: false });
  } else {
    return res.status(404);
  }
}
