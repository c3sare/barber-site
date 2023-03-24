import { sessionOptions } from "@/lib/AuthSession/Config";
import getMenu from "@/lib/getMenu";
import { MenuItemDB } from "@/lib/types/MenuItem";
import { withIronSessionApiRoute } from "iron-session/next";
import { MongoClient, ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(menuRoute, sessionOptions);

async function menuRoute(req: NextApiRequest, res: NextApiResponse) {
  const user = req.session.user;
  if (req.method === "GET") {
    if (!user?.isLoggedIn || !user?.permissions?.menu)
      return res
        .status(403)
        .json({ message: "Brak uprawnień do tej ścieżki!" });

    const menu: MenuItemDB[] = await getMenu();
    res.status(200).json({
      menu: menu.map((item) => ({
        _id: item._id,
        parent: item.parent,
        title: item.title,
        slug: item.slug,
        order: item.order,
      })),
    });
  } else if (req.method === "POST") {
    if (!user?.isLoggedIn || !user?.permissions?.menu)
      return res
        .status(403)
        .json({ message: "Brak uprawnień do tej ścieżki!" });

    const menu: MenuItemDB[] = req.body.menu;

    const client = new MongoClient(process.env.MONGO_URI as string);
    const database = client.db("site");
    const tab = database.collection("menu");
    const updates: boolean[] = [];
    menu.forEach(async (item) => {
      updates.push(
        Boolean(
          (
            await tab.updateOne(
              { _id: new ObjectId(item._id) },
              { $set: { order: item.order, parent: item.parent } }
            )
          ).acknowledged
        )
      );
    });
    if (updates.includes(false))
      return res
        .status(500)
        .json({ message: "Wystąpił problem przy wykonaniu zapytania!" });

    client.close();
    return res.status(200).json({ error: false });
  }
}
