import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { MongoClient, ObjectId } from "mongodb";

export default withIronSessionApiRoute(reservationsRoute, sessionOptions);

const dateRegex = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;
const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

async function reservationsRoute(req: NextApiRequest, res: NextApiResponse) {
  const session = req.session.user;
  if(req.method === "GET") {
    const {id, date} = req.query;
    const client = new MongoClient(process.env.MONGO_URI as string);
    const database = client.db("site");
    const tab = database.collection("reservations");
    const list = await tab.findOne({barber_id: id, date});
    if(list !== null) {
      const filteredItems = list.times.filter((item:any) => (item.reserved === false && item.reservedDate < new Date().getTime()) || item.reservedDate === "" && item.token === "");
      if(session?.isLoggedIn && session.permissions.reservations) {
        res.json(filteredItems);
      } else {
        res.json(filteredItems.map((item:any) => ({
          time: item.time
        })))
      }
    } else {
      res.json([]);
    }
  } else if(req.method === "DELETE") {
    const {id, date} = req.query;
    const {time} = req.body;
    if(timeRegex.test(time) && dateRegex.test(date as string)) {
      const client = new MongoClient(process.env.MONGO_URI as string);
      const database = client.db("site");
      const reservations = database.collection("reservations");
      const oldTimes = await reservations.findOne({barber_id: id, date});
      if(oldTimes !== null) {
        const day = await reservations.updateOne(
          {
            barber_id: id, date
          },
          {
            $set: {
              times: oldTimes.filter((item:any) => item.time !== time)
            }
          }
        );
        if(day.acknowledged !== undefined) {
          res.json({error: false});
        } else res.json({error: true});
      } else {
        res.json({error: true});
      }
    } else {
      res.json({error: true});
    }
  } else if(req.method === "PUT") {
    if(session?.isLoggedIn && session.permissions.reservations) {
      const {id, date} = req.query;
      const {time} = req.body;
      if(timeRegex.test(time) && dateRegex.test(date as string)) {
        const client = new MongoClient(process.env.MONGO_URI as string);
        const database = client.db("site");
        const reservations = database.collection("reservations");
        const workers = database.collection("barbers");
        const checkBarber = await workers.findOne({_id: new ObjectId(id as string)});
        if(checkBarber !== null) {
          const list = await reservations.findOne({barber_id: id, date});
          const itemToAdd = {
            time,
            reserved: false,
            mail: "",
            confirmed: false,
            token: "",
            reservedDate: "",
            person: "",
            phone: ""
          };
          if(list !== null) {
            if(list.times.filter((item:any) => item.time === time).length === 0) {

              const addTime = await reservations.updateOne(
                {
                  barber_id: id,
                  date
                },
                {
                  $set: {
                    times: [
                      ...list.times,
                      itemToAdd
                    ]
                  }
                }
              );
              if(addTime.acknowledged !== undefined) {
                res.json({error: false, item: itemToAdd});
              } else {
                res.json({error: true});
              }
            } else {
              res.json({error: true});
            }
          } else {
            const insert = await reservations.insertOne({
              date,
              barber_id: id,
              times: [itemToAdd]
            });
            if(insert.acknowledged !== undefined) {
              res.json({error: false});
            } else {
              res.json({error: true});
            }
          }
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