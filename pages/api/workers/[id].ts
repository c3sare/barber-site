import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import getData from "@/utils/getData";
import { MongoClient, ObjectId } from "mongodb";

export default withIronSessionApiRoute(workersRoute, sessionOptions);

async function workersRoute(req: NextApiRequest, res: NextApiResponse) {
    const session = req.session.user;
    if(req.method === "GET") {
        if(session?.isLoggedIn && session?.permissions?.workers) {
            const workers = await getData("barbers");

            const item = workers.find((item:any) => item._id === req.query.id);

            res.json(item);
        } else res.json({error: true});
    } else if(req.method === "POST") {
        if(session?.isLoggedIn && session?.permissions?.workers) {
            const nameRegex = /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u;
            const {id, name} = req.body;
            if(nameRegex.test(name) && name.length > 0 && name.length <= 30) {
                const client = new MongoClient(process.env.MONGO_URI as string);
                const database = client.db("site");
                const tab = database.collection("barbers");
                const update = await tab.updateOne({_id: new ObjectId(id)}, {$set: {name}});

                if(update.acknowledged !== undefined)
                    res.json({error: false});
                else
                    res.json({error: true});

            } else res.json({error: true});
        } else res.json({error: true});
    } else {
        res.json({error: true})
    }
}