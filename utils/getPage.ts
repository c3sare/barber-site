import getMenu from "@/lib/getMenu";
import path from 'path';
import { promises as fs } from 'fs';
import MenuItem from "@/lib/types/MenuItem";

export default async function handler(slug: string) {
  const menu:MenuItem[] = await getMenu();

  const findItem = menu.find((item) => item.slug === slug);

  const pageDataDirectory = path.join(process.cwd(), 'pagecontent');

  const html = findItem ? await fs.readFile(pageDataDirectory + `/${slug}.html`, 'utf8') : "";
  const style = findItem ? await fs.readFile(pageDataDirectory + `/${slug}.css`, 'utf8') : "";

  const pageContent = html+"<style>"+style+"</style>";

  return findItem ? {title: findItem.title, html: pageContent} : {};
}
