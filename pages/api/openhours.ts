import { sessionOptions } from "@/lib/AuthSession/Config";
import dbConnect from "@/lib/dbConnect";
import OpenHour from "@/models/OpenHour";
import User from "@/models/User";
import { withIronSessionApiRoute } from "iron-session/next";
import { Types } from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(openHoursRoute, sessionOptions);

const checkOpenHoursData = (data: any[]) => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  for (let i = 0; i < data.length; i++) {
    if (data[i].closed === false) {
      if (!timeRegex.test(data[i].start) || !timeRegex.test(data[i].end))
        return false;
    }
  }
  return true;
};

async function openHoursRoute(req: NextApiRequest, res: NextApiResponse) {
  const session = req.session.user;
  await dbConnect();
  let user = null;
  if (session?.id && session.isLoggedIn) {
    user = await User.findOne({ _id: new Types.ObjectId(session?.id) });
  }
  if (req.method === "GET") {
    if (!session?.isLoggedIn || !user?.permissions?.menu)
      return res
        .status(403)
        .json({ message: "Nie masz uprawnień do tej ścieżki!" });

    const data = await OpenHour.find({});
    let newData: any = {};

    data.forEach((item: any) => {
      if (item.closed)
        newData[item.short] = { start: "", end: "", closed: true };
      else {
        newData[item.short] = {
          start: item.start,
          end: item.end,
          closed: false,
        };
      }
    });

    res.json(newData);
  } else if (req.method === "POST") {
    if (!session?.isLoggedIn || !user?.permissions?.menu)
      return res
        .status(403)
        .json({ message: "Nie masz uprawnień do tej ścieżki!" });

    if (!checkOpenHoursData(req.body))
      return res
        .status(400)
        .json({ message: "Nieprawidłowe parametry zapytania!" });

    const results: boolean[] = [];
    await req.body.forEach(async (day: any) => {
      const $set = day.closed
        ? {
            closed: true,
            start: "",
            end: "",
          }
        : {
            closed: false,
            start: day.start,
            end: day.end,
          };

      const update = await OpenHour.updateOne({ short: day.short }, { $set });
      results.push(Boolean(update));
    });

    if (results.filter((item) => item === false).length > 0)
      return res
        .status(500)
        .json({ message: "Wystąpił błąd podczas wykonywania zapytań!" });

    res.json({ error: false });
  } else {
    res.status(404);
  }
}
