import Link from "next/link";
import Layout from "@/components/Layout";
import getMenu from "@/lib/getMenu";
import getData, { getDataOne } from "@/utils/getData";
import Image from "next/image";
import styles from "@/styles/index.module.css";

const News = ({news, menu, footer, info}: any) => {

  return (
    <Layout menu={menu} footer={footer} info={info} title="Aktualności">
    <div className="container">
      <h1>Aktualności</h1>
      <div className={styles.newsBox}>
        <div className={styles.page}>
          {news.map((article:any, index:number) => (
            <div key={index} className={styles.infoBox}>
              <Image
                alt={article.title}
                src={`/images/articles/${article.img}`}
                width={384}
                height={229}
                loading="lazy"
              />
              <span>{article.date}</span>
              <h4>{article.title}</h4>
              <p>{article.desc}</p>
              <Link href={`/news/${article.id}`} className="btn">
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

export async function getStaticProps() {
    const menu = await getMenu();
    const footer = await getDataOne("footer");
    const info = await getDataOne("info");
    const news = await getData("news");

    return {
      props: {
        menu,
        footer,
        info,
        news
      }
    }
}