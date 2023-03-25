import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { MongoClient, ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(menuRoute, sessionOptions);

type Permissions = {
  basic: boolean;
  footer: boolean;
  menu: boolean;
  news: boolean;
  workers: boolean;
  reservations: boolean;
  smtpconfig: boolean;
  users: boolean;
};

const validPermissions = (permissions: Permissions) => {
  if (
    (permissions?.basic === true || permissions?.basic === false) &&
    (permissions?.footer === true || permissions?.footer === false) &&
    (permissions?.menu === true || permissions?.menu === false) &&
    (permissions?.news === true || permissions?.news === false) &&
    (permissions?.workers === true || permissions?.workers === false) &&
    (permissions?.reservations === true ||
      permissions?.reservations === false) &&
    (permissions?.smtpconfig === true || permissions?.smtpconfig === false) &&
    (permissions?.users === true || permissions?.users === false)
  )
    return true;
  else return false;
};

async function menuRoute(req: NextApiRequest, res: NextApiResponse) {
  const session = req.session.user;
  if (req.method === "POST") {
    if (!session?.isLoggedIn || !session?.permissions?.users)
      return res
        .status(403)
        .json({ message: "Nie masz uprawnień do tej ścieżki!" });

    const { id } = req.query;
    const permissions = req.body;
    if (!validPermissions(permissions) || !ObjectId.isValid(id as string))
      return res
        .status(400)
        .json({ message: "Nieprawidłowe parametry zapytania!" });

    const client = new MongoClient(process.env.MONGO_URI as string);
    const database = client.db("site");
    const tab = database.collection("users");
    const _id = new ObjectId(id as string);
    const exist = await tab.findOne({ _id });

    if (!exist)
      return res
        .status(404)
        .json({ message: "Nie odnaleziono użytkownika od id " + id });

    const updatePerms = await tab.updateOne({ _id }, { $set: { permissions } });

    client.close();

    if (!updatePerms)
      return res
        .status(500)
        .json({ message: "Wystąpił błąd poczas wykonywania zapytania!" });

    res.json({ error: false });
  } else {
    return res.status(404);
  }
}
