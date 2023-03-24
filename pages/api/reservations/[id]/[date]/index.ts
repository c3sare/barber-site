import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { MongoClient, ObjectId } from "mongodb";
import ReservationData from "@/lib/types/ReservationData";

export default withIronSessionApiRoute(reservationsRoute, sessionOptions);

const dateRegex = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;
const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

async function reservationsRoute(req: NextApiRequest, res: NextApiResponse) {
  const session = req.session.user;
  if (req.method === "GET") {
    const { id, date } = req.query;

    if (!ObjectId.isValid(id as string) || !dateRegex.test(date as string))
      return res
        .status(500)
        .json({ message: "Parametry zapytnia są nieprawidłowe!" });

    const client = new MongoClient(process.env.MONGO_URI as string);
    const database = client.db("site");
    const tab = database.collection("reservations");
    const list = (await tab.findOne({
      barber_id: id,
      date,
    })) as ReservationData;

    if (!list) return res.status(200).json([]);

    const filteredItems = list.times.filter(
      (item) =>
        (item.reserved === false && item.reservedDate < new Date().getTime()) ||
        (item.reservedDate === "" && item.token === "")
    );

    return res.status(200).json(
      filteredItems.map((item) => ({
        time: item.time,
      }))
    );
  } else if (req.method === "DELETE") {
    if (!session?.isLoggedIn || !session?.permissions?.reservations)
      return res
        .status(403)
        .json({ message: "Brak uprawnień do tej ścieżki!" });

    const { id, date } = req.query;
    const { time } = req.body;

    if (
      !ObjectId.isValid(id as string) ||
      !dateRegex.test(date as string) ||
      !timeRegex.test(time as string)
    )
      return res
        .status(400)
        .json({ message: "Parametry zapytania są nieprawidłowe!" });

    const client = new MongoClient(process.env.MONGO_URI as string);
    const database = client.db("site");
    const reservations = database.collection("reservations");
    const oldTimes = (await reservations.findOne({
      barber_id: id,
      date,
    })) as ReservationData;
    if (!oldTimes)
      return res.status(404).json({
        message: "Nie odnaleziono zapytania dla id " + id + " z dnia " + date,
      });

    const day = await reservations.updateOne(
      {
        barber_id: id,
        date,
      },
      {
        $set: {
          times: oldTimes.times.filter((item) => item.time !== time),
        },
      }
    );

    if (!day)
      res
        .status(500)
        .json({ message: "Wystąpił błąd przy wykonywaniu zapytania!" });

    res.status(200).json({ error: false });
  } else if (req.method === "PUT") {
    const { id, date } = req.query;
    const { time } = req.body;
    if (
      !ObjectId.isValid(id as string) ||
      !timeRegex.test(time as string) ||
      !dateRegex.test(date as string)
    )
      return res
        .status(400)
        .json({ message: "Parametry zapytania są nieprawidłowe!" });

    const client = new MongoClient(process.env.MONGO_URI as string);
    const database = client.db("site");
    const reservations = database.collection("reservations");
    const workers = database.collection("barbers");
    const checkBarber = await workers.findOne({
      _id: new ObjectId(id as string),
    });

    if (!checkBarber)
      return res
        .status(404)
        .json({ message: "Nie odnaleziono pracownika o id " + id });

    const list = (await reservations.findOne({
      barber_id: id,
      date,
    })) as ReservationData;
    const itemToAdd = {
      time,
      reserved: false,
      mail: "",
      token: "",
      reservedDate: "",
      person: "",
      phone: "",
    };

    if (!list) {
      const insert = await reservations.insertOne({
        date,
        barber_id: id,
        times: [itemToAdd],
      });
      if (!insert)
        return res
          .status(500)
          .json({ message: "Wystąpił problem przy wykonywaniu zapytania!" });

      return res.status(200).json({ error: false, item: itemToAdd });
    }
    if (!list.times.find((item) => item.time === time))
      return res.status(409).json({
        message:
          "Rezerwacja dnia " + date + " o godzinie " + time + " już istnieje!",
      });

    const addTime = await reservations.updateOne(
      {
        barber_id: id,
        date,
      },
      {
        $set: {
          times: [...list.times, itemToAdd],
        },
      }
    );
    if (!addTime)
      return res
        .status(500)
        .json({ message: "Wystąpił błąd przy wykonywaniu zapytania!" });

    return res.status(20).json({ error: false, item: itemToAdd });
  } else {
    res.status(404);
  }
}
