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
  if(
    companyName.length <= 1 ||
    companyName.length > 20 ||
    !regexCompanyNameSlogan.test(companyName)
  ) return createResponse("Nazwa firmy jest nieprawidłowa!");

  if(
    slogan !== "" ||
    slogan.length > 20 ||
    (!regexCompanyNameSlogan.test(slogan) && slogan !== "")
  ) return createResponse("Slogan jest nieprawidłowy!");

  if(
    yearOfCreate < 1900 ||
    yearOfCreate > new Date().getFullYear() ||
    !yearOfCreate
  ) return createResponse("Rok założenia jest nieprawidłowy!");

  return createResponse("Dane zostały poprawnie uzupełnione!", false);
}

async function infoRoute(req: NextApiRequest, res: NextApiResponse) {
  const data = JSON.parse(req.body);
  if(req.method === "POST") {
    const session = req.session.user;
    if(session?.isLoggedIn && session.permissions.basic) {
        const valid = checkDataInfo(data);
        console.log(valid);
        if(!valid.error) {
          const result = await setBasicConfig(data);
          res.json(result);
        } else {
          res.json(valid);
        }
    } else {
        res.json({error: true});
    }
  } else {
    res.json({error: true});
  }
}