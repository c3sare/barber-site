import { sessionOptions } from "@/lib/AuthSession/Config";
import { User } from "@/lib/AuthSession/session";
import dbConnect from "@/lib/dbConnect";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(logoutRoute, sessionOptions);

async function logoutRoute(req: NextApiRequest, res: NextApiResponse<User>) {
  const session = req.session.user;
  await dbConnect();
  if (req.method === "POST") {
    if (!session?.isLoggedIn)
      return res.status(400).json({ message: "Nie jesteś zalogowany!" } as any);

    req.session.destroy();
    res.status(200).json({ isLoggedIn: false, id: "" });
  } else {
    return res.status(404);
  }
}
