import { sessionOptions } from "@/lib/AuthSession/Config";
import getData from "@/utils/getData";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(menuRoute, sessionOptions);

async function menuRoute(req: NextApiRequest, res: NextApiResponse) {
  const session = req.session.user;
  if(req.method === "GET") {
    if(session?.isLoggedIn && session?.permissions?.users) {
        const users = await getData("users");
        res.json(users);
    } else {
        res.json({error: true});
    }
  } else {
    res.json({error: true});
  }
}