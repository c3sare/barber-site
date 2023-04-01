import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import News from "@/models/News";
import dbConnect from "@/lib/dbConnect";
import { Types } from "mongoose";
import User from "@/models/User";
import awsGetImages from "@/utils/awsGetImages";

function slugify(title: string) {
  return title
    .toString()
    .normalize("NFD") // split an accented letter in the base letter and the acent
    .replace(/[\u0300-\u036f]/g, "") // remove all previously split accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]/g, "") // remove all chars not letters, numbers and spaces (to be replaced)
    .replace(/\s+/g, "-");
}

export default withIronSessionApiRoute(infoRoute, sessionOptions);

const titleRegex =
  /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u;
const descRegex = /^(.|\s)*[a-zA-Z]+(.|\s)*$/;
const dateRegex = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;

async function infoRoute(req: NextApiRequest, res: NextApiResponse) {
  const session = req.session.user;
  await dbConnect();
  let user = null;
  if (session?.id && session.isLoggedIn) {
    user = await User.findOne({ _id: new Types.ObjectId(session?.id) });
  }
  if (req.method === "GET") {
    if (!session?.isLoggedIn || !user?.permissions?.news)
      return res
        .status(403)
        .json({ message: "Nie masz uprawnień do tej ścieżki!" });

    const data = await News.find({});
    res.status(200).json(data);
  } else if (req.method === "PUT") {
    if (!session?.isLoggedIn || !user?.permissions?.news)
      return res
        .status(403)
        .json({ message: "Nie masz uprawnień do tej ścieżki!" });

    const { title, desc, date, content, img }: any = req.body;
    console.log(req.body);
    if (!title || !desc || !date || !content || !img)
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

    const imageList = (await awsGetImages()) as any[];

    if (!imageList.find((item) => item.Key === img))
      return res
        .status(404)
        .json({ message: "Nie odnaleziono obrazu do użycia!" });

    const insert = await News.collection.insertOne({
      title,
      desc,
      date,
      img,
      slug: slugify(title),
      content,
    });
    if (!insert.acknowledged)
      return res
        .status(500)
        .json({ message: "Wystąpił błąd przy wykonywaniu zapytania!" });

    return res.status(200).json({ error: false });
  } else if (req.method === "DELETE") {
    if (!session?.isLoggedIn || !user?.permissions?.news)
      return res
        .status(403)
        .json({ message: "Nie masz uprawnień do tej ścieżki!" });

    const { id }: any = req.body;

    if (!Types.ObjectId.isValid(id))
      return res
        .status(400)
        .json({ message: "Nieprawidłowe parametry zapytania!" });

    const _id = new Types.ObjectId(id);
    const toDelete = await News.findOne({ _id });

    if (toDelete === null)
      return res
        .status(404)
        .json({ message: "Nie odnaleziono artykułu o id " + id });

    const del = await News.deleteOne({ _id });
    if (del.deletedCount !== 1)
      return res
        .status(500)
        .json({ message: "Wystąpił problem przy wykonywaniu zapytania!" });

    return res.status(200).json({ error: false });
  } else {
    return res.status(404);
  }
}
