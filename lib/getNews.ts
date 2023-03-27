import News from "@/models/News";

export default async function getNews() {
  const news = JSON.parse(JSON.stringify(await News.find({})));
  return news;
}
