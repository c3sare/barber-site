import Layout from '@/components/Layout';
import getMenu from '@/lib/getMenu';
import { getDataOne } from '@/utils/getData';
import { MongoClient, ObjectId } from 'mongodb';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import nodemailer from "nodemailer";

const PageNotFound = ({menu, footer, info, result}: any) => {
    const router = useRouter();
    const [timer, setTimer] = useState(5);

    useEffect(() => {
        const x = setInterval(() => {
            setTimer(prev => {
                if(prev === 1) {
                    router.push("/");
                    clearInterval(x);
                }
                return prev-1;
            });
        }, 1000);

        return () => clearInterval(x);
    }, []);

    return (
        <Layout menu={menu} footer={footer} info={info} title="Potwierdzenie rezerwacji">
            <div style={{textAlign: "center"}}>
                <h1>Potwierdzenie rezerwacji</h1>
                <p>
                    {result.msg}<br/>
                    za {timer} sekund zostaniesz przeniesiony na <Link href="/"><b>Stronę Główną</b></Link>
                </p>
            </div>
        </Layout>
    );
}
 
export default PageNotFound;

export async function getServerSideProps({req, query}:any) {
    const menu = await getMenu();
    const footer = await getDataOne("footer");
    const info = await getDataOne("info");
    const {dayid, token} = query;

    const client = new MongoClient(process.env.MONGO_URI as string);
    const database = client.db("site");
    const reservations = database.collection("reservations");
    const _id = new ObjectId(dayid);
    const day = await reservations.findOne({_id});

    if(day !== null && day.times.filter((item:any) => !item.reserved && item.token === token)) {
        const newTimes = [...day.times].map((item: any) => {
            if(item.token === token) {
                item.reserved = true;
                item.reservedDate = "";
            }
            return item;
        });

        const updateDay = await reservations.updateOne({_id}, {$set: {times: newTimes}});

        if(updateDay.acknowledged !== undefined) {
            const mailConfig = database.collection("mailConfig");
            const config:any = await mailConfig.findOne({});
            if(config !== null) {
              const transporter = nodemailer.createTransport({
                host: config.host,
                port: config.port,
                secure: false,
                auth: {
                    user: config.mail,
                    pass: config.pwd,
                },
            });

            const {person, mail, time} = day.find((item:any) => item.token === token);

              let mailOptions:any = {
                from: config.mail,
                to: mail,
                subject: 'Twoja rezerwacja została potwierdzona',
                text: `Witaj ${person},\nData: ${day.date}\nCzas:${time}\n\nTwoja rezerwacja została potwierdzona, skontaktuj się z nami\nlub kliknij poniższy adres strony jeśli chcesz z niej zrezygnować.\n \n${req.headers.referer?.slice(0, req.headers.referer.indexOf("://"))+"://"+req.headers.host}/reservations/cancel/${day._id}/${token}`
              };

              transporter.sendMail(mailOptions, function(err:any, data:any) {
                if (err) {
                  console.log("Error " + err);
                } else {
                  console.log("Email to confirm reservation is sent.");
                }
              });
            }

            return {
                props: {
                  menu,
                  footer,
                  info,
                  result: {
                    error: false,
                    msg: "Rezerwacja została potwierdzona!"
                  }
                }
            }
        } else {
            return {
                props: {
                  menu,
                  footer,
                  info,
                  result: {
                    error: true,
                    msg: "Nie było możliwe potwierdzenie rezerwacji!"
                  }
                }
              }
        }

    } else {
        return {
            props: {
              menu,
              footer,
              info,
              result: {
                error: true,
                msg: "Nie odnaleziono rezerwacji do potwierdzenia!"
              }
            }
          }
    }
}