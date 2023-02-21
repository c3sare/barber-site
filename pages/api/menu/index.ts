import { sessionOptions } from "@/lib/AuthSession/Config";
import getMenu from "@/lib/getMenu";
import { MenuItemDB } from "@/lib/types/MenuItem";
import { withIronSessionApiRoute } from "iron-session/next";
import { MongoClient, ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(menuRoute, sessionOptions);

async function menuRoute(req: NextApiRequest, res: NextApiResponse) {
  if(req.method === "GET") {
    const menu = await getMenu();
    res.json({error: false, menu});
  } else if(req.method === "DELETE") {
    const {id}:{id: string} = req.body;

    const client = new MongoClient(process.env.MONGO_URI as string);
    const database = client.db("site");
    const tab = database.collection("menu");
    const deleteResult = await tab.deleteOne({_id: new ObjectId(id)});
    if(deleteResult.deletedCount === 1) {
      const updateParentResult = await tab.updateMany({parent: id}, {$set: {parent: ""}});
      if(updateParentResult.acknowledged) {
        res.json({error: false});
      } else {
        res.json({error: true});
      }
    } else {
      res.json({error: true});
    }

    client.close();
  }
}