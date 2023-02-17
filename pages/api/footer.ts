import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs/promises";
import path from "path";
import { setFooterConfig } from "@/utils/getData";

export interface FormDataFooter {
    btnMore: boolean,
    btnTitle?: string,
    btnLink?: string,
    desc: string,
    logo: any,
    linkBoxes: {
        name: string,
        links: {
            id: number,
            name: string,
            url: string
        }[]
    }[]
}

export default withIronSessionApiRoute(footerRoute, sessionOptions);
  
  async function handlePostFormReq(req:NextApiRequest, res:NextApiResponse) {
    const form = formidable({ multiples: true });
  
    const formData = new Promise((resolve, reject) => {
      form.parse(req, async (err, fields, files) => {
        if (err) {
          reject("error");
        }
        const data = JSON.parse(fields.data as string);
        const logo = data?.logo ? {} : {logo: files.file};
        resolve({ ...data, ...logo });
      });
    });

    const data = (await formData) as FormDataFooter;

    return data;
}

function createResponse(msg: string, error: boolean = true) {
  return ({error, msg})
}

async function checkDataFooter(data:FormDataFooter) {
  const regexBtnTitle = /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u;
  const regexBtnLink = /(www|http:|https:|^\/)+[^\s]+[\w]/;
  const regexDesc = /^(.|\s)*[a-zA-Z]+(.|\s)*$/;
  const regexLinkBoxName = /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u;

  if(typeof data.logo === "string") {
    const imagesDirectory = path.join(process.cwd(), 'public');
    const checkFile = await fs.stat(`${imagesDirectory}/images/${data.logo as string}`);
    if(
      !checkFile.isFile()
    ) {
      return createResponse("Logo nie istnieje!");
    }
  } else if(typeof data.logo === "object") {
    const logo = data.logo as any;
    if(
      logo.mimetype.indexOf("image") < 0 ||
      logo.size > (10 * 1024 * 1024) ||
      logo.size === 0
    ) {
      return createResponse("Przesłany obraz jest nieprawidłowy lub waży więcej niż 10 MB!");
    }
  } else {
    return createResponse("Logo nie może zostać zaaktualizowane!");
  }

  if(
    data.desc.length! <= 0 ||
    data.desc?.length! > 800 ||
    !regexDesc.test(data.desc as string)
  ) return createResponse("Opis jest nieprawidłowy!");

  if(data.btnMore === true) {
    if(
      data.btnTitle?.length! <= 0 ||
      data.btnTitle?.length! > 25 ||
      !regexBtnTitle.test(data.btnTitle as string)
    ) return createResponse("Nazwa przycisku jest nieprawidłowa!");

    if(
      data.btnLink?.length! <= 0 ||
      data.btnLink?.length! > 256 ||
      !regexBtnLink.test(data.btnLink as string)
    ) return createResponse("Adres przycisku jest nieprawidłowy!");
  } else if(data.btnMore !== false) {
    return createResponse("Ustawienia przycisku nie są prawidłowe!");
  }

  if(data.linkBoxes.length > 4) {
    return createResponse("Za dużo pojemników z odnośnikami!")
  }

  for(let i=0; i<data.linkBoxes.length!;i++) {
    const linkBox = data.linkBoxes[i];
    if(
      linkBox.name.length <= 0 ||
      linkBox.name.length > 30 ||
      !regexLinkBoxName.test(linkBox.name) ||
      linkBox.links.length <= 0 ||
      linkBox.links.length > 5
    ) return createResponse("Nazwa kontenera na odnośniki jest nieprawidłowa!");
    for(let j=0; j<linkBox.links.length; j++) {
      const link = linkBox.links[j];
      if(
        link.id !== j+1 ||
        link.name.length <= 0 ||
        link.name.length > 30 ||
        !regexLinkBoxName.test(link.name) ||
        link.url.length <= 0 ||
        link.url.length > 256 ||
        !regexBtnLink.test(link.url)
      ) return createResponse("Odnośnik jest nieprawidłowo uzupełniony!");
    }
  }
  return createResponse("Dane są prawidłowe", false);
}

async function footerRoute(req: NextApiRequest, res: NextApiResponse) {
  if(req.method === "POST") {
    const session = req.session.user;
    if(session?.isLoggedIn && session.permissions.footer) {
        const result = {error: false};
        const data = await handlePostFormReq(req, res);
        const dataCheck = await checkDataFooter(data);
        if(!dataCheck.error) {
          const result = await setFooterConfig(data);

          res.json(result);
        } else {
          res.json({error: true})
        }
    } else {
        res.json({error: true});
    }
  } else {
    res.json({error: true});
  }
}

export const config = {
    api: {
      bodyParser: false,
    },
};