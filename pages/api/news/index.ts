import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs/promises";
import formidable from "formidable";
import getNewFileName from "@/utils/getNewFileName";
import News from "@/models/News";
import dbConnect from "@/lib/dbConnect";
import { Types } from "mongoose";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default withIronSessionApiRoute(infoRoute, sessionOptions);

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

const titleRegex =
  /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u;
const descRegex = /^(.|\s)*[a-zA-Z]+(.|\s)*$/;
const dateRegex = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;

async function infoRoute(req: NextApiRequest, res: NextApiResponse) {
  const session = req.session.user;
  await dbConnect();
  if (req.method === "GET") {
    if (!session?.isLoggedIn || !session?.permissions?.news)
      return res
        .status(403)
        .json({ message: "Nie masz uprawnień do tej ścieżki!" });

    const data = await News.find({});
    res.status(200).json(data);
  } else if (req.method === "PUT") {
    if (!session?.isLoggedIn || !session?.permissions?.news)
      return res
        .status(403)
        .json({ message: "Nie masz uprawnień do tej ścieżki!" });

    const { title, desc, date, content, img }: any = await handlePostFormReq(
      req,
      res
    );

    if (!title || !desc || !date || !content || !img)
      return res
        .status(400)
        .json({ message: "Nieprawidłowe parametry zapytania!" });

    if (
      !titleRegex.test(title) ||
      title.length === 0 ||
      title.length > 80 ||
      !descRegex.test(desc) ||
      desc.length === 0 ||
      desc.length > 400 ||
      !dateRegex.test(date) ||
      img?.mimetype?.indexOf("image") !== 0 ||
      img?.size > 1024 * 1024 * 5
    )
      return res
        .status(400)
        .json({ message: "Nieprawidłowe parametry zapytania!" });

    const publicDir = path.join(process.cwd(), "public");
    const newsDir = path.join(process.cwd(), "news");
    const newName = getNewFileName(img.originalFilename);
    const filedata = await fs.readFile(img.filepath);
    fs.appendFile(
      `${publicDir}/images/articles/${newName}`,
      Buffer.from(filedata.buffer)
    );

    const insert = await News.collection.insertOne({
      title,
      desc,
      date,
      img: newName,
    });
    if (insert.acknowledged === undefined)
      return res
        .status(500)
        .json({ message: "Wystąpił błąd przy wykonywaniu zapytania!" });

    fs.writeFile(`${newsDir}/${insert.insertedId}.json`, content, "utf-8");

    return res.status(200).json({ error: false });
  } else if (req.method === "DELETE") {
    if (!session?.isLoggedIn || !session?.permissions?.news)
      return res
        .status(403)
        .json({ message: "Nie masz uprawnień do tej ścieżki!" });

    const { id }: any = await handlePostFormReq(req, res);

    if (!Types.ObjectId.isValid(id))
      return res
        .status(400)
        .json({ message: "Nieprawidłowe parametry zapytania!" });

    const _id = new Types.ObjectId(id);
    const toDelete = await News.findOne({ _id });

    if (toDelete === null)
      return res
        .status(404)
        .json({ message: "Nie odnaleziono artykułu o id " + id });

    const del = await News.deleteOne({ _id });
    if (del.deletedCount !== 1)
      return res
        .status(500)
        .json({ message: "Wystąpił problem przy wykonywaniu zapytania!" });

    const publicDir = path.join(process.cwd(), "public");
    const newsDir = path.join(process.cwd(), "news");
    fs.unlink(`${publicDir}/images/articles/${toDelete!.img}`);
    fs.unlink(`${newsDir}/${id}.json`);
    return res.status(200).json({ error: false });
  } else {
    return res.status(404);
  }
}
