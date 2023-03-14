import { sessionOptions } from "@/lib/AuthSession/Config";
import getData from "@/utils/getData";
import { withIronSessionApiRoute } from "iron-session/next";
import { MongoClient, ObjectId } from "mongodb";
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

const titleRegex = /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u;
const descRegex = /^(.|\s)*[a-zA-Z]+(.|\s)*$/;
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
    console.log(titleRegex.test(title));
    console.log(title?.length > 0);
    console.log(title?.length <= 80);
    console.log(descRegex.test(desc));
    console.log(desc.length > 0);
    console.log(desc.length <= 400);
    console.log(dateRegex.test(date));
    console.log(img.mimetype.indexOf("image") === 0);
    console.log(img.size < 1024*1024*5);
    if(
      session?.isLoggedIn &&
      session.permissions.news &&
      titleRegex.test(title) &&
      title?.length > 0 &&
      title?.length <= 80 &&
      descRegex.test(desc) &&
      desc.length > 0 &&
      desc.length <= 400 &&
      dateRegex.test(date) &&
      img.mimetype.indexOf("image") === 0 &&
      img.size < 1024*1024*5
    ) {
      const publicDir = path.join(process.cwd(), 'public');
      const newsDir = path.join(process.cwd(), 'news');
      const newName = getNewFileName(img.originalFilename);
      const filedata = await fs.readFile(img.filepath);
      fs.appendFile(`${publicDir}/images/articles/${newName}`, Buffer.from(filedata.buffer));
      const client = new MongoClient(process.env.MONGO_URI as string);
      const database = client.db("site");
      const tab = database.collection("news");
      const insert = await tab.insertOne({title, desc, date, img: newName});
      if(insert.acknowledged !== undefined) {
        fs.writeFile(`${newsDir}/${insert.insertedId}.json`, content, "utf-8");
        res.json({error: false});
      } else {
        res.json({error: true});
      }
    } else {
      res.json({error: true})
    }
  } else if(req.method === "DELETE") {
    const {id}:any = await handlePostFormReq(req, res);
    const client = new MongoClient(process.env.MONGO_URI as string);
    const database = client.db("site");
    const tab = database.collection("news");
    const _id = new ObjectId(id);
    const toDelete = await tab.findOne({_id});
    const del = await tab.deleteOne({_id});
    if(del.deletedCount === 1) {
      const publicDir = path.join(process.cwd(), 'public');
      const newsDir = path.join(process.cwd(), 'news');
      fs.unlink(`${publicDir}/images/articles/${toDelete!.img}`);
      fs.unlink(`${newsDir}/${id}.json`);
      res.json({error: false});
    } else {
      res.json({error: true});
    }
  } else {
    res.json({error: true});
  }
}