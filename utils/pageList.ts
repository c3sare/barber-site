import getMenu from "@/lib/getMenu";
import MenuItem from "@/lib/types/MenuItem";

export default async function pageList() {
  const menu:MenuItem[] = await getMenu();

  const filteredChildren:MenuItem[] = menu.filter((item) => item && item.custom === true && item.on === true);

  return {
    nodes: filteredChildren.map(item => {
        return ({
          id: item._id,
          slug: item.slug
        })
    })
  };
}