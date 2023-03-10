import { sessionOptions } from "@/lib/AuthSession/Config";
import getData from "@/utils/getData";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(infoRoute, sessionOptions);

async function infoRoute(req: NextApiRequest, res: NextApiResponse) {
  if(req.method === "GET") {
    const session = req.session.user;
    if(session?.isLoggedIn && session.permissions.news) {
        const data = await getData("news");

        res.json(data);
    } else {
        res.json({error: true});
    }
  } else {
    res.json({error: true});
  }
}