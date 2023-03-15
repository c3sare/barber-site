import Layout from "@/components/Layout";
import getMenu from "@/lib/getMenu";
import getData, { getDataOne } from "@/utils/getData";
import getPage from "@/utils/getPage";
import Image from "next/image";
import { useState } from "react";
import MenuItem, { MenuItemDB } from "@/lib/types/MenuItem";
import FooterData from "@/lib/types/FooterData";
import InfoData from "@/lib/types/InfoData";
import WorkData from "@/lib/types/WorkData";
import CustomPageData from "@/lib/types/CustomPageData";
import dynamic from "next/dynamic";
import { cellPlugins } from "@/ReactPagesComponents/cellPlugins";
import { Value } from "@react-page/editor";
const Editor = dynamic(import("@react-page/editor"));

const Uswork = ({
  workData,
  menu,
  footer,
  info,
  pageData
} : {
  workData: (WorkData[] | CustomPageData),
  menu: MenuItem[],
  footer: FooterData,
  info: InfoData,
  pageData: MenuItemDB
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
      <div className="container">
        <h1>{pageData.title}</h1>
        {
          pageData.custom ?
            <Editor cellPlugins={cellPlugins} value={(workData as any).content} readOnly/>
          :
            <div className="photoBox">
              {(workData as WorkData[]).map((item, index:number) => (
                <div
                  key={index}
                  style={{position: "relative", margin: "16px", width: "350px", maxWidth: "100%", height: "350px", cursor: "pointer"}}
                  onClick={() => showImageBox(item.image)}
                >
                  <Image
                    alt={`Fryzura ${index + 1}`}
                    src={`/images/uswork/${item.image}`}
                    priority
                    fill
                    sizes="(max-width: 1200px) 350px,
                    350px"
                    style={{objectFit: "cover", objectPosition: "center"}}
                  />
                </div>
              ))}
            </div>
        }
      </div>
    </Layout>
    {showImage && !pageData.custom && (
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

    const pageData = menu.find(item => (item.slug === "uswork"));

    const workData = pageData!.custom ? await getPage("uswork") : await getData("uswork");

    return {
      props: {
        menu,
        footer,
        info,
        workData,
        pageData 
      }
    }
}