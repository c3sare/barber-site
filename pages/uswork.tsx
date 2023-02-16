import Layout from "@/components/Layout";
import getMenu from "@/lib/getMenu";
import getData, { getDataOne } from "@/utils/getData";
import getPage from "@/utils/getPage";
import Image from "next/image";
import { useState } from "react";
import MenuItem from "@/lib/types/MenuItem";
import FooterData from "@/lib/types/FooterData";
import InfoData from "@/lib/types/InfoData";
import WorkData from "@/lib/types/WorkData";
import CustomPageData from "@/lib/types/CustomPageData";

const Uswork = ({
  workData,
  menu,
  footer,
  info,
  isCustom
} : {
  workData: (WorkData[] | CustomPageData),
  menu: MenuItem[],
  footer: FooterData,
  info: InfoData,
  isCustom: boolean
}) => {
  const [showImage, setShowImage] = useState(false);
  const [imageUrl, setImageUrl] = useState("");


  const showImageBox = (url:string) => {
    setImageUrl(url);
    setShowImage(true);
  };

  return (
    <>
    <Layout title="Nasze Prace" menu={menu} footer={footer} info={info}>
      {isCustom ?
        <div className="container" dangerouslySetInnerHTML={{__html: (workData as CustomPageData).html}}/>
        :
        <div className="container">
          <h1>Nasze Prace</h1>
          <div className="photoBox">
            {(workData as WorkData[]).map((item, index:number) => (
              <Image
                key={index}
                alt={`Fryzura ${index + 1}`}
                src={`/images/uswork/${item.image}`}
                width={300}
                height={300}
                onClick={() => showImageBox(item.image)}
              />
            ))}
          </div>
        </div>
      }
    </Layout>
    {showImage && !isCustom && (
        <div className="fullImageScreen">
          <Image alt="Fryzura" src={`/images/uswork/${imageUrl}`} width={1000} height={1000}/>
          <div
            className="closeBtn"
            onClick={() => {
              setShowImage(false);
            }}
          >
            <div className="closeBtn_1"></div>
            <div className="closeBtn_2"></div>
          </div>
        </div>
    )}
    </>
  );
};

export default Uswork;

export async function getStaticProps() {
    const menu:MenuItem[] = await getMenu();
    const footer:FooterData = await getDataOne("footer");
    const info:InfoData = await getDataOne("info");

    if(menu.find(item => item.slug === "uswork") === undefined) {
      return {
        redirect: {
          destination: '/404',
          permanent: false,
        },
      }
    }

    const isCustom = Boolean(menu.find(item => (item.slug === "uswork" && item.custom)));

    const workData = isCustom ? await getPage("uswork") : await getData("uswork");

    return {
      props: {
        menu,
        footer,
        info,
        workData,
        isCustom
      }
    }
}