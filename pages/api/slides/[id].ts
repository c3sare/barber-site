import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import Slide from "@/models/Slide";
import dbConnect from "@/lib/dbConnect";
import { Types } from "mongoose";
import User from "@/models/User";
import awsGetImages from "@/utils/awsGetImages";

export default withIronSessionApiRoute(slidesRoute, sessionOptions);

async function checkData({ title, desc, image }: any) {
  const titleDescRegex = /^(.|\s)*[a-zA-Z]+(.|\s)*$/;
  if (
    titleDescRegex.test(title) &&
    title.length > 0 &&
    title.length <= 80 &&
    titleDescRegex.test(desc) &&
    desc.length > 0 &&
    desc.length <= 800
  ) {
    const images = (await awsGetImages()) as any[];
    if (images.find((item) => item.Key === image)) {
      return true;
    } else {
      return false;
    }
  } else return false;
}

async function slidesRoute(req: NextApiRequest, res: NextApiResponse) {
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
        .json({ message: "Brak uprawnień dla tej ścieżki!" });

    const {
      title,
      desc,
      image,
    }: { title: string; desc: string; image: string } = req.body;

    const { id } = req.query;

    if (!title || !desc || !image || !Types.ObjectId.isValid(id as string))
      return res
        .status(400)
        .json({ message: "Nieprawidłowe parametry zapytania!" });

    const check = await checkData({ title, desc, image });

    if (!check)
      return res
        .status(400)
        .json({ message: "Nieprawidłowe parametry zapytania!" });

    const _id = new Types.ObjectId(id as string);
    const exist = await Slide.findOne({ _id });

    if (!exist)
      return res
        .status(404)
        .json({ message: "Nie odnaleziono artykułu o id " + id });

    const update = await Slide.updateOne(
      { _id },
      { $set: { title, desc, image } }
    );

    if (!update)
      res
        .status(500)
        .json({ message: "Wystąpił problem przy wykonywaniu zapytania!" });

    res.status(200).json({ error: false });
  } else {
    res.status(404);
  }
}
