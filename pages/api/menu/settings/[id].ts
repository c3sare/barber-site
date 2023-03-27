import { sessionOptions } from "@/lib/AuthSession/Config";
import Menu from "@/models/Menu";
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
  if (req.method === "GET") {
    if (!user?.isLoggedIn || !user?.permissions?.menu)
      return res
        .status(403)
        .json({ message: "Brak uprawnien do tej ścieżki!" });

    const { id } = req.query;

    if (!ObjectId.isValid(id as string))
      return res.status(400).json({ message: "Zapytanie jest nieprawidłowe!" });

    const item = await Menu.findOne({ _id: new ObjectId(id as string) });

    if (item === null)
      return res
        .status(404)
        .json({ message: "Nie odnaleziono ustawień dla id " + id });

    return res.status(200).json({
      _id: item._id,
      custom: item.custom,
      title: item.title,
      on: item.on,
      slug: item.slug,
      default: item.default,
    });
  } else if (req.method === "POST") {
    if (!user?.isLoggedIn || !user?.permissions?.menu)
      return res
        .status(403)
        .json({ message: "Brak uprawnien do tej ścieżki!" });

    const { id } = req.query;

    if (!ObjectId.isValid(id as string))
      return res.status(400).json({ message: "Zapytanie jest nieprawidłowe!" });

    const menu: MenuSettings = req.body;

    const titleRegex =
      /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u;
    const slugRegex = /^[a-z](-?[a-z])*$/;

    const allMenu = (await Menu.find({})).filter(
      (item) => String(item._id) !== id
    );
    const currentObject = await Menu.findOne({
      _id: new ObjectId(id as string),
    });
    if (currentObject === null)
      return res.status(404).json("Nie znaleziono obiektu o id " + id);

    if (
      allMenu.filter((item) => item.slug === menu?.slug).length > 0 ||
      (!currentObject.default && !menu.custom) ||
      (currentObject.default && menu.slug) ||
      (!currentObject.default && !menu.slug) ||
      menu?.title?.length <= 0 ||
      (!currentObject.default && menu?.slug?.length <= 0) ||
      menu?.title?.length <= 0 ||
      !titleRegex.test(menu?.title) ||
      (!slugRegex.test(menu?.slug) && !currentObject.default)
    )
      return res
        .status(400)
        .json({ message: "Nieprawidłowe parametry zapytania!" });

    const result = await Menu.updateOne(
      { _id: new ObjectId(id as string) },
      {
        $set: {
          custom: currentObject.default ? menu.custom || false : true,
          title: menu.title || currentObject.title,
          on:
            currentObject.slug === ""
              ? currentObject.on
              : menu.on || currentObject.on,
          slug: currentObject.default ? currentObject.slug : menu.slug,
        },
      }
    );

    if (!result)
      return res
        .status(500)
        .json({ message: "Wystąpił błąd przy wykonywaniu zapytania!" });

    return res.status(200).json({ error: false });
  }
}
