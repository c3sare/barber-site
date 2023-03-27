import { sessionOptions } from "@/lib/AuthSession/Config";
import Cost from "@/models/Cost";
import { withIronSessionApiRoute } from "iron-session/next";
import { ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(costsRoute, sessionOptions);

async function costsRoute(req: NextApiRequest, res: NextApiResponse) {
  const user = req.session.user;
  if (req.method === "GET") {
    if (!user?.isLoggedIn || !user?.permissions?.menu)
      return res
        .status(403)
        .json({ message: "Nie posiadasz uprawnień do tej ścieżki!" });

    const items = await Cost.find({});
    res.status(200).json(items);
  } else if (req.method === "PUT") {
    if (!user?.isLoggedIn || !user?.permissions?.menu)
      return res
        .status(403)
        .json({ message: "Nie posiadasz uprawnień do tej ścieżki!" });

    const { category }: Partial<{ category: string }> = req.body;
    const categoryRegex = /^(.|\s)*[a-zA-Z]+(.|\s)*$/;

    if (!category)
      return res
        .status(400)
        .json({ message: "Nieprawidłowe parametry zapytania" });

    if (
      category.length > 0 &&
      category.length <= 80 &&
      categoryRegex.test(category)
    ) {
      const insertCategory = await Cost.collection.insertOne({
        category,
        services: [],
      });
      res.status(200).json({
        error: false,
        id: insertCategory.insertedId,
        msg: "Kategoria została dodana prawidłowo!",
      });
    } else {
      res
        .status(200)
        .json({ error: true, msg: "Nieprawidłowo wypełnione pola!" });
    }
  } else if (req.method === "DELETE") {
    if (!user?.isLoggedIn || !user?.permissions?.menu)
      return res
        .status(403)
        .json({ message: "Nie posiadasz uprawnień do tej ścieżki!" });

    const {
      id,
    }: {
      id: string;
    } = req.body;

    if (!ObjectId.isValid(id as string))
      return res.status(500).json({ message: "Zapytanie jest nieprawidłowe!" });

    const _id = new ObjectId(id);
    const findItem = await Cost.findOne({ _id });

    if (findItem === null)
      return res
        .status(404)
        .json({ message: "Nie znaleziono rekordu o identyfiaktorze " + id });

    const deleteItem = await Cost.deleteOne({ _id });

    if (deleteItem.deletedCount !== 1)
      return res
        .status(500)
        .json({ message: "Nie udało się wykonać tego zapytania!" });

    res.status(200).json({ error: false });
  } else {
    return res.status(404).json({ message: "Nie odnaleziono ścieżki!" });
  }
}
