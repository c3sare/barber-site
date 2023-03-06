import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { MongoClient, ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(costsRoute, sessionOptions);

async function costsRoute(req: NextApiRequest, res: NextApiResponse) {
    if(req.method === "GET") {
        const client = new MongoClient(process.env.MONGO_URI as string);
        const database = client.db("site");
        const tab = database.collection("costs");
        const items = await tab.find({}).toArray();
        res.json(items);
    } else if(req.method === "PUT") {
        const {category=""}:Partial<{category: string}> = req.body;
        const categoryRegex = /^(.|\s)*[a-zA-Z]+(.|\s)*$/;
        console.log(category.length > 1);
        console.log(category.length <= 80);
        console.log(categoryRegex.test(category));

        if(
            category.length > 1 &&
            category.length <= 80 &&
            categoryRegex.test(category)
        ) {
            const client = new MongoClient(process.env.MONGO_URI as string);
            const database = client.db("site");
            const tab = database.collection("costs");
            const insert = await tab.insertOne({category, services: []});
            res.json({error: false, id: insert.insertedId, msg: "Kategoria została dodana prawidłowo!"});
        } else {
            res.json({error: true, msg: "Nieprawidłowo wypełnione pola!"})
        }
    } else if(req.method === "DELETE") {
        const client = new MongoClient(process.env.MONGO_URI as string);
        const database = client.db("site");
        const tab = database.collection("costs");
        const result = await tab.deleteOne({_id: new ObjectId(req.body.id as string)});
        res.json({error: !(result.deletedCount === 1)});
    } else {
        res.json({error: true})
    }
}