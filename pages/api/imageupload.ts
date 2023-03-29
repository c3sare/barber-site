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

async function handlePostFormReq(req: NextApiRequest, res: NextApiResponse) {
  const form = formidable({ multiples: true });

  const formData = new Promise((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        reject(err);
      }
      const file = files.file;
      resolve({ ...file });
    });
  });
  const data = await formData;
  return data;
}

async function uploadImageRoute(req: NextApiRequest, res: NextApiResponse) {
  const session = req.session.user;
  await dbConnect();
  let user = null;
  if (session?.id && session.isLoggedIn) {
    user = await User.findOne({ _id: new Types.ObjectId(session?.id) });
  }
  if (req.method === "POST") {
    if (!session?.isLoggedIn && !user?.permissions?.menu)
      return res
        .status(403)
        .json({ message: "Nie posiadasz uprawnień do tej ścieżki!" });

    const publicDir = path.join(process.cwd(), "public");
    const data: any = await handlePostFormReq(req, res);
    const fullName = getNewFileName(data.originalFilename);
    const filedata = await fs.readFile(data.filepath);

    fs.appendFile(
      `${publicDir}/images/${fullName}`,
      Buffer.from(filedata.buffer)
    )
      .then(() => res.status(200).json({ url: fullName }))
      .catch((err) => {
        console.log(err);
        return res
          .status(500)
          .json({ message: "Wystąpił błąd przy umieszczaniu pliku!" });
      });
  } else {
    res.status(404);
  }
}
