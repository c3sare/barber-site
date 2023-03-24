import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs/promises";
import path from "path";
import { MongoClient } from "mongodb";
import getNewFileName from "@/utils/getNewFileName";

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

      resolve({ ...files.logo });
    });
  });
  const data = await formData;
  return data;
}

export default withIronSessionApiRoute(footerLogoRoute, sessionOptions);

function checkData(image: any) {
  if (image.mimetype.indexOf("image") === 0 && image.size < 1024 * 1024 * 5)
    return true;
  else return false;
}

async function footerLogoRoute(req: NextApiRequest, res: NextApiResponse) {
  const user = req.session.user;
  if (req.method === "POST") {
    if (!user?.isLoggedIn || !user?.permissions?.footer)
      return res
        .status(403)
        .json({ message: "Nie posiadasz uprawnień do tej ścieżki!" });

    const publicDir = path.join(process.cwd(), "public");
    const image: any = await handlePostFormReq(req, res);
    if (checkData(image))
      return res
        .status(400)
        .json({ message: "Parametry zapytania są nieprawidłowe!" });

    const newName = getNewFileName(image.originalFilename);
    const filedata = await fs.readFile(image.filepath);
    fs.appendFile(
      `${publicDir}/images/${newName}`,
      Buffer.from(filedata.buffer)
    );
    const client = new MongoClient(process.env.MONGO_URI as string);
    const database = client.db("site");
    const tab = database.collection("footer");
    const oldFile = await tab.findOne({});
    const insert = await tab.updateOne({}, { $set: { logo: newName } });
    if (!insert.acknowledged)
      return res
        .status(500)
        .json({ message: "Wystąpił problem przy aktualizacji danych!" });
    if (oldFile) fs.unlink(`${publicDir}/images/${oldFile.img}`);

    return res.json({ error: false, img: newName });
  } else {
    return res.status(404);
  }
}
