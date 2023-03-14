import path from 'path';
import { promises as fs } from 'fs';
import NewsData from "@/lib/types/NewsData";
import getData from "@/utils/getData";

export default async function handler(slug: string) {
  const news:NewsData[] = await getData("news");

  const findItem = news.find((item) => item.slug === slug);

  const newsDataDirectory = path.join(process.cwd(), 'news');

  const content = findItem ? await fs.readFile(newsDataDirectory + `/${findItem._id}.json`, 'utf8') : "";

  return findItem ? {
    title: findItem.title,
    content: content === "" ? "" : JSON.parse(content)
  } : {};
}
