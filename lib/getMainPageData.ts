import Descmain from "@/models/DescMain";
import Openhours from "@/models/OpenHour";
import Slide from "@/models/Slide";

export default async function getMainPageData() {
  const slideData = JSON.parse(JSON.stringify(await Slide.find({})));
  const openHours = JSON.parse(JSON.stringify(await Openhours.find({})));
  const descMain = JSON.parse(JSON.stringify(await Descmain.findOne({})));
  delete descMain._id;
  return { slideData, openHours, descMain };
}
