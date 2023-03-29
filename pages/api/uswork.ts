import { sessionOptions } from "@/lib/AuthSession/Config";
import formidable from "formidable";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs/promises";
import path from "path";
import getNewFileName from "@/utils/getNewFileName";
import Uswork from "@/models/Uswork";
import dbConnect from "@/lib/dbConnect";
import { Types } from "mongoose";
import User from "@/models/User";

export default withIronSessionApiRoute(usworkRoute, sessionOptions);

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

async function handleId(req: NextApiRequest, res: NextApiResponse) {
  const form = formidable({ multiples: true });

  const formData = new Promise((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        reject(err);
      }
      const field = fields;
      resolve({ ...field });
    });
  });
  const data = await formData;
  return data;
}

async function usworkRoute(req: NextApiRequest, res: NextApiResponse) {
  const session = req.session.user;
  await dbConnect();
  let user = null;
  if (session?.id && session.isLoggedIn) {
    user = await User.findOne({ _id: new Types.ObjectId(session?.id) });
  }
  if (req.method === "PUT") {
    if (!session?.isLoggedIn || !user?.permissions?.menu)
      return res
        .status(403)
        .json({ message: "Nie masz uprawnień do tej ścieżki!" });

    const data: any = await handlePostFormReq(req, res);
    const fullName = getNewFileName(data.originalFilename);

    const insert = await Uswork.collection.insertOne({ image: fullName });

    if (!insert)
      return res
        .status(500)
        .json({ message: "Wystąpił błąd przy wykonywaniu zapytania!" });

    const publicDir = path.join(process.cwd(), "public");
    const filedata = await fs.readFile(data.filepath);
    fs.appendFile(
      `${publicDir}/images/uswork/${fullName}`,
      Buffer.from(filedata.buffer)
    );
    res.json({ error: false, _id: insert.insertedId, image: fullName });
  } else if (req.method === "DELETE") {
    if (!session?.isLoggedIn || !user?.permissions?.menu)
      return res
        .status(403)
        .json({ message: "Nie masz uprawnień do tej ścieżki!" });

    const { id } = (await handleId(req, res)) as { id: string };

    if (!Types.ObjectId.isValid(id))
      return res
        .status(400)
        .json({ message: "Nieprawidłowe parametry zapytania!" });

    const _id = new Types.ObjectId(id);
    const itemToDelete = await Uswork.findOne({ _id });

    if (!itemToDelete)
      return res
        .status(404)
        .json({ message: "Nie odnaleziono obiektu o id " + id });

    const delItem = await Uswork.deleteOne({ _id });
    if (!delItem)
      return res
        .status(500)
        .json({ message: "Wystąpił błąd przy usuwaniu obiektu!" });

    const usworkDirectory = path.join(process.cwd(), "public");
    fs.unlink(`${usworkDirectory}/images/uswork/${itemToDelete!.image}`);
    res.json({ error: false });
  } else {
    res.status(404);
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
