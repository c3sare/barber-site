import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { MongoClient, ObjectId } from "mongodb";

export default withIronSessionApiRoute(slidesRoute, sessionOptions);

function checkData({ title, desc }: any) {
  const titleDescRegex = /^(.|\s)*[a-zA-Z]+(.|\s)*$/;
  if (
    titleDescRegex.test(title) &&
    title.length > 0 &&
    title.length <= 80 &&
    titleDescRegex.test(desc) &&
    desc.length > 0 &&
    desc.length <= 800
  )
    return true;
  else return false;
}

async function slidesRoute(req: NextApiRequest, res: NextApiResponse) {
  const session = req.session.user;
  if (req.method === "POST") {
    if (!session?.isLoggedIn || !session?.permissions?.menu)
      return res
        .status(403)
        .json({ message: "Brak uprawnień dla tej ścieżki!" });

    const { title, desc }: { title: string; desc: string } = req.body;

    const { id } = req.query;

    if (
      !title ||
      !desc ||
      !checkData({ title, desc }) ||
      !ObjectId.isValid(id as string)
    )
      return res
        .status(400)
        .json({ message: "Nieprawidłowe parametry zapytania!" });

    const client = new MongoClient(process.env.MONGO_URI as string);
    const database = client.db("site");
    const tab = database.collection("slides");
    const _id = new ObjectId(id as string);
    const exist = await tab.findOne({ _id });

    if (!exist)
      return res
        .status(404)
        .json({ message: "Nie odnaleziono artykułu o id " + id });

    const update = await tab.updateOne({ _id }, { $set: { title, desc } });

    if (!update)
      res
        .status(500)
        .json({ message: "Wystąpił problem przy wykonywaniu zapytania!" });

    res.status(200).json({ error: false });
  } else {
    res.status(404);
  }
}
