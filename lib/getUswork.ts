import Uswork from "@/models/Uswork";

export default async function getUswork() {
  const uswork = JSON.parse(JSON.stringify(await Uswork.find({})));
  return uswork;
}
