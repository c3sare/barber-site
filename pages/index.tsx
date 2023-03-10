import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "@/styles/index.module.css";
import getData, { getDataOne } from "@/utils/getData";
import Layout from "@/components/Layout";
import getMenu from "@/lib/getMenu";
import Image from "next/image";
import DescMainData from "@/lib/types/DescMainData";
import OpenHoursData from "@/lib/types/OpenHoursData";
import SlideData from "@/lib/types/SlideData";
import NewsData from "@/lib/types/NewsData";
import InfoData from "@/lib/types/InfoData";
import MenuItem from "@/lib/types/MenuItem";
import FooterData from "@/lib/types/FooterData";

const sortOpenHours = (a:OpenHoursData, b:OpenHoursData) => {
  if(a.order < b.order) {
    return -1;
  } else if(a.order > b.order) {
    return 1;
  } else {
    return 0;
  }
} 

export default function Home(
  {
    descMain,
    openHours=[],
    slideData=[],
    news=[],
    info,
    menu=[],
    footer
  }: {
    descMain: DescMainData,
    openHours: OpenHoursData[],
    slideData: SlideData[],
    news: NewsData[],
    info: InfoData,
    menu: MenuItem[],
    footer: FooterData
  }) {
  const [actualSlide, setActualSlide] = useState<number>(0);

  useEffect(() => {
    let slideInterval: NodeJS.Timer;
    slideInterval = setInterval(() => {
      setActualSlide(state => {
        if (state < slideData.length - 1) {
          return state + 1;
        } else {
          return 0;
        }
      });
    }, 8000);

    return () => {
      clearInterval(slideInterval);
    };
  }, [actualSlide, slideData]);

  return (
    <Layout info={info} menu={menu} footer={footer} title="Strona Główna">
    <div className="container" style={{ width: "100%", padding: "0" }}>
      <div className={styles.slider}>
        <div className={styles.sliderView}>
          <div
            className={styles.slides}
            style={{
              transform: `translate3d(0px, ${actualSlide * -75}vh, 0px)`,
            }}
          >
            {slideData.map((sld, index:number) => (
              <div
                key={index}
                className={styles.slide}
                style={{
                  backgroundImage: `url('/images/${sld?.image}')`,
                }}
              >
                <h2>{sld?.title}</h2>
                <p>{sld?.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.sliderDots}>
          {slideData.map((_dot, index:number) => (
            <div
              key={index}
              className={`${styles.dot}${index === actualSlide ? " "+styles.active : ""}`}
              onClick={() => setActualSlide(index)}
            ></div>
          ))}
        </div>
      </div>
      <div className={styles.homeDescBox}>
        <div className={styles.homeDesc}>
          <h2 style={{ textAlign: "left" }}>{descMain.title}</h2>
          <p>{descMain.description}</p>
        </div>
        <div className={styles.homePros}>
          <ul>
            {descMain?.pros?.map((item, index:number) => (
              <li key={index}>
                <Image alt={`Ikona ${index + 1}`} src={`/images/${item?.img}`} width={30} height={30}/>
                {item?.desc}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className={styles.newsBox}>
        <h2>Aktualności</h2>
        {news.map((article, index:number) => (
          <div key={index} className={styles.infoBox}>
            <Image alt={article.title} src={`/images/articles/${article.img}`} width={384} height={229} loading="lazy"/>
            <h4>{article.title}</h4>
            <p>{article.desc}</p>
            <Link href={`/news/${article.id}`} className="btn">
              Czytaj
            </Link>
          </div>
        ))}
      </div>
      <div
        className={styles.openingHoursBox}
        style={{ backgroundImage: `url(/images/bgHour.jpg)` }}
      >
        <h2>Godziny otwarcia</h2>
        {openHours.sort(sortOpenHours).map((day, index:number) => (
          <div key={index} className={styles.openHour}>
            <h3 style={{ letterSpacing: "4px" }}>{day.long.slice(0, 3).toLocaleUpperCase()}</h3>
            <p>{day.closed ? "Zamknięte" : `${day.start} - ${day.end}`}</p>
          </div>
        ))}
        <div className={styles.btnBoxHour}>
          <Link className={styles.reservBtn} href="/reservations">
            {" "}
            Rezerwuj Teraz!
          </Link>
        </div>
      </div>
    </div>
    </Layout>
  );
}

export async function getStaticProps() {
  const descMain = await getDataOne("descMain");
  const openHours = await getData("openHours");
  const slideData = await getData("slides");
  const news = await getData("news");
  const info = await getDataOne("info");
  const footer = await getDataOne("footer");
  const menu = await getMenu();

  return {
    props: {
      descMain,
      openHours,
      slideData,
      news,
      info,
      footer,
      menu
    }
  }
}