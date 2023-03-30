import Layout from "@/components/Layout";
import getPage from "@/utils/getPage";
import Image from "next/image";
import { useState } from "react";
import MenuItem from "@/lib/types/MenuItem";
import WorkData from "@/lib/types/WorkData";
import dynamic from "next/dynamic";
import getLayoutData from "@/lib/getLayoutData";
import Usworks from "@/models/Uswork";
import dbConnect from "@/lib/dbConnect";
const CustomPage = dynamic(import("@/components/CustomPage"));

const Uswork = ({ workData, menu, footer, info, pageData }: any) => {
  const [showImage, setShowImage] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const showImageBox = (url: string) => {
    setImageUrl(url);
    setShowImage(true);
  };

  return (
    <>
      <Layout title="Nasze Prace" menu={menu} footer={footer} info={info}>
        <div className="container">
          <h1>{pageData.title}</h1>
          <div className="photoBox">
            {(workData as WorkData[]).map((item, index: number) => (
              <div
                key={index}
                style={{
                  position: "relative",
                  margin: "16px",
                  width: "350px",
                  maxWidth: "100%",
                  height: "350px",
                  cursor: "pointer",
                }}
                onClick={() => showImageBox(item.image)}
              >
                <Image
                  alt={`Fryzura ${index + 1}`}
                  src={`/images/uswork/${item.image}`}
                  priority
                  fill
                  sizes="(max-width: 1200px) 350px,
                    350px"
                  style={{ objectFit: "cover", objectPosition: "center" }}
                />
              </div>
            ))}
          </div>
        </div>
      </Layout>
      {showImage && !pageData.custom && (
        <div className="fullImageScreen">
          <Image
            alt="Fryzura"
            src={`/images/uswork/${imageUrl}`}
            width={1000}
            height={1000}
          />
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

export default function Page(props: any) {
  if (props.custom) {
    <CustomPage {...props} />;
  } else {
    <Uswork {...props} />;
  }
}

export async function getStaticProps() {
  await dbConnect();
  const { menu, footer, info } = await getLayoutData();

  const pageData = menu.find((item: MenuItem) => item.slug === "uswork");

  if (!pageData || !pageData?.on) {
    return {
      notFound: true,
      revalidate: 60,
    };
  }
  if (pageData.custom) {
    const content = (await getPage("uswork")).content;
    return {
      props: {
        menu,
        footer,
        info,
        custom: pageData.custom,
        content,
      },
      revalidate: 60,
    };
  } else {
    const workData = JSON.parse(JSON.stringify(await Usworks.find({})));
    return {
      props: {
        menu,
        footer,
        info,
        workData,
        custom: pageData.custom,
      },
      revalidate: 60,
    };
  }
}
