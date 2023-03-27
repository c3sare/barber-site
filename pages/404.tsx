import Layout from "@/components/Layout";
import dbConnect from "@/lib/dbConnect";
import getLayoutData from "@/lib/getLayoutData";
import Image from "next/image";
import Link from "next/link";

const PageNotFound = ({ menu, footer, info }: any) => {
  return (
    <Layout menu={menu} footer={footer} info={info} title="404">
      <div className="errorPage">
        <Image
          style={{ width: "100%", height: "auto" }}
          src="/images/mood.png"
          alt="Error 404"
          width={512}
          height={512}
        />
        <h1>404</h1>
        <h3>Strony nie znaleziono!</h3>
        <p>
          Strona której szukasz nie istnieje lub wystąpił inny problem.
          <br />
          <b onClick={() => window.history.back()}>
            Wróć do poprzedniej strony
          </b>{" "}
          lub odwiedź naszą{" "}
          <Link href="/">
            <b>Stronę Główną</b>
          </Link>{" "}
          aby wybrać inną ścieżkę.
        </p>
      </div>
    </Layout>
  );
};

export default PageNotFound;

export async function getStaticProps() {
  await dbConnect();
  const { menu, footer, info } = await getLayoutData();
  return {
    props: {
      menu,
      footer,
      info,
    },
  };
}
