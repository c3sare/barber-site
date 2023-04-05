import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import Menu from "@/models/Menu";
import dbConnect from "@/lib/dbConnect";
import { Types } from "mongoose";
import User from "@/models/User";
import sortMenu from "@/lib/sortMenu";

export default withIronSessionApiRoute(menuRoute, sessionOptions);

const titleRegex =
  /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u;
const slugRegex = /^[a-z](-?[a-z])*$/;

async function menuRoute(req: NextApiRequest, res: NextApiResponse) {
  const session = req.session?.user;
  await dbConnect();
  let user = null;
  if (session?.id && session.isLoggedIn) {
    user = await User.findOne({ _id: new Types.ObjectId(session?.id) });
  }
  if (req.method === "GET") {
    const menu = await Menu.find({});

    if (!menu)
      return res
        .status(500)
        .json({ message: "Wystąpił problem przy pobieraniu danych!" });

    const menuWithoutContent = menu.sort(sortMenu).map((node) => {
      return {
        _id: node.id,
        title: node.title,
        parent: node.parent,
        slug: node.slug,
      };
    });
    res.json(menuWithoutContent);
  } else if (req.method === "DELETE") {
    if (!session?.isLoggedIn || !user?.permissions?.menu)
      return res
        .status(403)
        .json({ message: "Brak uprawnień do tej ścieżki!" });
    const { id }: { id: string } = req.body;

    if (!Types.ObjectId.isValid(id))
      return res
        .status(400)
        .json({ message: "Parametry zapytania są nieprawidłowe!" });

    const deleteResult = await Menu.deleteOne({
      _id: new Types.ObjectId(id),
      default: false,
    });

    if (deleteResult.deletedCount !== 1) {
      return res
        .status(404)
        .json({ message: "Nie znaleziono elementu o id " + id });
    }

    const updateParentResult = await Menu.updateMany(
      { parent: id },
      { $set: { parent: "" } }
    );
    if (!updateParentResult) {
      return res
        .status(500)
        .json({ message: "Wystąpił problem przy wykonaniu zapytania!" });
    }

    res.json({ error: false });
  } else if (req.method === "PUT") {
    if (!session?.isLoggedIn || !user?.permissions?.menu)
      return res
        .status(403)
        .json({ message: "Nie masz uprawnień do tej ścieżki!" });
    const { title, slug } = req.body;
    if (
      !titleRegex.test(title) &&
      !slugRegex.test(slug) &&
      title.length > 25 &&
      slug.length > 20
    )
      return res
        .status(400)
        .json({ message: "Nieprawidłowe parametry zapytania!" });

    const allItems = (await Menu.find({})).filter((item) => item.parent === "");
    const insertResult = await Menu.collection.insertOne({
      title,
      slug,
      on: true,
      custom: true,
      order: allItems.length + 1,
      parent: "",
      default: false,
      content: {},
    });

    if (!insertResult)
      return res
        .status(500)
        .json({ message: "Wystąpił problem przy wykonaniu zapytania!" });

    return res.status(200).json({ error: false });
  } else {
    return res.status(404);
  }
}
