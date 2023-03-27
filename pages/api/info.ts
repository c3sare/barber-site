import { sessionOptions } from "@/lib/AuthSession/Config";
import InfoData from "@/lib/types/InfoData";
import Info from "@/models/Info";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(infoRoute, sessionOptions);

function checkDataInfo(data: InfoData) {
  const { companyName, slogan, yearOfCreate } = data;
  const regexCompanyNameSlogan = /^[a-zA-Z][a-zA-Z0-9-_.\s]{1,20}$/i;
  if (!companyName || !slogan || !yearOfCreate) return false;
  if (
    (companyName.length > 0 &&
      companyName.length <= 20 &&
      regexCompanyNameSlogan.test(companyName) &&
      slogan.length > 0 &&
      slogan.length <= 20) ||
    (regexCompanyNameSlogan.test(slogan) &&
      yearOfCreate > 1900 &&
      yearOfCreate <= new Date().getFullYear())
  )
    return true;
  else return false;
}

async function infoRoute(req: NextApiRequest, res: NextApiResponse) {
  const session = req.session.user;
  if (req.method === "POST") {
    if (!session?.isLoggedIn || !session?.permissions?.basic)
      return res.status(403);
    const { companyName, yearOfCreate, slogan } = req.body;
    if (!checkDataInfo({ companyName, yearOfCreate, slogan }))
      return res
        .status(400)
        .json({ message: "Parametry zapytania są nieprawidłowe!" });

    const updateData = await Info.updateOne(
      {},
      { companyName, yearOfCreate, slogan }
    );

    if (!updateData)
      return res
        .status(500)
        .json({ message: "Wystąpił błąd przy umieszczaniu pliku!" });

    res.status(200).json({ error: false });
  } else {
    return res.status(404);
  }
}
