import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import UserData from "@/lib/types/UserData";
import Users from "@/models/User";

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
    (permissions.basic === true || permissions.basic === false) &&
    (permissions.footer === true || permissions.footer === false) &&
    (permissions.menu === true || permissions.menu === false) &&
    (permissions.news === true || permissions.news === false) &&
    (permissions.workers === true || permissions.workers === false) &&
    (permissions.reservations === true || permissions.reservations === false) &&
    (permissions.smtpconfig === true || permissions.smtpconfig === false) &&
    (permissions.users === true || permissions.users === false)
  )
    return true;
  else return false;
};

const validUser = (
  login: string,
  password: string,
  repassword: string,
  permissions: Permissions
) => {
  const loginRegex = /^(?=.*[A-Za-z0-9]$)[A-Za-z][A-Za-z\d.-]{0,24}$/;
  const pwdRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  if (
    loginRegex.test(login) &&
    login.length > 5 &&
    login.length <= 25 &&
    pwdRegex.test(password) &&
    password.length >= 8 &&
    password === repassword &&
    validPermissions(permissions)
  )
    return true;
  else return false;
};

async function menuRoute(req: NextApiRequest, res: NextApiResponse) {
  const session = req.session.user;
  if (req.method === "GET") {
    if (!session?.isLoggedIn || !session?.permissions?.users)
      return res
        .status(403)
        .json({ message: "Nie masz uprawnień do tej ścieżki!" });

    const users = (await Users.find({})).map((item) => ({
      _id: item._id,
      login: item.login,
    }));

    res.status(200).json(users);
  } else if (req.method === "PUT") {
    if (!session?.isLoggedIn || !session?.permissions?.users)
      return res
        .status(403)
        .json({ message: "Nie masz uprawnień do tej ścieżki!" });

    const { login, password, repassword, permissions } = req.body;

    if (!validUser(login, password, repassword, permissions))
      return res
        .status(400)
        .json({ message: "Nieprawidłowe parametry zapytania!" });

    const userExist = await Users.findOne({ login });

    if (userExist)
      return res
        .status(409)
        .json({ message: "Konto o loginie " + login + " już istnieje!" });

    const genPassword = bcrypt.hashSync(password, 10);
    const insertUser = await Users.collection.insertOne({
      login,
      password: genPassword,
      permissions,
    });

    if (!insertUser)
      return res
        .status(500)
        .json({ message: "Wystąpił błąd poczas wykonywania zapytania!" });

    res.json({ error: false });
  } else if (req.method === "DELETE") {
    if (!session?.isLoggedIn || !session?.permissions?.users)
      return res
        .status(403)
        .json({ message: "Nie masz uprawnień do tej ścieżki!" });

    const loggedUser = session?.login;
    const { id } = req.body;

    if (!ObjectId.isValid(id as string))
      return res
        .status(400)
        .json({ message: "Nieprawidłowe parametry zapytania!" });

    const _id = new ObjectId(id);
    const checkUser = await Users.findOne({ _id });

    if (!checkUser)
      return res
        .status(404)
        .json({ message: "Nie odnaleziono użytkownika od id " + id });

    if (checkUser.login === loggedUser)
      return res
        .status(403)
        .json({ message: "Nie możesz usunąć własnego siebie!" });

    const delUser = await Users.deleteOne({ _id });

    if (!delUser)
      res
        .status(500)
        .json({ message: "Wystąpił błąd przy wykonywaniu zapytania!" });

    res.status(200).json({ error: false });
  } else {
    res.status(404);
  }
}
