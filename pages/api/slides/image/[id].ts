import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs/promises";
import path from "path";
import { ObjectId } from "mongodb";
import getNewFileName from "@/utils/getNewFileName";
import Slide from "@/models/Slide";

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

      resolve({ ...files.image });
    });
  });
  const data = await formData;
  return data;
}

export default withIronSessionApiRoute(slidesRoute, sessionOptions);

function checkData(image: any) {
  if (image.mimetype.indexOf("image") === 0 && image.size < 1024 * 1024 * 5)
    return true;
  else return false;
}

async function slidesRoute(req: NextApiRequest, res: NextApiResponse) {
  const session = req.session.user;
  if (req.method === "POST") {
    if (!session?.isLoggedIn || !session?.permissions?.menu)
      return res
        .status(403)
        .json({ message: "Brak uprawnień dla tej ścieżki!" });

    const { id } = req.query;

    if (!ObjectId.isValid(id as string))
      return res.status(400).json("Nieprawidłowe parametry zapytania!");

    const publicDir = path.join(process.cwd(), "public");
    const image: any = await handlePostFormReq(req, res);
    if (!checkData(image))
      return res
        .status(400)
        .json({ message: "Nieprawidłowe parametry zapytania!" });

    const _id = new ObjectId(id as string);
    const oldFile = await Slide.findOne({ _id });

    if (!oldFile)
      return res
        .status(404)
        .json({ message: "Nie znaleziono artykułu o id " + id });

    const newName = getNewFileName(image.originalFilename);
    const filedata = await fs.readFile(image.filepath);
    fs.appendFile(
      `${publicDir}/images/${newName}`,
      Buffer.from(filedata.buffer)
    );
    fs.unlink(`${publicDir}/images/${oldFile.image}`);

    const insert = await Slide.updateOne({ _id }, { $set: { image: newName } });

    if (!insert)
      return res
        .status(500)
        .json({ message: "Wystąpił problem przy wykonywaniu zapytania!" });

    res.status(200).json({ error: false, image: newName });
  } else {
    res.status(404);
  }
}
