import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { getDataOne } from "@/utils/getData";
import formidable from "formidable";
import path from "path";
import fs from "fs/promises";
import { MongoClient, ObjectId } from "mongodb";

export default withIronSessionApiRoute(descMainRoute, sessionOptions);

export const config = {
  api: {
    bodyParser: false
  }
};

async function handlePostFormReq(req:NextApiRequest, res:NextApiResponse) {
  const form = formidable({ multiples: true });

  const formData = new Promise((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        reject(err);
      }

      const data:any = JSON.parse(fields.data as any);

      const keys = Object.keys(files);
      for(let i=0;i<keys.length;i++) {
        const index = Number(keys[i].slice(-1));
        data.pros[index].img = files[keys[i]]
      }

      resolve({ ...data});
    });
  });
  const data = await formData;
  return data;
}

function checkData(title: string, desc: string) {
  const titleDescRegex = /^(.|\s)*[a-zA-Z]+(.|\s)*$/;
  if(
    titleDescRegex.test(title) &&
    title?.length > 0 &&
    title?.length <= 80 &&
    titleDescRegex.test(desc) &&
    desc?.length > 0 &&
    desc?.length <= 800
  ) return true;
  else return false;
}

function getNewFileName(orgName:string) {
  const withoutExt = orgName?.slice(0, orgName.lastIndexOf("."));
  const ext = orgName?.slice(orgName.lastIndexOf("."));
  const genFragment = Math.random().toString(36).slice(2);
  return withoutExt+"_"+genFragment+ext;
}

async function descMainRoute(req: NextApiRequest, res: NextApiResponse) {
  if(req.method === "GET") {
    const data = await getDataOne("descMain");
    res.json(data);
  } else if(req.method === "POST") {
    const {title, description, pros}:any = await handlePostFormReq(req, res);
    const pagesDirectory = path.join(process.cwd(), 'public');
    if(checkData(title, description)) {
      await pros.forEach(async (item:any) => {
        if(typeof item.img === "object") {
          const newName = getNewFileName(item.img.originalFilename);
          const filedata = await fs.readFile(item.img.filepath);
          fs.appendFile(`${pagesDirectory}/images/${newName}`, Buffer.from(filedata.buffer));
          item.img = newName;
        }
      });
      const client = new MongoClient(process.env.MONGO_URI as string);
      const database = client.db("site");
      const tab = database.collection("descMain");
      const oldFile = await tab.find({}).toArray();
      if(oldFile.length > 0) {
        const insert = await tab.updateOne({_id: new ObjectId(oldFile[0]._id)}, {$set: {title, description, pros}});
        if(insert.acknowledged !== undefined) {
          res.json({error: false});
        } else {
          res.json({error: true});
        }
      } else {
        res.json({error: true});
      }

    } else {
        res.json({error: true});
    }
  } else {
    res.json({error: true});
  }
}