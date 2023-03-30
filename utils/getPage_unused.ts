import path from "path";
import { promises as fs } from "fs";
import Menu from "@/models/Menu";

export default async function handler(slug: string) {
  const findItem = JSON.parse(JSON.stringify(await Menu.findOne({ slug })));

  if (!findItem)
    return {
      title: "",
      content: "",
    };

  const pageDataDirectory = path.join(process.cwd(), "pagecontent");

  const content = findItem
    ? await fs.readFile(pageDataDirectory + `/${findItem._id}.json`, "utf8")
    : "";

  return findItem
    ? {
        title: findItem.title,
        content: content === "" ? "" : JSON.parse(content),
      }
    : {};
}
