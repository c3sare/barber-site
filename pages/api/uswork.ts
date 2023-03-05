import { sessionOptions } from "@/lib/AuthSession/Config";
import formidable from "formidable";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs/promises";
import path from "path";
import { MongoClient, ObjectId } from "mongodb";

export default withIronSessionApiRoute(usworkRoute, sessionOptions);

function createResponse(msg: string, error: boolean = true) {
  return ({
    error, msg
  })
}

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

async function handleId(req:NextApiRequest, res:NextApiResponse) {
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
  if(req.method === "PUT") {
    const session = req.session.user;
    if(session?.isLoggedIn && session.permissions.menu) {
        const pagesDirectory = path.join(process.cwd(), 'public');
        const data:any = await handlePostFormReq(req, res);
        const orgName = data.originalFilename;
        const withoutExt = orgName?.slice(0, orgName.lastIndexOf("."));
        const ext = orgName?.slice(orgName.lastIndexOf("."));
        const genFragment = Math.random().toString(36).slice(2);
        const fullName = withoutExt+"_"+genFragment+ext;
        const filedata = await fs.readFile(data.filepath);
        fs.appendFile(`${pagesDirectory}/images/uswork/${fullName}`, Buffer.from(filedata.buffer));
        const client = new MongoClient(process.env.MONGO_URI as string);
        const database = client.db("site");
        const tab = database.collection("uswork");
        const insert = await tab.insertOne({image: fullName});
        res.json({error: false, _id: insert.insertedId, image: fullName});
    } else {
        res.json(createResponse("Nie masz uprawnień do wykonania tej zmiany!"));
    }
  } else if(req.method === "DELETE") {
    const session = req.session.user;
    if(session?.isLoggedIn && session.permissions.menu) {
        const query:{id: string} = await handleId(req, res) as {id: string};
        const client = new MongoClient(process.env.MONGO_URI as string);
        const database = client.db("site");
        const tab = database.collection("uswork");
        const itemToDelete = await tab.findOne({_id: new ObjectId(query!.id!)});
        const delItem = await tab.deleteOne({_id: new ObjectId(query!.id!)});
        if(delItem.deletedCount === 1) {
            const usworkDirectory = path.join(process.cwd(), 'public');
            await fs.unlink(`${usworkDirectory}/images/uswork/${itemToDelete!.image}`);
            res.json({error: false});
        } else {
            res.json({error: true});
        }
    } else {
        res.json(createResponse("Nie masz uprawnień do wykonania tej zmiany!"));
    }
  } else {
    res.json(createResponse("Niepoprawne zapytanie!"));
  }
}

export const config = {
    api: {
      bodyParser: false,
    },
};