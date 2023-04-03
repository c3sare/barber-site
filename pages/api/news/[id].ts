import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import News from "@/models/News";
import dbConnect from "@/lib/dbConnect";
import { Types } from "mongoose";
import User from "@/models/User";
import awsGetImages from "@/utils/awsGetImages";

export default withIronSessionApiRoute(newsRoute, sessionOptions);

const titleRegex =
  /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u;
const descRegex = /^(.|\s)*[a-zA-Z]+(.|\s)*$/;
const dateRegex = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;

async function newsRoute(req: NextApiRequest, res: NextApiResponse) {
  const session = req.session.user;
  await dbConnect();
  let user = null;
  if (session?.id && session.isLoggedIn) {
    user = await User.findOne({ _id: new Types.ObjectId(session?.id) });
  }
  if (req.method === "GET") {
    if (!session?.isLoggedIn || !user?.permissions?.news)
      return res.status(403).json({ message: "Brak uprawnień do tej ścieżki" });

    const { id }: Partial<{ id: string }> = req.query;

    if (Types.ObjectId.isValid(id as string))
      return res
        .status(400)
        .json({ message: "Nieprawidłowe parametry zapytania!" });

    const _id = new Types.ObjectId(id);
    const data = await News.findOne({ _id });

    if (!data)
      return res
        .status(404)
        .json({ message: "Nie odnaleziono artykułu o id " + id });

    data.content = JSON.parse(data.content);

    res.status(200).json(data);
  } else if (req.method === "POST") {
    if (!session?.isLoggedIn || !user?.permissions?.news)
      return res
        .status(403)
        .json({ message: "Brak uprawnień do tej ścieżki!" });

    const { title, desc, date, content, img } = req.body;
    const { id } = req.query;

    console.log(req.body);

    if (!Types.ObjectId.isValid(id as string))
      return res
        .status(400)
        .json({ message: "Nieprawidłowe parametry zapytania!" });

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
        .json({ message: "Nie znaleziono wybranej grafiki!" });

    const _id = new Types.ObjectId(id as string);
    const find = await News.findOne({ _id });
    console.log(find);
    const update = await News.collection.updateOne(
      { _id },
      {
        $set: {
          title,
          desc,
          date,
          img,
          content: JSON.stringify(content),
        },
      }
    );
    console.log(update);
    if (!update.acknowledged)
      return res
        .status(404)
        .json({ message: "Artykuł o id " + id + " nie istnieje" });

    return res.status(200).json({ error: false });
  } else {
    return res.status(404);
  }
}
