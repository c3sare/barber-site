import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { getDataOne } from "@/utils/getData";

export default withIronSessionApiRoute(descMainRoute, sessionOptions);

async function descMainRoute(req: NextApiRequest, res: NextApiResponse) {
  if(req.method === "GET") {
    const data = await getDataOne("descMain");
    res.json(data);
  } else {
    res.json({error: true});
  }
}