import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "@/styles/index.module.css";
import Layout from "@/components/Layout";
import Image from "next/image";
import DescMainData from "@/lib/types/DescMainData";
import OpenHoursData from "@/lib/types/OpenHoursData";
import SlideData from "@/lib/types/SlideData";
import NewsData from "@/lib/types/NewsData";
import InfoData from "@/lib/types/InfoData";
import MenuItem from "@/lib/types/MenuItem";
import FooterData from "@/lib/types/FooterData";
import getLayoutData from "@/lib/getLayoutData";
import getMainPageData from "@/lib/getMainPageData";
import News from "@/models/News";
import dbConnect from "@/lib/dbConnect";
import Menu from "@/models/Menu";
import dynamic from "next/dynamic";
import { getPlaiceholder } from "plaiceholder";
const CustomPage = dynamic(import("@/components/CustomPage"));

const sortOpenHours = (a: OpenHoursData, b: OpenHoursData) => {
  if (a.order < b.order) {
    return -1;
  } else if (a.order > b.order) {
    return 1;
  } else {
    return 0;
  }
};

function Home({
  descMain,
  openHours,
  slideData,
  news,
  info,
  menu,
  footer,
  openHoursImg,
}: {
  descMain: DescMainData;
  openHours: OpenHoursData[];
  slideData: SlideData[];
  news: NewsData[];
  info: InfoData;
  menu: MenuItem[];
  footer: FooterData;
  openHoursImg: {
    img: {
      src: string;
      blurDataURL: string;
    };
    base64: string;
  };
}) {
  const [actualSlide, setActualSlide] = useState<number>(0);

  useEffect(() => {
    let slideInterval: NodeJS.Timer;
    slideInterval = setInterval(() => {
      setActualSlide((state) => {
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

  const title = menu.find((item) => item.slug === "")!.title;

  return (
    <Layout info={info} menu={menu} footer={footer} title={title}>
      <div className="container" style={{ width: "100%", padding: "0" }}>
        <div className={styles.slider}>
          <div className={styles.sliderView}>
            <div
              className={styles.slides}
              style={{
                transform: `translate3d(0px, ${actualSlide * -75}vh, 0px)`,
              }}
            >
              {slideData.map((sld, index: number) => (
                <div
                  key={index}
                  className={styles.slide}
                  style={{
                    position: "relative",
                  }}
                >
                  <Image
                    src={(sld.image as any).src}
                    blurDataURL={(sld.image as any).blurDataURL}
                    alt={sld.title}
                    placeholder="blur"
                    fill
                    style={{
                      width: "100%",
                      objectFit: "cover",
                      objectPosition: "center",
                      zIndex: "-1",
                    }}
                  />
                  <h2>{sld?.title}</h2>
                  <p>{sld?.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.sliderDots}>
            {slideData.map((_dot, index: number) => (
              <div
                key={index}
                className={`${styles.dot}${
                  index === actualSlide ? " " + styles.active : ""
                }`}
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
              {descMain?.pros?.map((item, index: number) => (
                <li key={index}>
                  <Image
                    alt={`Ikona ${index + 1}`}
                    src={`https://barberianextjs.s3.eu-central-1.amazonaws.com/${item?.img}`}
                    width={30}
                    priority
                    height={30}
                  />
                  {item?.desc}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className={styles.newsBox}>
          <h2>Aktualności</h2>
          {news.map((article, index: number) => (
            <div key={index} className={styles.infoBox}>
              <div>
                <Image
                  {...(article.img as any)}
                  placeholder="blur"
                  alt={article.title}
                />
                <span
                  style={{
                    width: "100%",
                    display: "block",
                    textAlign: "right",
                  }}
                >
                  {article.date}
                </span>
                <h3>{article.title}</h3>
                <p>{article.desc}</p>
              </div>
              <Link href={`/news/${article.slug}`} className="btn">
                Czytaj
              </Link>
            </div>
          ))}
        </div>
        <div className={styles.openingHoursBox}>
          <Image
            alt="Godziny otwarcia"
            src={openHoursImg.img.src}
            blurDataURL={openHoursImg.base64}
            placeholder="blur"
            fill
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              zIndex: "-1",
            }}
          />
          <h2>Godziny otwarcia</h2>
          {openHours.sort(sortOpenHours).map((day, index: number) => (
            <div key={index} className={styles.openHour}>
              <h3 style={{ letterSpacing: "4px" }}>
                {day.long.slice(0, 3).toLocaleUpperCase()}
              </h3>
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

export default function Page(props: any) {
  if (props.custom) {
    return <CustomPage {...props} />;
  } else {
    return <Home {...props} />;
  }
}

export async function getStaticProps() {
  await dbConnect();
  const { info, footer, menu } = await getLayoutData();
  const mainPage = await Menu.findOne({ slug: "" });

  if (mainPage.custom) {
    return {
      props: {
        info,
        footer,
        menu,
        custom: mainPage.custom,
        content: mainPage.content,
      },
      revalidate: 60,
    };
  } else {
    const { descMain, openHours, slideData } = await getMainPageData();
    const news = JSON.parse(
      JSON.stringify(await News.find({}).sort({ date: -1 }).limit(3))
    ) as NewsData[];

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

    const slides = await Promise.all(
      slideData.map(async (item: any) => {
        const { base64, img } = await getPlaiceholder(
          "https://barberianextjs.s3.eu-central-1.amazonaws.com/" + item.image
        );
        item.image = {
          ...img,
          blurDataURL: base64,
        } as any;

        return item;
      })
    );

    const openHoursImg = await getPlaiceholder("/images/bgHour.jpg");

    return {
      props: {
        descMain,
        openHours,
        slideData: slides,
        news: newsWithImages,
        info,
        footer,
        menu,
        custom: mainPage.custom,
        openHoursImg,
      },
      revalidate: 60,
    };
  }
}
