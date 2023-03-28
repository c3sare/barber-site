import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs/promises";
import path from "path";
import getNewFileName from "@/utils/getNewFileName";
import News from "@/models/News";
import dbConnect from "@/lib/dbConnect";
import { Types } from "mongoose";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function handlePostFormReq(req: NextApiRequest, res: NextApiResponse) {
  const form = formidable({ multiples: true });

  const formData = new Promise((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        reject(err);
      }

      resolve({ ...files.img });
    });
  });
  const data = await formData;
  return data;
}

export default withIronSessionApiRoute(newsRoute, sessionOptions);

function checkData(image: any) {
  if (image.mimetype.indexOf("image") === 0 && image.size < 1024 * 1024 * 5)
    return true;
  else return false;
}

async function newsRoute(req: NextApiRequest, res: NextApiResponse) {
  const user = req.session.user;
  await dbConnect();
  if (req.method === "POST") {
    if (!user?.isLoggedIn || !user?.permissions?.news)
      return res
        .status(403)
        .json({ message: "Nie posiadasz uprawnień do tej ścieżki!" });

    const { id }: Partial<{ id: string }> = req.query;

    if (!Types.ObjectId.isValid(id as string))
      return res
        .status(400)
        .json({ message: "Nieprawidłowe parametry zapytania!" });

    const image: any = await handlePostFormReq(req, res);

    if (!checkData(image))
      return res
        .status(400)
        .json({ message: "Nieprawidłowe parametry zapytania!" });

    const publicDir = path.join(process.cwd(), "public");
    const newName = getNewFileName(image.originalFilename);
    const filedata = await fs.readFile(image.filepath);
    fs.appendFile(
      `${publicDir}/images/articles/${newName}`,
      Buffer.from(filedata.buffer)
    );
    const _id = new Types.ObjectId(id as string);
    const oldFile = await News.findOne({ _id });

    if (oldFile === null)
      return res
        .status(404)
        .json({ message: "Nie znaleziono artykułu o id " + id });

    const insert = await News.updateOne({ _id }, { $set: { img: newName } });
    if (insert.acknowledged === undefined)
      return res
        .status(500)
        .json({ message: "Wystąpił problem przy wykonaniu zapytania!" });

    if (oldFile !== null)
      fs.unlink(`${publicDir}/images/articles/${oldFile.img}`);

    res.status(200).json({ error: false, img: newName });
  } else {
    return res.status(404);
  }
}
