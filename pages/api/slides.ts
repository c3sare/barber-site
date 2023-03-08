import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import getData from "@/utils/getData";

export default withIronSessionApiRoute(slidesRoute, sessionOptions);

async function slidesRoute(req: NextApiRequest, res: NextApiResponse) {
  if(req.method === "GET") {
    const data = await getData("slides");
    res.json(data);
  } else {
    res.json({error: true});
  }
}