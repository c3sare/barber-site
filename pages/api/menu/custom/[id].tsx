import { sessionOptions } from "@/lib/AuthSession/Config";
import dbConnect from "@/lib/dbConnect";
import Menu from "@/models/Menu";
import { withIronSessionApiRoute } from "iron-session/next";
import { Types } from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(customPageRoute, sessionOptions);

interface MenuSettings {
  _id: string;
  title: string;
  on: boolean;
  slug: string;
  custom: boolean;
}

const titleRegex =
  /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u;
const slugRegex = /^[a-z](-?[a-z])*$/;

async function customPageRoute(req: NextApiRequest, res: NextApiResponse) {
  const user = req.session.user;
  await dbConnect();
  if (req.method === "GET") {
    if (!user?.isLoggedIn || !user?.permissions?.menu)
      return res
        .status(403)
        .json({ message: "Brak uprawnień do tej ścieżki!" });

    const { id } = req.query;

    if (!Types.ObjectId.isValid(id as string))
      return res.status(400).json({ message: "Zapytanie jest nieprawidłowe!" });

    const item = await Menu.findOne({ _id: new Types.ObjectId(id as string) });

    if (item !== null) {
      res.json({
        _id: item._id,
        custom: item.custom,
        title: item.title,
        on: item.on,
        slug: item.slug,
        default: item.default,
      });
    } else {
      res.json({});
    }
  } else if (req.method === "POST") {
    if (!user?.isLoggedIn || !user?.permissions?.menu)
      return res
        .status(403)
        .json({ message: "Brak uprawnień do tej ścieżki!" });

    const { id } = req.query;
    const menu: MenuSettings = req.body;

    const allMenu = (await Menu.find({})).filter(
      (item) => String(item._id) !== id
    );
    const currentObject = await Menu.findOne({
      _id: new Types.ObjectId(id as string),
    });
    if (currentObject === null)
      return res
        .status(500)
        .json({ message: "Wystąpił problem przy zapisie!" });

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
    ) {
      return res
        .status(500)
        .json({ message: "Wystąpił problem przy zapisie!" });
    }

    const result = await Menu.updateOne(
      { _id: new Types.ObjectId(id as string) },
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
    if (!result.acknowledged)
      return res
        .status(500)
        .json({ message: "Wystąpił problem przy zapisie!" });

    return res.status(200).json({ error: false });
  } else {
    return res.status(404);
  }
}
