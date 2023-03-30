import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs/promises";
import path from "path";
import formidable from "formidable";
import getNewFileName from "@/utils/getNewFileName";
import dbConnect from "@/lib/dbConnect";
import { Types } from "mongoose";
import User from "@/models/User";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default withIronSessionApiRoute(uploadImageRoute, sessionOptions);

async function uploadImageRoute(req: NextApiRequest, res: NextApiResponse) {
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

    const list = await fs.readdir(process.cwd() + "/public/images");
    res.json({ dir: list });
  } else {
    res.status(404);
  }
}
