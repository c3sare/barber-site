import dbConnect from "@/lib/dbConnect";
import Barbers from "@/models/Barber";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();
  if (req.method === "GET") {
    const data = await Barbers.find({});
    res.status(200).json(data);
  } else {
    res.status(404);
  }
}
