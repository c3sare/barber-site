import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import Uswork from "@/models/Uswork";
import dbConnect from "@/lib/dbConnect";
import { Types } from "mongoose";
import User from "@/models/User";
import awsGetImages from "@/utils/awsGetImages";

export default withIronSessionApiRoute(usworkRoute, sessionOptions);

async function usworkRoute(req: NextApiRequest, res: NextApiResponse) {
  const session = req.session.user;
  await dbConnect();
  let user = null;
  if (session?.id && session.isLoggedIn) {
    user = await User.findOne({ _id: new Types.ObjectId(session?.id) });
  }
  if (req.method === "PUT") {
    if (!session?.isLoggedIn || !user?.permissions?.menu)
      return res
        .status(403)
        .json({ message: "Nie masz uprawnień do tej ścieżki!" });

    const { name }: any = req.body;

    const images = (await awsGetImages()) as any;

    if (!images.find((item: any) => item.Key === name))
      return res.status(404).json({ message: "Wybrana grafika nie istnieje!" });

    const insert = await Uswork.collection.insertOne({ image: name });

    if (!insert)
      return res
        .status(500)
        .json({ message: "Wystąpił błąd przy wykonywaniu zapytania!" });

    res.json({ error: false, _id: insert.insertedId, image: name });
  } else if (req.method === "DELETE") {
    if (!session?.isLoggedIn || !user?.permissions?.menu)
      return res
        .status(403)
        .json({ message: "Nie masz uprawnień do tej ścieżki!" });

    const { id } = req.body;

    if (!Types.ObjectId.isValid(id))
      return res
        .status(400)
        .json({ message: "Nieprawidłowe parametry zapytania!" });

    const _id = new Types.ObjectId(id);
    const itemToDelete = await Uswork.findOne({ _id });

    if (!itemToDelete)
      return res
        .status(404)
        .json({ message: "Nie odnaleziono obiektu o id " + id });

    const delItem = await Uswork.deleteOne({ _id });
    if (!delItem)
      return res
        .status(500)
        .json({ message: "Wystąpił błąd przy usuwaniu obiektu!" });

    res.json({ error: false });
  } else {
    res.status(404);
  }
}
