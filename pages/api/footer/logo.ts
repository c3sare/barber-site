import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { Types } from "mongoose";
import aws from "@/utils/aws";
import Footer from "@/models/Footer";
import awsGetImages from "@/utils/awsGetImages";

export const config = {
  api: {
    sizeLimit: "5mb",
  },
};

export default withIronSessionApiRoute(footerLogoRoute, sessionOptions);

async function footerLogoRoute(req: NextApiRequest, res: NextApiResponse) {
  const session = req.session.user;
  await dbConnect();
  let user = null;
  if (session?.id && session.isLoggedIn) {
    user = await User.findOne({ _id: new Types.ObjectId(session?.id) });
  }
  if (req.method === "POST") {
    if (!session?.isLoggedIn || !user?.permissions?.footer)
      return res
        .status(403)
        .json({ message: "Nie posiadasz uprawnień do tej ścieżki!" });

    const list = (await awsGetImages()) as any[];

    if (!list.find((item) => item.Key === req.body.name))
      return res
        .status(404)
        .json({ message: "Nie znaleziono wybranego obrazu!" });

    const update = await Footer.updateOne(
      {},
      {
        $set: {
          logo: req.body.name,
        },
      }
    );

    if (!update)
      return res.status(500).json({ message: "Wystąpił nieoczekiwany błąd!" });

    return res.json({ error: false });
  } else {
    return res.status(404);
  }
}
