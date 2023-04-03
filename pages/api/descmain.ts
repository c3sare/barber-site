import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import path from "path";
import fs from "fs/promises";
import getNewFileName from "@/utils/getNewFileName";
import Descmains from "@/models/DescMain";
import Descmain from "@/models/DescMain";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { Types } from "mongoose";
import awsGetImages from "@/utils/awsGetImages";

export default withIronSessionApiRoute(descMainRoute, sessionOptions);

function checkData(title: string, desc: string) {
  const titleDescRegex = /^(.|\s)*[a-zA-Z]+(.|\s)*$/;
  if (
    titleDescRegex.test(title) &&
    title?.length > 0 &&
    title?.length <= 80 &&
    titleDescRegex.test(desc) &&
    desc?.length > 0 &&
    desc?.length <= 800
  )
    return true;
  else return false;
}

async function descMainRoute(req: NextApiRequest, res: NextApiResponse) {
  const session = req.session.user;
  await dbConnect();
  let user = null;
  if (session?.id && session.isLoggedIn) {
    user = await User.findOne({ _id: new Types.ObjectId(session?.id) });
  }
  if (req.method === "GET") {
    if (!session?.isLoggedIn && !user?.permissions?.menu)
      return res
        .status(403)
        .json({ message: "Nie posiadasz uprawnień do tej ścieżki!" });
    const data = await Descmains.findOne({});
    res.status(200).json(data);
  } else if (req.method === "POST") {
    if (!session?.isLoggedIn && !user?.permissions?.menu)
      return res
        .status(403)
        .json({ message: "Nie posiadasz uprawnień do tej ścieżki!" });

    const { title, description, pros }: any = req.body;

    if (!checkData(title, description))
      return res
        .status(400)
        .json({ message: "Parametry zapytania są nieprawidłowe!" });

    const images = (await awsGetImages()) as any[];
    const results: boolean[] = [];

    pros.forEach((item: any) => {
      results.push(Boolean(images.find((img) => img.Key === item.img)));
    });

    if (results.find((item) => item === false))
      return res
        .status(400)
        .json({ message: "Parametry zapytania są nieprawidłowe!" });

    const insert = await Descmain.updateOne(
      {},
      { $set: { title, description, pros } }
    );
    if (!insert)
      return res
        .status(500)
        .json({ message: "Wystąpił problem przy aktualizacji danych!" });

    res.json({ error: false });
  } else {
    res.status(404);
  }
}
