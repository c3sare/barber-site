import Layout from "@/components/Layout";
import Image from "next/image";
import { useState } from "react";
import MenuItem from "@/lib/types/MenuItem";
import WorkData from "@/lib/types/WorkData";
import dynamic from "next/dynamic";
import getLayoutData from "@/lib/getLayoutData";
import Usworks from "@/models/Uswork";
import dbConnect from "@/lib/dbConnect";
import { getPlaiceholder } from "plaiceholder";
const CustomPage = dynamic(import("@/components/CustomPage"));

const Uswork = ({ workData, menu, footer, info }: any) => {
  const [showImage, setShowImage] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const showImageBox = (url: string) => {
    setImageUrl(url);
    setShowImage(true);
  };

  const title = menu.find((item: any) => item.slug === "uswork").title;
  return (
    <>
      <Layout title={title} menu={menu} footer={footer} info={info}>
        <div className="container">
          <h1>{title}</h1>
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
                onClick={() => showImageBox((item.image as any).src)}
              >
                <Image
                  {...(item.image as any)}
                  alt={`Fryzura ${index + 1}`}
                  sizes="(max-width: 1200px) 350px,
                    350px"
                  style={{ objectFit: "cover", objectPosition: "center" }}
                />
              </div>
            ))}
          </div>
        </div>
      </Layout>
      {showImage && (
        <div className="fullImageScreen">
          <Image alt="Fryzura" src={imageUrl} width={1000} height={1000} />
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
    return <CustomPage {...props} />;
  } else {
    return <Uswork {...props} />;
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
    return {
      props: {
        menu,
        footer,
        info,
        custom: pageData.custom,
        content: pageData.content,
      },
      revalidate: 60,
    };
  } else {
    const workImages = JSON.parse(JSON.stringify(await Usworks.find({})));

    const workData = await Promise.all(
      workImages.map(async (item: any) => {
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
