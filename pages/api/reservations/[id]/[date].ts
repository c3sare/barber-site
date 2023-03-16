import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { MongoClient } from "mongodb";

export default withIronSessionApiRoute(reservationsRoute, sessionOptions);

async function reservationsRoute(req: NextApiRequest, res: NextApiResponse) {
  if(req.method === "GET") {
    const session = req.session.user;
    if(session?.isLoggedIn && session.permissions.reservations) {
        const {id, date} = req.query;
        const client = new MongoClient(process.env.MONGO_URI as string);
        const database = client.db("site");
        const tab = database.collection("reservations");
        const list = await tab.findOne({barber_id: id, date});
        if(list !== null) {
            res.json(list.times);
        } else {
            res.json([]);
        }
    } else {
        res.json({error: true});
    }
  } else {
    res.json({error: true});
  }
}