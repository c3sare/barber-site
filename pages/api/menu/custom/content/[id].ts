import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs/promises";
import path from "path";
import { Types } from "mongoose";

export default withIronSessionApiRoute(customPageContentRoute, sessionOptions);

async function customPageContentRoute(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = req.session.user;
  const { id } = req.query;

  const pagesDir = path.join(process.cwd(), "pagecontent");
  if (req.method === "GET") {
    if (!user?.isLoggedIn || !user?.permissions?.menu)
      return res
        .status(403)
        .json({ message: "Nie masz uprawnień do tej ścieżki!" });

    if (!Types.ObjectId.isValid(id as string))
      return res.status(500).json({ message: "Zapytanie jest nieprawidłowe!" });

    fs.readFile(`${pagesDir}/${id}.json`, { encoding: "utf-8" })
      .then((data) => JSON.parse(data))
      .then((data) => res.status(200).json(data))
      .catch((err) => {
        console.log(err);
        res.status(404);
      });
  } else if (req.method === "POST") {
    if (!user?.isLoggedIn || !user?.permissions?.menu)
      return res
        .status(403)
        .json({ message: "Nie posiadasz uprawnień do tej strony!" });

    if (!Types.ObjectId.isValid(id as string))
      return res.status(500).json({ message: "Zapytanie jest nieprawidłowe!" });

    try {
      await fs.access(`${pagesDir}/${id}.json`);
      return fs
        .writeFile(`${pagesDir}/${id}.json`, JSON.stringify(req.body), "utf-8")
        .catch((err) => {
          console.log(err);
          return res
            .status(500)
            .json({ message: "Wystąpił problem z zapisem!" });
        })
        .then(() => res.status(200).json({ error: false }));
    } catch {
      console.error("Cannot access file " + id + ".json");
      return res.status(404);
    }
  } else {
    return res.status(404);
  }
}
