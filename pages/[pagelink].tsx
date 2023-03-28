import { cellPlugins } from "@/ReactPagesComponents/cellPlugins";
import Layout from "@/components/Layout";
import dbConnect from "@/lib/dbConnect";
import getLayoutData from "@/lib/getLayoutData";
import getPage from "@/utils/getPage";
import pageList from "@/utils/pageList";
import dynamic from "next/dynamic";
const Editor = dynamic(import("@react-page/editor"));
import React from "react";

export async function getStaticPaths() {
  await dbConnect();
  const customPages = await pageList();

  return {
    paths: customPages.nodes.map((item: any) => {
      return {
        params: {
          pagelink: item.slug,
        },
      };
    }),
    fallback: false,
  };
}

export async function getStaticProps(context: any) {
  await dbConnect();
  const { menu, footer, info } = await getLayoutData();
  const page = await getPage(context.params.pagelink);

  return {
    props: {
      menu,
      footer,
      info,
      page,
    },
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
