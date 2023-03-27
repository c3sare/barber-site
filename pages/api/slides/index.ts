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

      resolve({ ...{ ...fields, ...files } });
    });
  });
  const data = await formData;
  return data;
}

export default withIronSessionApiRoute(slidesRoute, sessionOptions);

function checkData({ image, title, desc }: any) {
  const titleDescRegex = /^(.|\s)*[a-zA-Z]+(.|\s)*$/;
  if (
    title &&
    image &&
    desc &&
    titleDescRegex.test(title) &&
    title.length > 0 &&
    title.length <= 80 &&
    titleDescRegex.test(desc) &&
    desc.length > 0 &&
    desc.length <= 800 &&
    image.mimetype.indexOf("image") === 0 &&
    image.size < 1024 * 1024 * 5
  )
    return true;
  else return false;
}

async function slidesRoute(req: NextApiRequest, res: NextApiResponse) {
  const session = req.session.user;
  if (req.method === "GET") {
    if (!session?.isLoggedIn || !session?.permissions?.menu)
      return res
        .status(403)
        .json({ message: "Nie masz uprawnień do tej ścieżki!" });

    const data = await Slide.find({});
    res.status(200).json(data);
  } else if (req.method === "DELETE") {
    if (!session?.isLoggedIn || !session?.permissions?.menu)
      return res
        .status(403)
        .json({ message: "Nie masz uprawnień do tej ścieżki!" });

    const { id }: any = await handlePostFormReq(req, res);

    if (!id || !ObjectId.isValid(id as string))
      return res
        .status(400)
        .json({ message: "Nieprawidłowe parametry zapytania!" });

    const _id = new ObjectId(id);

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
    const { image, title, desc }: any = await handlePostFormReq(req, res);
    if (!checkData({ image, title, desc }))
      return res
        .status(400)
        .json({ message: "Nieprawidłowe parametry zapytania!" });

    const newName = getNewFileName(image.originalFilename);
    const filedata = await fs.readFile(image.filepath);

    fs.appendFile(
      `${publicDir}/images/${newName}`,
      Buffer.from(filedata.buffer)
    );

    const insert = await Slide.collection.insertOne({
      title,
      desc,
      image: newName,
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
