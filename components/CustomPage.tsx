import cellPlugins from "@/ReactPagesComponents/cellPlugins";
import Editor from "@react-page/editor";
import Layout from "./Layout";

const CustomPage = ({ info, menu, footer, content }: any) => {
  const title = menu.find((item: any) => item.slug === "costs")?.title;
  return (
    <Layout menu={menu} footer={footer} info={info} title={title}>
      <div className="container">
        <h1>{title}</h1>
        <Editor cellPlugins={cellPlugins} value={content} readOnly />
      </div>
    </Layout>
  );
};

export default CustomPage;
