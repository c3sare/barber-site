import Link from "next/link";
import Layout from "@/components/Layout";
import getMenu from "@/lib/getMenu";
import getData, { getDataOne } from "@/utils/getData";
import Image from "next/image";
import styles from "@/styles/index.module.css";

const News = ({ news, menu, footer, info }: any) => {
  return (
    <Layout menu={menu} footer={footer} info={info} title="Aktualności">
      <div className="container">
        <h1>Aktualności</h1>
        <div className={styles.newsBox}>
          <div className={styles.page}>
            {news.map((article: any, index: number) => (
              <div key={index} className={styles.infoBox}>
                <div>
                  <div
                    style={{
                      width: "100%",
                      height: "230px",
                      position: "relative",
                    }}
                  >
                    <Image
                      alt={article.title}
                      src={`/images/articles/${article.img}`}
                      fill
                      loading="lazy"
                      style={{ objectFit: "cover" }}
                      sizes="(max-width: 1200px) 355px,
                      (max-width: 1024px) 275px,
                      (max-width: 76px) 200px,
                      355px"
                    />
                  </div>
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
  const menu = await getMenu();
  const footer = await getDataOne("footers");
  const info = await getDataOne("infos");
  const news = await getData("news");

  return {
    props: {
      menu,
      footer,
      info,
      news: news.sort(sortByDateNews),
    },
  };
}
