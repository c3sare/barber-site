import Menu from "@/models/Menu";

export default async function pageList() {
  const menu = await Menu.find({});

  const filteredChildren = menu.filter(
    (item) => item.custom === true && item.on === true
  );

  return {
    nodes: filteredChildren.map((item) => {
      return {
        id: item._id.toString(),
        slug: item.slug,
      };
    }),
  };
}
