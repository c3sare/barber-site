import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { MongoClient } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(costsRoute, sessionOptions);

async function costsRoute(req: NextApiRequest, res: NextApiResponse) {
    if(req.method === "GET") {
        const client = new MongoClient(process.env.MONGO_URI as string);
        const database = client.db("site");
        const tab = database.collection("costs");
        const items = await tab.find({}).toArray();
        res.json(items);
    }
}