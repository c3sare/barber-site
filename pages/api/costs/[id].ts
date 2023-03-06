import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { MongoClient, ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(menuRoute, sessionOptions);

const categoryServiceRegex = /^(.|\s)*[a-zA-Z]+(.|\s)*$/;

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
    } else if(req.method === "POST") {
        const {id} = req.query;
        const {
            category,
            services
        }:{
            category: string,
            services: {
                service: string,
                cost: number,
                time: number
            }[]
        } = req.body;
        const client = new MongoClient(process.env.MONGO_URI as string);
        const database = client.db("site");
        const tab = database.collection("costs");

        const validRegex = categoryServiceRegex.test(category);
        const validServices = [];

        for(let i=0; i<services.length; i++) {
            validServices.push(
                categoryServiceRegex.test(services[i].service) &&
                services[i].cost >= 0 &&
                services[i].time >= 0
            )
        }

        if(validRegex && validServices.filter(item => item === false).length === 0) {
            const newServices = services.map((item, i) => ({
                ...item,
                id: i+1
            }))

            const result = await tab.updateOne(
                {
                    _id: new ObjectId(id as string)
                },
                {
                    $set: {
                        category,
                        services: newServices
                    }
                }
            );
            if(result.acknowledged !== undefined) {
                res.json({error: false});
            } else {
                res.json({error: true, msg: "Nie można wykonać zmiany!"})
            }
        }
    } else {
        res.json({error: true});
    }
}