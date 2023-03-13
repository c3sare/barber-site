import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { MongoClient, ObjectId } from "mongodb";


export default withIronSessionApiRoute(slidesRoute, sessionOptions);

function checkData({title, desc}:any) {
  const titleDescRegex = /^(.|\s)*[a-zA-Z]+(.|\s)*$/;
  if(
    titleDescRegex.test(title) &&
    title.length > 0 &&
    title.length <= 80 &&
    titleDescRegex.test(desc) &&
    desc.length > 0 &&
    desc.length <= 800
  ) return true;
  else return false;
}

async function slidesRoute(req: NextApiRequest, res: NextApiResponse) {
  if(req.method === "POST") {
    const {title, desc}:any = req.body;
    if(checkData({title, desc})) {
      const client = new MongoClient(process.env.MONGO_URI as string);
      const database = client.db("site");
      const tab = database.collection("slides");
      const update = await tab.updateOne({_id: new ObjectId(req.query.id as string)}, {$set: {title, desc}});
      if(update.acknowledged !== undefined) {
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