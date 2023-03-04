import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs/promises";
import path from "path";

export default withIronSessionApiRoute(customPageContentRoute, sessionOptions);

async function customPageContentRoute(req: NextApiRequest, res: NextApiResponse) {
    const {id} = req.query;
    const pagesDirectory = path.join(process.cwd(), 'pagecontent');
    if(req.method === "GET") {
        fs.readFile(`${pagesDirectory}/${id}.json`, {encoding: "utf-8"})
        .then(data => JSON.parse(data))
        .then(data => res.json(data))
        .catch(err => {
            console.log(err);
            res.json({});
        })
    } else if(req.method === "POST") {
        try {
            await fs.access(`${pagesDirectory}/${id}.json`);
            fs.writeFile(`${pagesDirectory}/${id}.json`, JSON.stringify(req.body), 'utf-8')
            .catch(err => {
                console.log(err);
                res.json({error: true})
            })
            .then(() => res.json({error: false}));
        } catch {
            res.json({error: true});
            console.error("Cannot access file "+id+".json")
        }
    }
}