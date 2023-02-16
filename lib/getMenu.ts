import getData from "../utils/getData";

export default async function getMenu() {
  const menu = await getData("menu");
  return menu.filter((item:any) => item.on);
}
