import getMenu from "@/lib/getMenu";
import path from 'path';
import { promises as fs } from 'fs';
import MenuItem from "@/lib/types/MenuItem";

export default async function handler(slug: string) {
  const menu:MenuItem[] = await getMenu();

  const findItem = menu.find((item) => item.slug === slug);

  const pageDataDirectory = path.join(process.cwd(), 'pagecontent');

  const content = findItem ? await fs.readFile(pageDataDirectory + `/${findItem._id}.json`, 'utf8') : "";

  return findItem ? {
    title: findItem.title,
    content: JSON.parse(content)
  } : {};
}
