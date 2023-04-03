import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs/promises";
import path from "path";
import getNewFileName from "@/utils/getNewFileName";
import Slide from "@/models/Slide";
import dbConnect from "@/lib/dbConnect";
import { Types } from "mongoose";
import User from "@/models/User";
import awsGetImages from "@/utils/awsGetImages";

export default withIronSessionApiRoute(slidesRoute, sessionOptions);

function checkData({ title, desc }: any) {
  const titleDescRegex = /^(.|\s)*[a-zA-Z]+(.|\s)*$/;
  if (
    title &&
    desc &&
    titleDescRegex.test(title) &&
    title.length > 0 &&
    title.length <= 80 &&
    titleDescRegex.test(desc) &&
    desc.length > 0 &&
    desc.length <= 800
  )
    return true;
  else return false;
}

async function slidesRoute(req: NextApiRequest, res: NextApiResponse) {
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
        .json({ message: "Nie masz uprawnień do tej ścieżki!" });

    const data = await Slide.find({});
    res.status(200).json(data);
  } else if (req.method === "DELETE") {
    if (!session?.isLoggedIn || !user?.permissions?.menu)
      return res
        .status(403)
        .json({ message: "Nie masz uprawnień do tej ścieżki!" });

    const { id }: any = req.body;

    if (!id || !Types.ObjectId.isValid(id as string))
      return res
        .status(400)
        .json({ message: "Nieprawidłowe parametry zapytania!" });

    const _id = new Types.ObjectId(id);

    const exist = await Slide.findOne({ _id });

    if (!exist)
      return res
        .status(404)
        .json({ message: "Slajd o id " + id + " nie istnieje!" });

    const del = await Slide.deleteOne({ _id });
    if (!del)
      return res
        .status(500)
        .json({ message: "Wystąpił błąd poczas wykonywania zapytania!" });

    res.json({ error: false });
  } else if (req.method === "PUT") {
    const publicDir = path.join(process.cwd(), "public");
    const { image, title, desc }: any = req.body;
    if (!checkData({ image, title, desc }))
      return res
        .status(400)
        .json({ message: "Nieprawidłowe parametry zapytania!" });

    const images = (await awsGetImages()) as any[];

    if (!images.find((item) => item.Key === image))
      return res
        .status(400)
        .json({ message: "Nieprawidłowe parametry zapytania!" });

    const insert = await Slide.collection.insertOne({
      title,
      desc,
      image,
    });

    if (!insert)
      return res
        .status(500)
        .json({ message: "Wystąpił błąd poczas wykonywania zapytania!" });

    res.status(200).json({ error: false });
  } else {
    res.status(404);
  }
}
