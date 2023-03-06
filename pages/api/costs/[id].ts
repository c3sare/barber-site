import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { MongoClient, ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(menuRoute, sessionOptions);

async function menuRoute(req: NextApiRequest, res: NextApiResponse) {
    if(req.method === "GET") {
        const {id} = req.query;
        const client = new MongoClient(process.env.MONGO_URI as string);
        const database = client.db("site");
        const tab = database.collection("costs");
        const item = await tab.findOne({_id: new ObjectId(id as string)})

        if(item !== null) {
            res.json({
                category: item.category,
                services: item.services
            });
        } else {
            res.json({});
        }
    }
}