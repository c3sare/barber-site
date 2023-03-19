import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { MongoClient } from "mongodb";

interface ReservationTime {
  reserved: boolean,
  mail: string,
  confirmed: boolean,
  person: string,
  phone: string
}

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
  } else {
    res.json({error: true});
  }
}