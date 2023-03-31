import { sessionOptions } from "@/lib/AuthSession/Config";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import aws from "@/utils/aws";
import awsDeleteImage from "@/utils/awsDeleteImage";
import awsGetImages from "@/utils/awsGetImages";
import { withIronSessionApiRoute } from "iron-session/next";
import { Types } from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(infoRoute, sessionOptions);

async function infoRoute(req: NextApiRequest, res: NextApiResponse) {
  const session = req.session.user;
  await dbConnect();
  let user = null;
  if (session?.id && session.isLoggedIn) {
    user = await User.findOne({ _id: new Types.ObjectId(session?.id) });
  }
  if (req.method === "GET") {
    if (!session?.isLoggedIn || !user?.permissions?.basic)
      return res.status(403);

    const images = await awsGetImages();
    res.status(200).json(images);
  } else if (req.method === "DELETE") {
    if (!session?.isLoggedIn || !user?.permissions?.basic)
      return res.status(403);

    const { id } = req.body;

    const list = (await awsGetImages()) as any[];
    if (!list.find((item) => item.Key === id))
      return res
        .status(404)
        .json({ message: "Nie znaleziono grafiki o nazwie " + id });

    const del = await awsDeleteImage(id);

    if (!del)
      return res.status(500).json({ message: "Wystąpił błąd przy usuwaniu!" });

    res.status(200).json({ message: "Usunięto element" });
  } else if (req.method === "PUT") {
    if (!session?.isLoggedIn || !user?.permissions?.footer)
      return res
        .status(403)
        .json({ message: "Nie posiadasz uprawnień do tej ścieżki!" });

    const image = await aws(req.body);

    if (!image)
      return res.status(500).json({ message: "Wystąpił błąd przy zapisie!" });

    return res.json(image);
  } else {
    return res.status(404);
  }
}
