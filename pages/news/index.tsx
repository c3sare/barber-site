import Link from "next/link";
import Layout from "@/components/Layout";
import Image from "next/image";
import styles from "@/styles/index.module.css";
import getLayoutData from "@/lib/getLayoutData";
import Articles from "@/models/News";
import dbConnect from "@/lib/dbConnect";
import Menu from "@/models/Menu";
import NewsData from "@/lib/types/NewsData";
import { getPlaiceholder } from "plaiceholder";

const News = ({ news, menu, footer, info }: any) => {
  const title = menu.find((item: any) => item.slug === "news")?.title;

  return (
    <Layout menu={menu} footer={footer} info={info} title={title}>
      <div className="container">
        <h1>{title}</h1>
        <div className={styles.newsBox}>
          <div className={styles.page}>
            {news.map((article: any, index: number) => (
              <div key={index} className={styles.infoBox}>
                <div>
                  <Image
                    {...article.img}
                    placeholder="blur"
                    alt={article.title}
                  />
                  <span>{article.date}</span>
                  <h2>{article.title}</h2>
                  <p>{article.desc}</p>
                </div>
                <Link href={`/news/${article.slug}`} className="btn">
                  Czytaj
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default News;

function sortByDateNews(a: any, b: any) {
  if (a.date > b.date) {
    return -1;
  } else if (a.date < b.date) {
    return 1;
  } else {
    return 0;
  }
}

export async function getStaticProps() {
  await dbConnect();
  const { menu, footer, info } = await getLayoutData();
  const node = await Menu.findOne({ slug: "news" });

  if (!node || !node?.on)
    return {
      notFound: true,
    };

  const news = (await JSON.parse(
    JSON.stringify(await Articles.find({}))
  )) as NewsData[];

  const newsWithImages = await Promise.all(
    news.map(async (item) => {
      const { base64, img } = await getPlaiceholder(
        "https://barberianextjs.s3.eu-central-1.amazonaws.com/" + item.img
      );
      item.img = {
        ...img,
        blurDataURL: base64,
      } as any;
      return item;
    })
  );

  return {
    props: {
      menu,
      footer,
      info,
      news: newsWithImages.sort(sortByDateNews),
    },
    revalidate: 60,
  };
}
