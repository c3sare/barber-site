import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs/promises";
import path from "path";
import formidable from "formidable";

export const config = {
    api: {
      bodyParser: false
    }
};

export default withIronSessionApiRoute(uploadImageRoute, sessionOptions);

async function handlePostFormReq(req:NextApiRequest, res:NextApiResponse) {
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

async function uploadImageRoute(req: NextApiRequest, res: NextApiResponse) {
  if(req.method === "POST") {
    const pagesDirectory = path.join(process.cwd(), 'public');
    const data:any = await handlePostFormReq(req, res);
    console.log(data);
    const orgName = data.originalFilename;
    const withoutExt = orgName?.slice(0, orgName.lastIndexOf("."));
    const ext = orgName?.slice(orgName.lastIndexOf("."));
    const genFragment = Math.random().toString(36).slice(2);
    const fullName = withoutExt+"_"+genFragment+ext;
    const filedata = await fs.readFile(data.filepath);
    fs.appendFile(`${pagesDirectory}/images/${fullName}`, Buffer.from(filedata.buffer));
    res.json({url: fullName});
  } else {
    res.json({error: true});
  }
}