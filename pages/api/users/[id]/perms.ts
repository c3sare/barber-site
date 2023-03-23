import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { MongoClient, ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

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

async function menuRoute(req: NextApiRequest, res: NextApiResponse) {
  const session = req.session.user;
  if(req.method === "POST" && session?.isLoggedIn && session?.permissions?.users) {
    const {id} = req.query;
    const permissions = req.body;
    if(validPermissions(permissions)) {
      const client = new MongoClient(process.env.MONGO_URI as string);
      const database = client.db("site");
      const tab = database.collection("users");
      const updatePerms = await tab.updateOne({_id: new ObjectId(id as string)}, {$set: {permissions}});
      client.close();
      res.json({error: !Boolean(updatePerms.acknowledged)});
    } else {
      res.json({error: true});
    }
  } else {
    res.json({error: true});
  }
}