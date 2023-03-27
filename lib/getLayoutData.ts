import Menu from "@/models/Menu";
import Info from "@/models/Info";
import Footer from "@/models/Footer";

export default async function getLayoutData() {
  const menu = JSON.parse(JSON.stringify(await Menu.find({}))).filter(
    (item: any) => item.on
  );
  const footer = JSON.parse(JSON.stringify(await Footer.findOne({})));
  delete footer._id;
  const info = JSON.parse(JSON.stringify(await Info.findOne({})));
  delete info._id;
  return { menu, footer, info };
}
