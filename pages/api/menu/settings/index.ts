import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { MongoClient, ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(menuRoute, sessionOptions);

interface MenuSettings {
    _id: string,
    title: string,
    on: boolean,
    slug: string,
    custom: boolean
}

async function menuRoute(req: NextApiRequest, res: NextApiResponse) {
    const user = req.session.user;
    if(req.method === "POST") {
        if(user?.isLoggedIn) {
            const menu:MenuSettings = req.body.menu;
            const client = new MongoClient(process.env.MONGO_URI as string);
            const database = client.db("site");
            const tab = database.collection("menu");
            const result = await tab.updateOne({_id: new ObjectId(menu._id)}, {$set: {
                custom: menu.custom,
                title: menu.title,
                on: menu.on,
                slug: menu.slug
            }});
    
            if(!result.acknowledged) {
            res.json({
                error: true 
            })
            } else {
                res.json({
                    error: false
                })
            }
            client.close();
        } else {
            res.json({error: true});
        }
    }
}