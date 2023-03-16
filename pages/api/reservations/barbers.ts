import { getDataOne } from "@/utils/getData";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if(req.method === "GET") {
    const data = await getDataOne("barbers");
    res.json(data);
  } else {
    res.json({error: true});
  }
}
