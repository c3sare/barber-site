import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import getData from "@/utils/getData";

export default withIronSessionApiRoute(openHoursRoute, sessionOptions);

async function openHoursRoute(req: NextApiRequest, res: NextApiResponse) {
  if(req.method === "GET") {
    const data = await getData("openHours");
    res.json(data);
  } else {
    res.json({error: true});
  }
}