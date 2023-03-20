import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { MongoClient, ObjectId } from "mongodb";
import nodemailer from "nodemailer";

interface ReservationTime {
  reserved: boolean,
  mail: string,
  confirmed: boolean,
  person: string,
  phone: string
}

const getTodayDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month =
    date.getMonth() + 1 < 10
      ? "0" + (date.getMonth() + 1)
      : date.getMonth() + 1;
  const day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();

  return `${year}-${month}-${day}`;
}

const dateRegex = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;
const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

const checkFetchData = (data:ReservationTime) => {
  const personRegex = /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u;
  const phoneRegex = /(?<!\w)(\(?(\+|00)?48\)?)?[ -]?\d{3}[ -]?\d{3}[ -]?\d{3}(?!\w)/;
  const mailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

  const {reserved, mail, confirmed, person, phone} = data;

  if(
    typeof reserved === "boolean" &&
    typeof confirmed === "boolean" &&
    mailRegex.test(mail) &&
    personRegex.test(person) &&
    phoneRegex.test(phone)
  ) return true;
  else return false;
}

export default withIronSessionApiRoute(reservationsRoute, sessionOptions);

async function reservationsRoute(req: NextApiRequest, res: NextApiResponse) {
  if(req.method === "GET") {
    console.log(req.url);
    const session = req.session.user;
    if(session?.isLoggedIn && session.permissions.reservations) {
      const {id, date, time} = req.query;
      const client = new MongoClient(process.env.MONGO_URI as string);
      const database = client.db("site");
      const tab = database.collection("reservations");
      const list = await tab.findOne({barber_id: id, date});
        if(list !== null) {
            const timeFromList = list.times.find((item:any) => item.time === time);
            if(timeFromList !== undefined) {
                res.json(timeFromList);
            } else res.json({})
        } else {
            res.json({});
        }
    } else {
        res.json({});
    }
  } else if(req.method === "POST") {
    const session = req.session.user;
    if(session?.isLoggedIn && session.permissions.reservations) {
      if(checkFetchData(req.body)) {
        const {id, date, time} = req.query;
        const {reserved, mail, confirmed, person, phone} = req.body;
        const client = new MongoClient(process.env.MONGO_URI as string);
        const database = client.db("site");
        const tab = database.collection("reservations");
        const toUpdate = await tab.findOne({barber_id: id, date});
        if(toUpdate !== null && toUpdate?.times?.filter((item:any) => item.time === time)?.length === 1) {
          const newTimes = toUpdate.times.map((item:any) => {
            if(item.time === time) {
              return ({
                reserved,
                mail,
                confirmed,
                person,
                phone,
                token: item.token,
                time: item.time,
                reservedDate: item.reservedDate 
              })
            } else {
              return item;
            }
          })

          const updateTimes = await tab.updateOne({
            barber_id: id, date
          }, {
            $set: {
              times: newTimes
            }
          });

          if(updateTimes.modifiedCount === 1) {
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
  } else if(req.method === "PUT") {
    const {id, date, time} = req.query;
    if(
      id !== undefined &&
      date !== undefined &&
      time !== undefined &&
      timeRegex.test(time as string) &&
      dateRegex.test(date as string) &&
      (date as any) >= getTodayDate()
    ) {
      const {firstname, lastname, phone, mail} = req.body;
      const client = new MongoClient(process.env.MONGO_URI as string);
      const database = client.db("site");
      const barbers = database.collection("barbers");
      const reservations = database.collection("reservations");
      const checkBarber = await barbers.findOne({_id: new ObjectId(id as string)});
      if(checkBarber !== null) {
        const day = await reservations.findOne({date, barber_id: id});
        if(day !== null) {
          if(day.times.filter((item:any) => item.time === time).length === 1) {
            const token = Math.random().toString(36).slice(-8);
            day.times.forEach((item:any) => {
              if(item.time === time) {
                item.person = firstname + " " + lastname;
                item.phone = phone;
                item.mail = mail;
                item.reservedDate = new Date().getTime() + (1000*60*5);
                item.token = token;
              }
            });
            const updateDay = await reservations.updateOne({barber_id: id, date}, {$set: {times: day.times}});

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
  
                let mailOptions = {
                  from: 'c3saren@gmail.com',
                  to: mail,
                  subject: 'Twoja rezerwacja została potwierdzona',
                  text: `Witaj ${firstname} ${lastname},\nData: ${date}\nCzas:${time}\n\nRezerwacja została potwierdzona,\naby anulować rezerwację skontaktuj się z nami\nlub kliknij poniższy link.\n \n${req.headers.referer?.slice(0, req.headers.referer.indexOf("://"))+"://"+req.headers.host}/reservations/confirm/${day._id}/${token}`
                };
  
                transporter.sendMail(mailOptions, function(err:any, data:any) {
                  if (err) {
                    console.log("Error " + err);
                  } else {
                    console.log("Email to confirm reservation is sent.");
                  }
                });
              }

              res.json({error: false, msg: "Rezerwacja została pomyślnie żłożona!"});
            } else {
              res.json({error: true, msg: "Wystąpił błąd przy rezerwacji!"});
            }
          } else res.json({error: true, msg: "Wystąpił błąd przy rezerwacji!"});
        } else {
          res.json({error: true, msg: "Wystąpił błąd przy rezerwacji!"});
        }
      } else {
        res.json({error: true, msg: "Wystąpił błąd przy rezerwacji!"});
      }
    }
  } else {
    res.json({error: true, msg: "Wystąpił błąd przy rezerwacji!"});
  }
}