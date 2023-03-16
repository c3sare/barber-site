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
            res.json(workers);
        } else res.json({error: true});
    } else if(req.method === "PUT") {
        if(session?.isLoggedIn && session?.permissions?.workers) {
            const nameRegex = /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u;
            const {name} = req.body;
            if(nameRegex.test(name) && name.length > 0 && name.length <= 30) {
                const client = new MongoClient(process.env.MONGO_URI as string);
                const database = client.db("site");
                const tab = database.collection("barbers");
                const insert = await tab.insertOne({name});
                if(insert.acknowledged !== undefined)
                    res.json({error: false});
                else
                    res.json({error: true});
            } else
                res.json({error: true});
        } else res.json({error: true});
    } else if(req.method === "DELETE") {
        if(session?.isLoggedIn && session?.permissions?.workers) {
            const {id} = req.body;
            const client = new MongoClient(process.env.MONGO_URI as string);
            const database = client.db("site");
            const tab = database.collection("barbers");
            const del = await tab.deleteOne({_id: new ObjectId(id)});
            if(del.deletedCount === 1) {
                tab.deleteMany({barber_id: id});
                res.json({error: false});
            } else {
                res.json({error: true});
            }
        } else 
            res.json({error: true});
    } else {
        res.json({error: true})
    }
}