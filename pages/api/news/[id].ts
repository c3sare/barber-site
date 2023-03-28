import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs/promises";
import path from "path";
import News from "@/models/News";
import dbConnect from "@/lib/dbConnect";
import { Types } from "mongoose";

export default withIronSessionApiRoute(newsRoute, sessionOptions);

const titleRegex =
  /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u;
const descRegex = /^(.|\s)*[a-zA-Z]+(.|\s)*$/;
const dateRegex = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;

async function newsRoute(req: NextApiRequest, res: NextApiResponse) {
  const session = req.session.user;
  await dbConnect();
  if (req.method === "GET") {
    if (session?.isLoggedIn || session?.permissions?.news)
      return res.status(403).json({ message: "Brak uprawnień do tej ścieżki" });

    const { id }: Partial<{ id: string }> = req.query;

    if (Types.ObjectId.isValid(id as string))
      return res
        .status(400)
        .json({ message: "Nieprawidłowe parametry zapytania!" });

    const newsDirectory = path.join(process.cwd(), "news");
    const _id = new Types.ObjectId(id);
    const data = News.findOne({ _id });

    if (data === null)
      return res
        .status(404)
        .json({ message: "Nie odnaleziono artykułu o id " + id });

    const content = await fs.readFile(`${newsDirectory}/${id}.json`, "utf-8");
    res.json({ ...data, content: content === "" ? "" : JSON.parse(content) });
  } else if (req.method === "POST") {
    if (!session?.isLoggedIn || !session?.permissions?.news)
      return res
        .status(403)
        .json({ message: "Brak uprawnień do tej ścieżki!" });

    const { title, desc, date, content } = req.body;
    const { id } = req.query;

    if (!Types.ObjectId.isValid(id as string))
      return res
        .status(400)
        .json({ message: "Nieprawidłowe parametry zapytania!" });

    if (!title || !desc || !date || !content)
      return res
        .status(400)
        .json({ message: "Nieprawidłowe parametry zapytania!" });

    if (
      !titleRegex.test(title) ||
      title.length === 0 ||
      title.length > 80 ||
      !descRegex.test(desc) ||
      desc.length === 0 ||
      desc.length > 400 ||
      !dateRegex.test(date)
    )
      return res
        .status(400)
        .json({ message: "Nieprawidłowe parametry zapytania!" });

    const _id = new Types.ObjectId(id as string);
    const update = await News.updateOne(
      { _id },
      { $set: { title, desc, date } }
    );
    if (update.acknowledged === undefined)
      return res
        .status(404)
        .json({ message: "Artykuł o id " + id + " nie istnieje" });

    const newsDirectory = path.join(process.cwd(), "news");
    fs.writeFile(
      `${newsDirectory}/${req.query.id}.json`,
      JSON.stringify(content),
      "utf-8"
    )
      .then(() => {
        return res.status(200).json({ error: false });
      })
      .catch((err) => {
        console.log(err);
        return res
          .status(500)
          .json({ message: "Wystąpił problem przy wykonywaniu zapytania!" });
      });
  } else {
    return res.status(404);
  }
}
