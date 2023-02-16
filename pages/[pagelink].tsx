import Layout from "@/components/Layout";
import getMenu from "@/lib/getMenu";
import { getDataOne } from "@/utils/getData";
import getPage from "@/utils/getPage";
import pageList from "@/utils/pageList";
import React from "react";

export async function getStaticPaths() {
  const customPages = await pageList();

  return {
    paths: customPages.nodes.map((item:any) => {
      return {
        params: {
          pagelink: item.slug
        }
      }
    }),
    fallback: false,
  }
}

export async function getStaticProps(context:any) {
  const menu = await getMenu();
  const footer = await getDataOne("footer");
  const info = await getDataOne("info");
  const page = await getPage(context.params.pagelink);

  return {
    props: {
      menu,
      footer,
      info,
      page,
    }
  }
}

const CustomPage = ({ page ,menu, footer, info }: any) => {

  return (
    <Layout title={page.title} info={info} footer={footer} menu={menu}>
        <div
        className="container"
        dangerouslySetInnerHTML={{__html: page.html}}
        />
    </Layout>
  );
};

export default CustomPage;