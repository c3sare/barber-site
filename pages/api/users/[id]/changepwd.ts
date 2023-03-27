import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import Users from "@/models/User";

export default withIronSessionApiRoute(menuRoute, sessionOptions);

const pwdRegex =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

async function menuRoute(req: NextApiRequest, res: NextApiResponse) {
  const session = req.session.user;
  if (req.method === "POST") {
    if (!session?.isLoggedIn || !session?.permissions?.users)
      return res
        .status(403)
        .json({ message: "Nie masz uprawnień do tej ścieżki!" });

    const { password, repassword } = req.body;
    const { id } = req.query;

    if (
      !ObjectId.isValid(id as string) ||
      !password ||
      !repassword ||
      password !== repassword ||
      !pwdRegex.test(password) ||
      !pwdRegex.test(repassword)
    )
      return res
        .status(400)
        .json({ message: "Nieprawidłowe parametry zapytania!" });

    const _id = new ObjectId(id as string);
    const exist = await Users.findOne({ _id });

    if (!exist)
      return res
        .status(404)
        .json({ message: "Nie odnaleziono użytkownika od id " + id });

    const hashPwd = bcrypt.hashSync(password, 10);
    const changePassword = await Users.updateOne(
      { _id },
      { $set: { password: hashPwd } }
    );

    if (!changePassword)
      return res
        .status(500)
        .json({ message: "Wystąpił błąd poczas wykonywania zapytania!" });

    res.status(200).json({ error: false });
  } else {
    res.status(404);
  }
}
