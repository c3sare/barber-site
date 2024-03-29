import { sessionOptions } from "@/lib/AuthSession/Config";
import dbConnect from "@/lib/dbConnect";
import MailConfig from "@/models/MailConfigs";
import User from "@/models/User";
import { withIronSessionApiRoute } from "iron-session/next";
import { Types } from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

export default withIronSessionApiRoute(footerRoute, sessionOptions);

interface MailConfig {
  host: string;
  port: number;
  mail: string;
  pwd: string;
}

function checkDataMailConfig(data: MailConfig) {
  const { host, mail, pwd, port } = data;
  const hostRegex =
    /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/;
  const mailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;

  if (
    hostRegex.test(host) &&
    mailRegex.test(mail) &&
    pwd?.length > 0 &&
    Number(port) > 0 &&
    Number(port) < 9999
  ) {
    return true;
  } else {
    return false;
  }
}

async function footerRoute(req: NextApiRequest, res: NextApiResponse) {
  const session = req.session.user;
  await dbConnect();
  let user = null;
  if (session?.id && session.isLoggedIn) {
    user = await User.findOne({ _id: new Types.ObjectId(session?.id) });
  }
  if (req.method === "POST") {
    if (!session?.isLoggedIn || !user?.permissions?.smtpconfig)
      return res
        .status(403)
        .json({ message: "Nie masz uprawnień do tej ścieżki!" });

    if (!checkDataMailConfig(req.body))
      return res
        .status(400)
        .json({ message: "Nieprawidłowe parametry zapytania!" });

    let transport = nodemailer.createTransport({
      host: req.body.host,
      port: req.body.port,
      secure: false,
      auth: {
        user: req.body.mail,
        pass: req.body.pwd,
      },
    });

    const result = await transport.verify();
    if (!result)
      return res.status(400).json({ message: "Dane są nieprawidłowe!" });

    const update = await MailConfig.updateOne(
      {},
      {
        $set: {
          host: req.body.host,
          port: req.body.port,
          mail: req.body.mail,
          pwd: req.body.pwd,
        },
      }
    );

    if (!update)
      return res
        .status(500)
        .json({ message: "Wystąpił błąd przy wykonywaniu zapytania!" });

    res.json({ error: false });
  } else {
    return res.status(404);
  }
}
