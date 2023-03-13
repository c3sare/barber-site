import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import getData from "@/utils/getData";
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

      resolve({ ...{...fields, ...files} });
    });
  });
  const data = await formData;
  return data;
}

export default withIronSessionApiRoute(slidesRoute, sessionOptions);

function getNewFileName(orgName:string) {
  const withoutExt = orgName?.slice(0, orgName.lastIndexOf("."));
  const ext = orgName?.slice(orgName.lastIndexOf("."));
  const genFragment = Math.random().toString(36).slice(2);
  return withoutExt+"_"+genFragment+ext;
}

function checkData({image, title, desc}:any) {
  const titleDescRegex = /^(.|\s)*[a-zA-Z]+(.|\s)*$/;
  if(
    titleDescRegex.test(title) &&
    title.length > 0 &&
    title.length <= 80 &&
    titleDescRegex.test(desc) &&
    desc.length > 0 &&
    desc.length <= 800 &&
    image.mimetype.indexOf("image") === 0 &&
    image.size < 1024*1024*5
  ) return true;
  else return false;
}

async function slidesRoute(req: NextApiRequest, res: NextApiResponse) {
  if(req.method === "GET") {
    const data = await getData("slides");
    res.json(data);
  } else if(req.method === "DELETE") {
    const {id}:any = await handlePostFormReq(req, res);
    const client = new MongoClient(process.env.MONGO_URI as string);
    const database = client.db("site");
    const tab = database.collection("slides");
    const del = await tab.deleteOne({_id: new ObjectId(id)});
    if(del.deletedCount === 1) {
      res.json({error: false});
    } else {
      res.json({error: true});
    }
  } else if(req.method === "PUT") {
    const pagesDirectory = path.join(process.cwd(), 'public');
    const {image, title, desc}:any = await handlePostFormReq(req, res);
    if(checkData({image, title, desc})) {
      const newName = getNewFileName(image.originalFilename);
      const filedata = await fs.readFile(image.filepath);
      fs.appendFile(`${pagesDirectory}/images/${newName}`, Buffer.from(filedata.buffer));
      const client = new MongoClient(process.env.MONGO_URI as string);
      const database = client.db("site");
      const tab = database.collection("slides");
      const insert = await tab.insertOne({title, desc, image: newName});
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
}