import { sessionOptions } from "@/lib/AuthSession/Config";
import dbConnect from "@/lib/dbConnect";
import sortMenu from "@/lib/sortMenu";
import { MenuItemDB } from "@/lib/types/MenuItem";
import Menu from "@/models/Menu";
import User from "@/models/User";
import { withIronSessionApiRoute } from "iron-session/next";
import { Types } from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(menuRoute, sessionOptions);

async function menuRoute(req: NextApiRequest, res: NextApiResponse) {
  const session = req.session.user;
  await dbConnect();
  let user = null;
  if (session?.id && session.isLoggedIn) {
    user = await User.findOne({ _id: new Types.ObjectId(session?.id) });
  }
  if (req.method === "GET") {
    if (!session?.isLoggedIn || !user?.permissions?.menu)
      return res
        .status(403)
        .json({ message: "Brak uprawnień do tej ścieżki!" });

    const menu: MenuItemDB[] = await Menu.find({});
    res.status(200).json({
      menu: menu.sort(sortMenu).map((item) => ({
        _id: item._id,
        parent: item.parent,
        title: item.title,
        slug: item.slug,
        order: item.order,
      })),
    });
  } else if (req.method === "POST") {
    if (!session?.isLoggedIn || !user?.permissions?.menu)
      return res
        .status(403)
        .json({ message: "Brak uprawnień do tej ścieżki!" });

    const menu: MenuItemDB[] = req.body.menu;

    const updates: boolean[] = [];
    menu.forEach(async (item) => {
      updates.push(
        Boolean(
          (
            await Menu.updateOne(
              { _id: new Types.ObjectId(item._id) },
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

    return res.status(200).json({ error: false });
  }
}
