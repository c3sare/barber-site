import { sessionOptions } from "@/lib/AuthSession/Config";
import dbConnect from "@/lib/dbConnect";
import Footer from "@/models/Footer";
import User from "@/models/User";
import { withIronSessionApiRoute } from "iron-session/next";
import { Types } from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";

interface FormDataFooter {
  btnMore: boolean;
  btnTitle?: string;
  btnLink?: string;
  desc: string;
  logo: any;
  linkBoxes: {
    name: string;
    links: {
      id: number;
      name: string;
      url: string;
    }[];
  }[];
}

export default withIronSessionApiRoute(footerRoute, sessionOptions);

function checkDataFooter(data: FormDataFooter) {
  const regexBtnTitle =
    /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u;
  const regexBtnLink = /(www|http:|https:|^\/)+[^\s]+[\w]/;
  const regexDesc = /^(.|\s)*[a-zA-Z]+(.|\s)*$/;
  const regexLinkBoxName =
    /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u;

  const { desc, btnMore, btnLink, btnTitle, linkBoxes } = data;

  if (!desc || !btnTitle || !btnMore || !btnLink || !linkBoxes) return false;

  if (btnMore === true) {
    if (!btnTitle || !btnLink) return false;

    if (
      btnTitle.length! <= 0 ||
      btnTitle.length! > 25 ||
      !regexBtnTitle.test(btnTitle)
    )
      return false;

    if (
      btnLink.length! <= 0 ||
      btnLink.length! > 256 ||
      !regexBtnLink.test(btnLink)
    )
      return false;
  }

  if (
    desc.length === 0 ||
    desc?.length! > 800 ||
    !regexDesc.test(desc) ||
    linkBoxes.length > 4
  )
    return false;

  for (let i = 0; i < linkBoxes.length!; i++) {
    const linkBox = linkBoxes[i];
    if (
      linkBox.name.length <= 0 ||
      linkBox.name.length > 30 ||
      !regexLinkBoxName.test(linkBox.name) ||
      linkBox.links.length <= 0 ||
      linkBox.links.length > 5
    )
      return false;
    for (let j = 0; j < linkBox.links.length; j++) {
      const link = linkBox.links[j];
      if (
        link.id !== j + 1 ||
        link.name.length <= 0 ||
        link.name.length > 30 ||
        !regexLinkBoxName.test(link.name) ||
        link.url.length <= 0 ||
        link.url.length > 256 ||
        !regexBtnLink.test(link.url)
      )
        return false;
    }
  }
  return true;
}

async function footerRoute(req: NextApiRequest, res: NextApiResponse) {
  const session = req.session.user;
  await dbConnect();
  let user = null;
  if (session?.id && session.isLoggedIn) {
    user = await User.findOne({ _id: new Types.ObjectId(session?.id) });
  }
  if (req.method === "POST") {
    if (!session?.isLoggedIn && !user?.permissions?.footer)
      return res
        .status(403)
        .json({ message: "Nie posiadasz uprawnień do tej ścieżki!" });

    const data = req.body;
    const dataCheck = checkDataFooter(data);
    if (!dataCheck)
      return res
        .status(400)
        .json({ message: "Parametry zapytania są nieprawidłowe!" });

    const findOne = await Footer.findOne({});
    const updateData = await Footer.updateOne(
      { _id: findOne!._id },
      { $set: { ...data } }
    );
    if (!updateData)
      return res
        .status(500)
        .json({ message: "Wystąpił problem przy aktualizacji danych!" });

    return res.status(200).json({ error: false });
  } else {
    return res.status(404);
  }
}
