import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { ObjectId } from "mongodb";
import nodemailer from "nodemailer";
import ReservationData from "@/lib/types/ReservationData";
import MailConfigData from "@/lib/types/MailConfigData";
import Reservation from "@/models/Reservation";
import Barbers from "@/models/Barber";
import MailConfig from "@/models/MailConfigs";
import dbConnect from "@/lib/dbConnect";

interface ReservationTime {
  reserved: boolean;
  mail: string;
  confirmed: boolean;
  person: string;
  phone: string;
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
};

const dateRegex = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;
const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

const personRegex =
  /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u;
const phoneRegex =
  /(?<!\w)(\(?(\+|00)?48\)?)?[ -]?\d{3}[ -]?\d{3}[ -]?\d{3}(?!\w)/;
const mailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

const checkFetchData = (data: ReservationTime) => {
  const { reserved, mail, confirmed, person, phone } = data;

  if (
    typeof reserved === "boolean" &&
    typeof confirmed === "boolean" &&
    mailRegex.test(mail) &&
    personRegex.test(person) &&
    phoneRegex.test(phone)
  )
    return true;
  else return false;
};

export default withIronSessionApiRoute(reservationsRoute, sessionOptions);

async function reservationsRoute(req: NextApiRequest, res: NextApiResponse) {
  const session = req.session.user;
  await dbConnect();
  if (req.method === "GET") {
    if (!session?.isLoggedIn || !session?.permissions?.reservations)
      return res
        .status(403)
        .json({ message: "Brak uprawnień do tej ścieżki!" });

    const { id, date, time } = req.query;

    if (
      !ObjectId.isValid(id as string) ||
      !dateRegex.test(date as string) ||
      !timeRegex.test(time as string)
    )
      return res
        .status(400)
        .json({ message: "Nieprawidłowe parametry zapytania!" });

    const list = await Reservation.findOne({ barber_id: id, date });
    if (!list)
      return res.status(404).json({
        message: "Nie odnaleziono rezerwacji dla id " + id + " w dniu " + date,
      });

    const timeFromList = list.times.find((item: any) => item.time === time);
    if (!timeFromList)
      return res.status(404).json({
        message:
          "Nie znaleziono rezerwacji z dnia " +
          date +
          " i godziny " +
          time +
          " dla pracownika " +
          id,
      });

    res.status(200).json(timeFromList);
  } else if (req.method === "POST") {
    if (!session?.isLoggedIn || !session?.permissions?.reservations)
      return res
        .status(403)
        .json({ message: "Brak uprawnień do tej ścieżki!" });

    const { id, date, time } = req.query;

    if (
      !checkFetchData(req.body) ||
      !ObjectId.isValid(id as string) ||
      !dateRegex.test(date as string) ||
      !timeRegex.test(time as string)
    )
      return res
        .status(400)
        .json({ message: "Parametry zapytania są nieprawidłowe!" });

    const { reserved, mail, person, phone } = req.body;

    const toUpdate = (await Reservation.findOne({
      barber_id: id,
      date,
    })) as ReservationData;

    if (!toUpdate || toUpdate?.times?.find((item) => item.time === time))
      return res.status(404).json({
        message: "Nie znaleziono rezerwacji dla id " + id + " z dnia " + date,
      });

    const newTimes = toUpdate.times.map((item: any) => {
      if (item.time === time) {
        return {
          reserved,
          mail,
          person,
          phone,
          token: item.token,
          time: item.time,
          reservedDate: item.reservedDate,
        };
      } else {
        return item;
      }
    });

    const updateTimes = await Reservation.updateOne(
      {
        barber_id: id,
        date,
      },
      {
        $set: {
          times: newTimes,
        },
      }
    );

    if (!updateTimes)
      return res
        .status(500)
        .json({ message: "Wystąpił problem przy aktualizacji bazy!" });

    return res.status(200).json({ error: true });
  } else if (req.method === "PUT") {
    const { id, date, time } = req.query;
    if (
      !id ||
      !date ||
      !time ||
      !ObjectId.isValid(id as string) ||
      !timeRegex.test(time as string) ||
      !dateRegex.test(date as string) ||
      date < getTodayDate()
    )
      return res
        .status(400)
        .json({ message: "Parametry zapytania są nieprawidłowe!" });

    const { firstname, lastname, phone, mail } = req.body;

    if (
      !firstname ||
      !personRegex.test(firstname) ||
      !lastname ||
      !personRegex.test(lastname) ||
      !phone ||
      !mail ||
      !phoneRegex.test(phone) ||
      !mailRegex.test(mail)
    )
      return res
        .status(400)
        .json({ message: "Parametry zapytania są nieprawidłowe!" });

    const checkBarber = await Barbers.findOne({
      _id: new ObjectId(id as string),
    });

    if (!checkBarber)
      return res
        .status(404)
        .json({ message: "Nie znaleziono pracownika o id " + id });

    const day = (await Reservation.findOne({
      date,
      barber_id: id,
    })) as ReservationData;
    if (!day || !day.times.find((item) => item.time === time))
      return res.status(404).json({
        message:
          "Nie znaleziono rezerwacji " +
          date +
          " o godzinie " +
          time +
          " dla pracownika o id " +
          id,
      });

    const token = Math.random().toString(36).slice(-8);
    day.times.forEach((item) => {
      if (item.time === time) {
        item.person = firstname + " " + lastname;
        item.phone = phone;
        item.mail = mail;
        item.reservedDate = new Date().getTime() + 1000 * 60 * 5;
        item.token = token;
      }
    });

    const updateDay = await Reservation.updateOne(
      { barber_id: id, date },
      { $set: { times: day.times } }
    );

    if (!updateDay)
      return res
        .status(500)
        .json({ message: "Wystąpił problem przy wykonywaniu zapytania!" });

    const config = (await MailConfig.findOne({})) as MailConfigData;
    if (!config)
      return res
        .status(500)
        .json({ message: "Wystąpił problem przy pobieraniu danych!" });

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
      from: config.mail,
      to: mail,
      subject: "Potwierdź swoją rezerwację",
      text: `Witaj ${firstname} ${lastname},\nData: ${date}\nCzas:${time}\n\nAby potiwierdźić rezerwację skontaktuj się z nami\nlub kliknij poniższy adres strony.\n \n${
        req.headers.referer?.slice(0, req.headers.referer.indexOf("://")) +
        "://" +
        req.headers.host
      }/reservations/confirm/${day._id}/${token}`,
    };

    transporter.sendMail(mailOptions, function (err: any, data: any) {
      if (err) {
        console.log("Error " + err);
      } else {
        console.log("Email to confirm reservation is sent.");
      }
    });

    return res.status(200).json({ error: false });
  } else {
    return res.status(404);
  }
}
