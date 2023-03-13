import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs/promises";
import path from "path";
import { MongoClient, ObjectId } from "mongodb";

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

      resolve({ ...files.img });
    });
  });
  const data = await formData;
  return data;
}

export default withIronSessionApiRoute(newsRoute, sessionOptions);

function getNewFileName(orgName:string) {
  const withoutExt = orgName?.slice(0, orgName.lastIndexOf("."));
  const ext = orgName?.slice(orgName.lastIndexOf("."));
  const genFragment = Math.random().toString(36).slice(2);
  return withoutExt+"_"+genFragment+ext;
}

function checkData(image:any) {
  if(
    image.mimetype.indexOf("image") === 0 &&
    image.size < 1024*1024*5
  ) return true;
  else return false;
}

async function newsRoute(req: NextApiRequest, res: NextApiResponse) {
    if(req.method === "POST") {
        const pagesDirectory = path.join(process.cwd(), 'public');
        const image:any = await handlePostFormReq(req, res);
        if(checkData(image)) {
            const newName = getNewFileName(image.originalFilename);
            const filedata = await fs.readFile(image.filepath);
            fs.appendFile(`${pagesDirectory}/images/articles/${newName}`, Buffer.from(filedata.buffer));
            const client = new MongoClient(process.env.MONGO_URI as string);
            const database = client.db("site");
            const tab = database.collection("news");
            const _id = new ObjectId(req.query.id as string);
            const oldFile = await tab.findOne({_id});
            const insert = await tab.updateOne({_id}, {$set: {img: newName}});
            if(insert.acknowledged !== undefined) {
                if(oldFile !== null)
                    fs.unlink(`${pagesDirectory}/images/articles/${oldFile.img}`);
                res.json({error: false, img: newName});
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