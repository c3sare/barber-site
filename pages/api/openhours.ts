import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import getData from "@/utils/getData";
import { MongoClient } from "mongodb";

export default withIronSessionApiRoute(openHoursRoute, sessionOptions);

const checkOpenHoursData = (data:any[]) => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  for(let i=0; i<data.length; i++) {
    if(data[i].closed === false) {
      if(
        !timeRegex.test(data[i].start) ||
        !timeRegex.test(data[i].end)
      ) return false;
    }
  }
  return true;
}

async function openHoursRoute(req: NextApiRequest, res: NextApiResponse) {
  if(req.method === "GET") {
    const data = await getData("openHours");
    let newData:any = {};

    data.forEach((item:any) => {
      if(item.closed)
        newData[item.short] = {start: "", end: "", closed: true};
      else {
        newData[item.short] = {
          start: item.start,
          end: item.end,
          closed: false
        }
      }
    });

    res.json(newData);
  } else if(req.method === "POST") {
    const data = req.body;
    if(checkOpenHoursData(data)) {
      const client = new MongoClient(process.env.MONGO_URI as string);
      const database = client.db("site");
      const tab = database.collection("openHours");
      const results:boolean[] = [];
      await data.forEach(async (day:any) => {
        const $set = day.closed ? {
          closed: true,
          start: "",
          end: ""
        } : {
          closed: false,
          start: day.start,
          end: day.end
        }
  
        const update = await tab.updateOne({short: day.short}, {$set});
        results.push(update.modifiedCount === 1);
      });
      res.json({error: results.filter(item => item === false).length > 0});
    } else {
      res.json({error: true});
    }
  } else {
    res.json({error: true})
  }
}