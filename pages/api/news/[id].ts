import { sessionOptions } from "@/lib/AuthSession/Config";
import getData from "@/utils/getData";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs/promises";
import path from "path";
import { MongoClient, ObjectId } from "mongodb";

export default withIronSessionApiRoute(newsRoute, sessionOptions);

const titleRegex = /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u;
const descRegex = /^(.|\s)*[a-zA-Z]+(.|\s)*$/;
const dateRegex = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;

async function newsRoute(req: NextApiRequest, res: NextApiResponse) {
  const session = req.session.user;
  if(req.method === "GET" && session?.isLoggedIn && session.permissions.news) {
    const newsDirectory = path.join(process.cwd(), 'news');
    const data = (await getData("news")).find((item:any) => item._id === req.query.id);
        
    if(data !== null) {
      const content = await fs.readFile(`${newsDirectory}/${data._id}.json`, "utf-8");
      res.json({...data, content: content === "" ? "" : JSON.parse(content)})
    } else {
      res.json({});
    }
  } else if(req.method === "POST" && session?.isLoggedIn && session.permissions.news) {
    const {title, desc, date, content} = req.body;
    if(
        titleRegex.test(title) &&
        title?.length > 0 &&
        title?.length <= 80 &&
        descRegex.test(desc) &&
        desc.length > 0 &&
        desc.length <= 400 &&
        dateRegex.test(date)
    ) {
        const client = new MongoClient(process.env.MONGO_URI as string);
        const database = client.db("site");
        const tab = database.collection("news");
        const _id = new ObjectId(req.query.id as string);
        const update = await tab.updateOne({_id}, {$set: {title, desc, date}});
        if(update.acknowledged !== undefined) {
            const newsDirectory = path.join(process.cwd(), 'news');
            fs.writeFile(`${newsDirectory}/${req.query.id}.json`, JSON.stringify(content), "utf-8");
            res.json({error: false});
        } else {
            res.json({error: true});
        }
    } else {
      res.json({error: true});
    }
  } else {
    res.json({error: true});
  }
}