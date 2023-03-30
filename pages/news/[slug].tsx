import cellPlugins from "@/ReactPagesComponents/cellPlugins";
import Layout from "@/components/Layout";
import dynamic from "next/dynamic";
const Editor = dynamic(import("@react-page/editor"));
import React from "react";
import newsList from "@/utils/newsList";
import getNewsPage from "@/utils/getNewsPage";
import getLayoutData from "@/lib/getLayoutData";
import dbConnect from "@/lib/dbConnect";

export async function getStaticPaths() {
  await dbConnect();
  const customPages = await newsList();

  return {
    paths: customPages.nodes.map((item: any) => {
      return {
        params: {
          slug: item.slug,
        },
      };
    }),
    fallback: "blocking",
  };
}

export async function getStaticProps(context: any) {
  const { menu, footer, info } = await getLayoutData();
  const page = await getNewsPage(context.params.slug);

  return {
    props: {
      menu,
      footer,
      info,
      page,
    },
    revalidate: 60,
  };
}

const CustomPage = ({ page, menu, footer, info }: any) => {
  return (
    <Layout title={page.title} info={info} footer={footer} menu={menu}>
      <div className="container">
        <h1>{page.title}</h1>
        <Editor cellPlugins={cellPlugins} value={page.content} readOnly />
      </div>
    </Layout>
  );
};

export default CustomPage;
