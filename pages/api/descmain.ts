import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import path from "path";
import fs from "fs/promises";
import { MongoClient } from "mongodb";
import getNewFileName from "@/utils/getNewFileName";
import Descmains from "@/models/DescMain";

export default withIronSessionApiRoute(descMainRoute, sessionOptions);

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

      const data: any = JSON.parse(fields.data as any);

      const keys = Object.keys(files);
      for (let i = 0; i < keys.length; i++) {
        const index = Number(keys[i].slice(-1));
        data.pros[index].img = files[keys[i]];
      }

      resolve({ ...data });
    });
  });
  const data = await formData;
  return data;
}

function checkData(title: string, desc: string) {
  const titleDescRegex = /^(.|\s)*[a-zA-Z]+(.|\s)*$/;
  if (
    titleDescRegex.test(title) &&
    title?.length > 0 &&
    title?.length <= 80 &&
    titleDescRegex.test(desc) &&
    desc?.length > 0 &&
    desc?.length <= 800
  )
    return true;
  else return false;
}

async function descMainRoute(req: NextApiRequest, res: NextApiResponse) {
  const session = req.session.user;
  if (req.method === "GET") {
    if (!session?.isLoggedIn && !session?.permissions?.menu)
      return res
        .status(403)
        .json({ message: "Nie posiadasz uprawnień do tej ścieżki!" });
    const data = await Descmains.findOne({});
    res.status(200).json(data);
  } else if (req.method === "POST") {
    if (!session?.isLoggedIn && !session?.permissions?.menu)
      return res
        .status(403)
        .json({ message: "Nie posiadasz uprawnień do tej ścieżki!" });

    const { title, description, pros }: any = await handlePostFormReq(req, res);

    if (!checkData(title, description))
      return res
        .status(400)
        .json({ message: "Parametry zapytania są nieprawidłowe!" });

    const pagesDirectory = path.join(process.cwd(), "public");

    await pros.forEach(async (item: any) => {
      if (typeof item.img === "object") {
        const newName = getNewFileName(item.img.originalFilename);
        const filedata = await fs.readFile(item.img.filepath);
        fs.appendFile(
          `${pagesDirectory}/images/${newName}`,
          Buffer.from(filedata.buffer)
        );
        item.img = newName;
      }
    });

    const client = new MongoClient(process.env.MONGO_URI as string);
    const database = client.db("site");
    const tab = database.collection("descmains");
    const insert = await tab.updateOne(
      {},
      { $set: { title, description, pros } }
    );
    if (!insert)
      return res
        .status(500)
        .json({ message: "Wystąpił problem przy aktualizacji danych!" });

    res.json({ error: false });
  } else {
    res.status(404);
  }
}
