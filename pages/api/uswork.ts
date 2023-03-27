import { sessionOptions } from "@/lib/AuthSession/Config";
import formidable from "formidable";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs/promises";
import path from "path";
import { MongoClient, ObjectId } from "mongodb";
import getNewFileName from "@/utils/getNewFileName";

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
  if (req.method === "PUT") {
    if (!session?.isLoggedIn || !session?.permissions?.menu)
      return res
        .status(403)
        .json({ message: "Nie masz uprawnień do tej ścieżki!" });

    const data: any = await handlePostFormReq(req, res);
    const fullName = getNewFileName(data.originalFilename);

    const client = new MongoClient(process.env.MONGO_URI as string);
    const database = client.db("site");
    const tab = database.collection("usworks");
    const insert = await tab.insertOne({ image: fullName });

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
    if (!session?.isLoggedIn || !session?.permissions?.menu)
      return res
        .status(403)
        .json({ message: "Nie masz uprawnień do tej ścieżki!" });

    const { id } = (await handleId(req, res)) as { id: string };

    if (!ObjectId.isValid(id))
      return res
        .status(400)
        .json({ message: "Nieprawidłowe parametry zapytania!" });

    const client = new MongoClient(process.env.MONGO_URI as string);
    const database = client.db("site");
    const tab = database.collection("usworks");
    const _id = new ObjectId(id);
    const itemToDelete = await tab.findOne({ _id });

    if (!itemToDelete)
      return res
        .status(404)
        .json({ message: "Nie odnaleziono obiektu o id " + id });

    const delItem = await tab.deleteOne({ _id });
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
