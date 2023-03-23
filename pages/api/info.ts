import { sessionOptions } from "@/lib/AuthSession/Config";
import InfoData from "@/lib/types/InfoData";
import { setBasicConfig } from "@/utils/getData";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(infoRoute, sessionOptions);

function createResponse(msg: string, error: boolean = true) {
  return ({
    error, msg
  })
}

function checkDataInfo(data:InfoData) {
  const {companyName, slogan, yearOfCreate} = data;
  const regexCompanyNameSlogan = /^[a-zA-Z][a-zA-Z0-9-_.\s]{1,20}$/i;
  if(!companyName || !slogan || !yearOfCreate) return createResponse("Dane są nieprawidłowe!");
  if(
    companyName.length > 0 &&
    companyName.length <= 20 &&
    regexCompanyNameSlogan.test(companyName) &&
    slogan.length > 0 &&
    slogan.length <= 20 ||
    regexCompanyNameSlogan.test(slogan) &&
    yearOfCreate > 1900 &&
    yearOfCreate <= new Date().getFullYear()
  )
    return createResponse("Dane są prawidłowe!", false);
  else 
    return createResponse("Dane są nieprawidłowe!");
}

async function infoRoute(req: NextApiRequest, res: NextApiResponse) {
  const session = req.session.user;
  switch(req.method) {
    case 'POST':
      if(!session?.isLoggedIn || !session?.permissions?.basic) return res.status(403);
      const data = JSON.parse(req.body);
      const valid = checkDataInfo(data);
      if(!valid.error) {
        const result = await setBasicConfig(data);
        res.status(200).json(result);
      } else {
        return res.status(200).json(valid);
      }
    default:
      return res.status(404).redirect("/404");
  }
}