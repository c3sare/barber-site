import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { MongoClient, ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";

export default withIronSessionApiRoute(menuRoute, sessionOptions);

const pwdRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

async function menuRoute(req: NextApiRequest, res: NextApiResponse) {
  const session = req.session.user;
  if(req.method === "POST") {
    if(session?.isLoggedIn && session?.permissions?.users) {
        const {password, repassword} = req.body;
        if(
            password === repassword &&
            pwdRegex.test(password) &&
            pwdRegex.test(repassword)
        ) {
            const client = new MongoClient(process.env.MONGO_URI as string);
            const database = client.db("site");
            const tab = database.collection("users");
            const hashPwd = bcrypt.hashSync(password, 10);
            const changePassword = await tab.updateOne({_id: new ObjectId(req.query.id as string)}, {$set: {password: hashPwd}});
            client.close();

            if(changePassword.acknowledged) {
                res.json({error: false});
            } else {
                res.json({error: true});
            }
        } else {
            res.json({error: true});
        }
    } else {
      res.json({error: true});
    }
  } else {
    res.json({error: true});
  }
}