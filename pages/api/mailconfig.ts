import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { MongoClient } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

export default withIronSessionApiRoute(footerRoute, sessionOptions);

interface MailConfig {
    host: string,
    port: number,
    mail: string,
    pwd: string
  }

function checkDataMailConfig(data:MailConfig) {
    const {host, mail, pwd, port} = data;
    const hostRegex = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/;
    const mailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    

    if(
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
  if(req.method === "POST") {
    const session = req.session.user;
    if(session?.isLoggedIn && session?.permissions?.smtpconfig) {
        const dataCheck = checkDataMailConfig(req.body);
        if(dataCheck) {
            let transport = nodemailer.createTransport({
                host: req.body.host,
                port: req.body.port,
                secure: false,
                auth: {
                    user: req.body.mail,
                    pass: req.body.pwd
                }
            });

            const result = await transport.verify();
            if(result) {
                const client = new MongoClient(process.env.MONGO_URI as string);
                const database = client.db("site");
                const tab = database.collection("mailConfig");
                tab.updateOne({}, {$set: {
                    host: req.body.host,
                    port: req.body.port,
                    mail: req.body.mail,
                    pwd: req.body.pwd
                }}).then(result => {
                    if(result.acknowledged) {
                        res.json({error: false});
                    } else {
                        res.json({error: true});
                    }
                })
                .catch(err => {
                    console.log(err);
                    res.json({error: true});
                })
                .finally(() => client.close());
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