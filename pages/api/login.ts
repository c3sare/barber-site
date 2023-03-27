import { User } from "@/lib/AuthSession/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import { sessionOptions } from "@/lib/AuthSession/Config";
import Users from "@/models/User";
import dbConnect from "@/lib/dbConnect";

const pwdRegex =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
const loginRegex = /^(?=.*[A-Za-z0-9]$)[A-Za-z][A-Za-z\d.-]{0,24}$/;

export default withIronSessionApiRoute(loginRoute, sessionOptions);

async function loginRoute(req: NextApiRequest, res: NextApiResponse<User>) {
  const session = req.session.user;
  await dbConnect();
  if (req.method === "POST") {
    if (session?.isLoggedIn)
      return res.status(403).json({ message: "Jesteś już zalogowany!" } as any);

    const { login, pwd } = req.body;
    if (!login || !pwd || !pwdRegex.test(pwd) || !loginRegex.test(login))
      return res.json({
        isLoggedIn: false,
        msg: "Nieprawidłowe dane logowania!",
      } as any);

    const data = await Users.findOne({ login });

    if (!data)
      return res.json({
        isLoggedIn: false,
        msg: "Nieprawidłowe dane logowania!",
      } as any);

    const comparePWD = await bcrypt.compare(pwd, data.password);
    if (!comparePWD)
      res.json({
        isLoggedIn: false,
        msg: "Nieprawidłowe dane logowania!",
      } as any);

    req.session.user = {
      isLoggedIn: true,
      login,
      permissions: data.permissions,
    };
    await req.session.save();
    return res.status(200).json(req.session.user);
  } else {
    return res.status(404);
  }
}
