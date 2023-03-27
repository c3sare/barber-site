import Layout from "@/components/Layout";
import getMenu from "@/lib/getMenu";
import getData, { getDataOne } from "@/utils/getData";
import Head from "next/head";

const Costs = ({ costsData, info, menu, footer }: any) => {
  return (
    <Layout menu={menu} footer={footer} info={info} title="Kontakt">
      <Head>
        <title>
          {info.companyName + (info.slogan !== "" ? " | " + info.slogan : "")}
        </title>
      </Head>
      <div className="container">
        <h1>Cennik</h1>
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

export default Costs;

export async function getStaticProps() {
  const menu = await getMenu();
  const footer = await getDataOne("footers");
  const costs = await getData("costs");
  const info = await getDataOne("infos");

  return {
    props: {
      menu,
      footer,
      costsData: costs,
      info,
    },
  };
}
