import dynamic from "next/dynamic";
const CustomPage = dynamic(import("@/components/CustomPage"));
import Layout from "@/components/Layout";
import dbConnect from "@/lib/dbConnect";
import getLayoutData from "@/lib/getLayoutData";
import Menu from "@/models/Menu";
import Cost from "@/models/Cost";

const Costs = ({ costsData, info, menu, footer }: any) => {
  const title = menu.find((item: any) => item.slug === "costs")?.title;
  return (
    <Layout menu={menu} footer={footer} info={info} title={title}>
      <div className="container">
        <h1>{title}</h1>
        <div className="costBox">
          {costsData.map((category: any, index: number) => (
            <ul key={index} className="costBox">
              <h2>{category.category}</h2>
              <li>
                <ul>
                  <li>Usługa</li>
                  <li>Koszt</li>
                  <li>Czas</li>
                </ul>
              </li>
              {category.services.map((service: any, indexx: number) => (
                <li key={indexx}>
                  <ul>
                    <li>{service.service}</li>
                    <li>{service.cost} zł</li>
                    <li>
                      {(Math.floor(service.time / 60) > 0
                        ? Math.floor(service.time / 60) + " h"
                        : "") +
                        " " +
                        (service.time % 60 > 0
                          ? (service.time % 60) + " Min."
                          : "")}
                    </li>
                  </ul>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default function Page(props: any) {
  if (props.custom) {
    return <CustomPage {...props} />;
  } else {
    return <Costs {...props} />;
  }
}

export async function getStaticProps() {
  await dbConnect();
  const { menu, footer, info } = await getLayoutData();
  const page = await Menu.findOne({ slug: "costs" });

  if (!page || !page?.on)
    return {
      notFound: true,
      revalidate: 60,
    };

  if (page.custom) {
    return {
      props: {
        info,
        footer,
        menu,
        custom: page.custom,
        content: page.content,
      },
      revalidate: 60,
    };
  } else {
    const costsData = JSON.parse(JSON.stringify(await Cost.find({})));

    return {
      props: {
        menu,
        footer,
        costsData,
        info,
        custom: page.custom,
      },
      revalidate: 60,
    };
  }
}
