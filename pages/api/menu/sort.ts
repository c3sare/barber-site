import { sessionOptions } from "@/lib/AuthSession/Config";
import getMenu from "@/lib/getMenu";
import { MenuItemDB } from "@/lib/types/MenuItem";
import { withIronSessionApiRoute } from "iron-session/next";
import { MongoClient, ObjectId, UpdateResult } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(menuRoute, sessionOptions);

async function menuRoute(req: NextApiRequest, res: NextApiResponse) {
  if(req.method === "GET") {
    const menu:MenuItemDB[] = await getMenu();
    res.json({menu: menu.map(item => (
      {
          _id: item._id,
          parent: item.parent,
          title: item.title,
          slug: item.slug,
          order: item.order
      }
    ))});
  } else if(req.method === "POST") {
    const menu:MenuItemDB[] = req.body.menu;

    const client = new MongoClient(process.env.MONGO_URI as string);
    const database = client.db("site");
    const tab = database.collection("menu");
    const updates: UpdateResult[] = [];
    menu.forEach(async item => {
        updates.push(await tab.updateOne({_id: new ObjectId(item._id)}, {$set: {order:item.order, parent: item.parent}}));
    })
    if(updates.map(item => item.acknowledged).includes(false)) {
      res.json({
        error: true 
      })
    } else {
        res.json({
            error: false
        })
    }
    client.close();
  }
}