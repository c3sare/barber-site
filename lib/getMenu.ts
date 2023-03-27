import Menu from "@/models/Menus";

export default async function getMenu() {
  const menu = await Menu.find({});
  return menu.filter((item: any) => item.on);
}
