import getData from "@/utils/getData";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if(req.method === "GET") {
    const data = await getData("barbers");
    res.json(data);
  } else {
    res.json({error: true});
  }
}
