import { sessionOptions } from "@/lib/AuthSession/Config";
import getMenu from "@/lib/getMenu";
import fs from "fs/promises";
import path from "path";
import { withIronSessionApiRoute } from "iron-session/next";
import { MongoClient, ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(menuRoute, sessionOptions);

const titleRegex =
  /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u;
const slugRegex = /^[a-z](-?[a-z])*$/;

async function menuRoute(req: NextApiRequest, res: NextApiResponse) {
  const user = req.session.user;
  if (req.method === "GET") {
    if (!user?.isLoggedIn || !user?.permissions?.menu)
      return res
        .status(403)
        .json({ message: "Brak uprawnień dla tej ścieżki!" });

    const menu = await getMenu();
    res.json(menu);
  } else if (req.method === "DELETE") {
    if (!user?.isLoggedIn || !user?.permissions?.menu)
      return res
        .status(403)
        .json({ message: "Brak uprawnień do tej ścieżki!" });
    const { id }: { id: string } = req.body;

    if (!ObjectId.isValid(id))
      return res
        .status(400)
        .json({ message: "Parametry zapytania są nieprawidłowe!" });

    const client = new MongoClient(process.env.MONGO_URI as string);
    const database = client.db("site");
    const tab = database.collection("menu");
    const deleteResult = await tab.deleteOne({
      _id: new ObjectId(id),
      default: false,
    });

    if (deleteResult.deletedCount !== 1) {
      client.close();
      return res
        .status(404)
        .json({ message: "Nie znaleziono elementu o id " + id });
    }

    const updateParentResult = await tab.updateMany(
      { parent: id },
      { $set: { parent: "" } }
    );
    if (!updateParentResult.acknowledged) {
      client.close();
      return res
        .status(500)
        .json({ message: "Wystąpił problem przy wykonaniu zapytania!" });
    }

    const pagesDir = path.join(process.cwd(), "pagecontent");
    fs.unlink(`${pagesDir}/${id}.json`);
    res.json({ error: false });
    client.close();
  } else if (req.method === "PUT") {
    if (!user?.isLoggedIn || !user?.permissions?.menu)
      return res
        .status(403)
        .json({ message: "Nie masz uprawnień do tej ścieżki!" });
    const { title, slug } = req.body;
    if (
      !titleRegex.test(title) &&
      !slugRegex.test(slug) &&
      title.length > 25 &&
      slug.length > 20
    )
      return res
        .status(400)
        .json({ message: "Nieprawidłowe parametry zapytania!" });

    const client = new MongoClient(process.env.MONGO_URI as string);
    const database = client.db("site");
    const tab = database.collection("menu");
    const allItems = (await tab.find({}).toArray()).filter(
      (item) => item.parent === ""
    );
    const insertResult = await tab.insertOne({
      title,
      slug,
      on: true,
      custom: true,
      order: allItems.length + 1,
      parent: "",
      default: false,
    });
    client.close();

    if (!insertResult.acknowledged)
      return res
        .status(500)
        .json({ message: "Wystąpił problem przy wykonaniu zapytania!" });

    const pagesDirectory = path.join(process.cwd(), "pagecontent");
    fs.appendFile(
      `${pagesDirectory}/${insertResult.insertedId.toString()}.json`,
      "{}"
    );

    return res.status(200).json({ error: false });
  } else {
    return res.status(404);
  }
}
