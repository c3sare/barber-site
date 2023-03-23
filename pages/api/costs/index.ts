import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { MongoClient, ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(costsRoute, sessionOptions);

const categoryRegex = /^(.|\s)*[a-zA-Z]+(.|\s)*$/;

async function costsRoute(req: NextApiRequest, res: NextApiResponse) {
    const user = req.session.user;
    if(req.method === "GET") {
        if(!user?.isLoggedIn || !user?.permissions?.menu)
            return res.status(403).json({message: "Nie posiadasz uprawnień do tej ścieżki!"});

        const client = new MongoClient(process.env.MONGO_URI as string);
        const database = client.db("site");
        const tab = database.collection("costs");
        const items = await tab.find({}).toArray();
        res.status(200).json(items);
    } else if(req.method === "PUT") {
        if(!user?.isLoggedIn || !user?.permissions?.menu)
            return res.status(403).json({message: "Nie posiadasz uprawnień do tej ścieżki!"});

        const {category}:Partial<{category: string}> = req.body;

        if(!category)
            return res.status(400).json({message: "Nieprawidłowe parametry zapytania"});

        if(
            category.length > 0 &&
            category.length <= 80 &&
            categoryRegex.test(category)
        ) {
            const client = new MongoClient(process.env.MONGO_URI as string);
            const db = client.db("site");
            const costs = db.collection("costs");
            const insertCategory = await costs.insertOne({category, services: []});
            res.status(200).json({error: false, id: insertCategory.insertedId, msg: "Kategoria została dodana prawidłowo!"});
        } else {
            res.status(200).json({error: true, msg: "Nieprawidłowo wypełnione pola!"});
        }
    } else if(req.method === "DELETE") {
        if(!user?.isLoggedIn || !user?.permissions?.menu)
            return res.status(403).json({message: "Nie posiadasz uprawnień do tej ścieżki!"});

        const {
            id
        }:{
            id: string
        } = req.body;

        if(!id)
            return res.status(400).json({message: "Nieprawidłowe parametry zapytania"});

        const client = new MongoClient(process.env.MONGO_URI as string);
        const database = client.db("site");
        const costs = database.collection("costs");
        const _id = new ObjectId(id);
        const findItem = await costs.findOne({_id});

        if(findItem === null)
            return res.status(404).json({message: "Nie znaleziono rekordu o identyfiaktorze "+id});

        const deleteItem = await costs.deleteOne({_id});

        if(deleteItem.deletedCount !== 1) 
            return res.status(500).json({message: "Nie udało się wykonać tego zapytania!"});

        res.status(200).json({error: false});
    } else {
        return res.status(404).json({message: "Nie odnaleziono ścieżki!"})
    }
}