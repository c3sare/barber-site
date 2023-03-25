import { User } from "@/lib/AuthSession/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import { sessionOptions } from "@/lib/AuthSession/Config";
import { MongoClient } from "mongodb";

const pwdRegex =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
const loginRegex = /^(?=.*[A-Za-z0-9]$)[A-Za-z][A-Za-z\d.-]{0,24}$/;

export default withIronSessionApiRoute(loginRoute, sessionOptions);

async function loginRoute(req: NextApiRequest, res: NextApiResponse<User>) {
  if (req.method === "POST") {
    const { login, pwd } = req.body;
    if (!login || !pwd || !pwdRegex.test(pwd) || !loginRegex.test(login))
      return res.json({
        isLoggedIn: false,
        msg: "Nieprawidłowe dane logowania!",
      } as any);

    const client = new MongoClient(process.env.MONGO_URI as string);
    const database = client.db("site");
    const tab = database.collection("users");
    const data = await tab.findOne({ login });
    client.close();

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
    return res.json({
      isLoggedIn: true,
      login,
      permissions: data.permissions,
    });
  } else {
    return res.status(404);
  }
}
