import MenuItem from "@/lib/types/MenuItem";
import Menu from "@/models/Menu";

export default async function pageList() {
  const filteredChildren: MenuItem[] = JSON.parse(
    JSON.stringify(await Menu.find({ default: false, custom: true, on: true }))
  );

  return {
    nodes: filteredChildren.map((item) => {
      return {
        slug: item.slug,
      };
    }),
  };
}
