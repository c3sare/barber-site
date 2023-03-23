import { sessionOptions } from "@/lib/AuthSession/Config";
import getData from "@/utils/getData";
import { withIronSessionApiRoute } from "iron-session/next";
import { MongoClient, ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";

export default withIronSessionApiRoute(menuRoute, sessionOptions);

type Permissions = {
  basic: boolean,
  footer: boolean,
  menu: boolean,
  news: boolean,
  workers: boolean,
  reservations: boolean,
  smtpconfig: boolean,
  users: boolean
}

const validPermissions = (permissions:Permissions) => {
  if(
    (
      permissions.basic === true ||
      permissions.basic === false
    ) &&
    (
      permissions.footer === true ||
      permissions.footer === false
    ) &&
    (
      permissions.menu === true ||
      permissions.menu === false
    ) &&
    (
      permissions.news === true ||
      permissions.news === false
    ) &&
    (
      permissions.workers === true ||
      permissions.workers === false
    ) &&
    (
      permissions.reservations === true ||
      permissions.reservations === false
    ) &&
    (
      permissions.smtpconfig === true ||
      permissions.smtpconfig === false
    ) &&
    (
      permissions.users === true ||
      permissions.users === false
    )
  ) return true;
    else return false;
}

const validUser = (login:string, password:string, repassword:string, permissions:Permissions) => {
  const loginRegex = /^(?=.*[A-Za-z0-9]$)[A-Za-z][A-Za-z\d.-]{0,24}$/;
  const pwdRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  if(
    loginRegex.test(login) &&
    login.length > 5 &&
    login.length <= 25 &&
    pwdRegex.test(password) &&
    password.length >= 8 &&
    password === repassword &&
    validPermissions(permissions)
  )
    return true;
  else
    return false;
}

async function menuRoute(req: NextApiRequest, res: NextApiResponse) {
  const session = req.session.user;
  if(req.method === "GET" && session?.isLoggedIn && session?.permissions?.users) {
    const users = await getData("users");
    res.json(users);
  } else if(req.method === "PUT" && session?.isLoggedIn && session?.permissions?.users) {
    const {login, password, repassword, permissions} = req.body;
    if(validUser(login, password, repassword, permissions)) {
      const client = new MongoClient(process.env.MONGO_URI as string);
      const database = client.db("site");
      const tab = database.collection("users");
      const userExist = await tab.find({login}).toArray();
      if(userExist.length === 0) {
        const genPassword = bcrypt.hashSync(password, 10);
        const insertUser = await tab.insertOne({login, password: genPassword, permissions});
        res.json({error: !Boolean(insertUser.acknowledged)});
      } else {
        res.json({error: true});
      }
    } else res.json({error: true});
  } else if(req.method === "DELETE" && session?.isLoggedIn && session?.permissions?.users) {
    const loggedUser = session?.login;
    const {id} = req.body;
    const client = new MongoClient(process.env.MONGO_URI as string);
    const database = client.db("site");
    const tab = database.collection("users");
    const checkUser = await tab.findOne({_id: new ObjectId(id)});
    if(checkUser !== null && checkUser.login !== loggedUser) {
      const delUser = await tab.deleteOne({_id: new ObjectId(id)});
      res.json({error: !(delUser.deletedCount === 1)});
    } else {
      res.json({error: true});
    }
  } else {
    res.json({error: true});
  }
}