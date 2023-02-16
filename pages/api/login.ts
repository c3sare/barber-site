import { User } from "@/lib/AuthSession/session";
import { getUserByLogin } from "@/utils/getData";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import { sessionOptions } from "@/lib/AuthSession/Config";

export default withIronSessionApiRoute(loginRoute, sessionOptions);

async function loginRoute(req:NextApiRequest, res:NextApiResponse<User>) {
  const {login, permissions, password} = await getUserByLogin(req.body.login);
  
  if(login === req.body.login) {
    const comparePWD = await bcrypt.compare(req.body.pwd, password);
    req.session.user = {
        isLoggedIn: comparePWD,
        login: comparePWD ? login : "",
        permissions: permissions
    };
    await req.session.save();
    res.json({
        isLoggedIn: comparePWD,
        login: comparePWD ? login : "",
        permissions: permissions
    });
  } else {
    res.json({
        isLoggedIn: false,
        login: "",
        permissions: {}
    });
  }
}