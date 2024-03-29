import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs/promises";
import path from "path";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Menu from "@/models/Menu";

export default withIronSessionApiRoute(customPageContentRoute, sessionOptions);

async function customPageContentRoute(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = req.session.user;
  const { id } = req.query;

  const pagesDir = path.join(process.cwd(), "pagecontent");
  await dbConnect();
  let user = null;
  if (session?.id && session.isLoggedIn) {
    user = await User.findOne({ _id: new Types.ObjectId(session?.id) });
  }
  if (req.method === "GET") {
    if (!session?.isLoggedIn || !user?.permissions?.menu)
      return res
        .status(403)
        .json({ message: "Nie masz uprawnień do tej ścieżki!" });

    if (!Types.ObjectId.isValid(id as string))
      return res.status(500).json({ message: "Zapytanie jest nieprawidłowe!" });

    const page = await Menu.findOne({ _id: new Types.ObjectId(id as string) });

    if (!page || !page?.custom)
      return res.status(404).json({ message: "Nie znaleziono takiej strony!" });

    return res.status(200).json(page.content);
    // fs.readFile(`${pagesDir}/${id}.json`, { encoding: "utf-8" })
    //   .then((data) => JSON.parse(data))
    //   .then((data) => res.status(200).json(data))
    //   .catch((err) => {
    //     console.log(err);
    //     res.status(404);
    //   });
  } else if (req.method === "POST") {
    if (!session?.isLoggedIn || !user?.permissions?.menu)
      return res
        .status(403)
        .json({ message: "Nie posiadasz uprawnień do tej strony!" });

    if (!Types.ObjectId.isValid(id as string))
      return res.status(500).json({ message: "Zapytanie jest nieprawidłowe!" });

    const updatePage = await Menu.updateOne(
      { _id: new Types.ObjectId(id as string) },
      {
        $set: {
          content: req.body,
        },
      }
    );

    if (!updatePage)
      return res
        .status(500)
        .json({ message: "Wystąpił problem przy zapisie do bazy!" });

    return res.status(200).json({ error: false });
    // try {
    //   await fs.access(`${pagesDir}/${id}.json`);
    //   return fs
    //     .writeFile(`${pagesDir}/${id}.json`, JSON.stringify(req.body), "utf-8")
    //     .catch((err) => {
    //       console.log(err);
    //       return res
    //         .status(500)
    //         .json({ message: "Wystąpił problem z zapisem!" });
    //     })
    //     .then(() => res.status(200).json({ error: false }));
    // } catch {
    //   console.error("Cannot access file " + id + ".json");
    //   return res.status(404);
    // }
  } else {
    return res.status(404);
  }
}
