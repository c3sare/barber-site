import { sessionOptions } from "@/lib/AuthSession/Config";
import getData from "@/utils/getData";
import { withIronSessionApiRoute } from "iron-session/next";
import { MongoClient } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs/promises";
import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false
  }
};

export default withIronSessionApiRoute(infoRoute, sessionOptions);

function getNewFileName(orgName:string) {
  const withoutExt = orgName?.slice(0, orgName.lastIndexOf("."));
  const ext = orgName?.slice(orgName.lastIndexOf("."));
  const genFragment = Math.random().toString(36).slice(2);
  return withoutExt+"_"+genFragment+ext;
}

async function handlePostFormReq(req:NextApiRequest, res:NextApiResponse) {
  const form = formidable({ multiples: true });

  const formData = new Promise((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        reject(err);
      }

      resolve({ ...{...fields, ...files} });
    });
  });
  const data = await formData;
  return data;
}

const titleDescRegex = /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u;
const dateRegex = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;

async function infoRoute(req: NextApiRequest, res: NextApiResponse) {
  if(req.method === "GET") {
    const session = req.session.user;
    if(session?.isLoggedIn && session.permissions.news) {
        const data = await getData("news");

        res.json(data);
    } else {
        res.json({error: true});
    }
  } else if(req.method === "PUT") {
    const session = req.session.user;
    const {title, desc, date, content, img}:any = await handlePostFormReq(req, res);
    if(
      session?.isLoggedIn &&
      session.permissions.news &&
      titleDescRegex.test(title) &&
      title?.length > 0 &&
      title?.length <= 80 &&
      titleDescRegex.test(desc) &&
      desc.length > 0 &&
      desc.length <= 400 &&
      dateRegex.test(date) &&
      img.mimetype.indexOf("image") === 0 &&
      img.size < 1024*1024*5
    ) {
      const pagesDirectory = path.join(process.cwd(), 'public');
      const newsDirectory = path.join(process.cwd(), 'news');
      const newName = getNewFileName(img.originalFilename);
      const filedata = await fs.readFile(img.filepath);
      fs.appendFile(`${pagesDirectory}/images/articles/${newName}`, Buffer.from(filedata.buffer));
      res.json({error: false});
      const client = new MongoClient(process.env.MONGO_URI as string);
      const database = client.db("site");
      const tab = database.collection("news");
      const update = await tab.insertOne({title, desc, date});
      if(update.acknowledged !== undefined) {
        fs.writeFile(`${newsDirectory}/${update.insertedId}.json`, JSON.stringify(content), "utf-8");
        res.json({error: false});
      } else {
        res.json({error: true});
      }
    }
  } else {
    res.json({error: true});
  }
}