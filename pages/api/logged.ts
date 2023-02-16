import { withIronSessionApiRoute } from "iron-session/next";
import { User } from "../../lib/AuthSession/session";
import { NextApiRequest, NextApiResponse } from "next";
import { sessionOptions } from "@/lib/AuthSession/Config";

export default withIronSessionApiRoute(isLoggedIn, sessionOptions);

function isLoggedIn(req: NextApiRequest, res: NextApiResponse<User>) {
    const user = req.session.user;

    if(!user || user.isLoggedIn === false) {
        return res.json({login: "", isLoggedIn: false, permissions: {}})
    } else {
        return res.json({login: user.login, isLoggedIn: true, permissions: user.permissions});
    }
}