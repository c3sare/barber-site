import { sessionOptions } from "@/lib/AuthSession/Config";
import dbConnect from "@/lib/dbConnect";
import Menu from "@/models/Menu";
import User from "@/models/User";
import { withIronSessionApiRoute } from "iron-session/next";
import { Types } from "mongoose";
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
  const session = req.session.user;
  await dbConnect();
  let user = null;
  if (session?.id && session.isLoggedIn) {
    user = await User.findOne({ _id: new Types.ObjectId(session?.id) });
  }
  if (req.method === "POST") {
    if (!session?.isLoggedIn || !user?.permissions?.menu)
      return res
        .status(403)
        .json({ message: "Brak uprawnień do tej ścieżki!" });

    const menu: MenuSettings = req.body.menu;

    if (!Types.ObjectId.isValid(menu._id))
      return res
        .status(400)
        .json({ message: "Nieprawidłowe parametry zapytania!" });

    const result = await Menu.updateOne(
      { _id: new Types.ObjectId(menu._id) },
      {
        $set: {
          custom: menu.custom,
          title: menu.title,
          on: menu.on,
          slug: menu.slug,
        },
      }
    );

    if (!result.acknowledged)
      res
        .status(500)
        .json({ message: "Wystąpił błąd przy wykonywaniu zapytania!" });

    return res.status(200).json({ error: false });
  } else {
    return res.status(404);
  }
}
