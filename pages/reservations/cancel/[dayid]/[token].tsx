import Layout from "@/components/Layout";
import getMenu from "@/lib/getMenu";
import { getDataOne } from "@/utils/getData";
import { MongoClient, ObjectId } from "mongodb";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const PageNotFound = ({ menu, footer, info, result }: any) => {
  const router = useRouter();
  const [timer, setTimer] = useState(5);

  useEffect(() => {
    const x = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          router.push("/");
          clearInterval(x);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(x);
  }, []);

  return (
    <Layout
      menu={menu}
      footer={footer}
      info={info}
      title="Anulowanie rezerwacji"
    >
      <div className="errorPage">
        <h1>Anulowanie rezerwacji</h1>
        <p>
          {result.msg}
          <br />
          za {timer} sekund zostaniesz przeniesiony na{" "}
          <Link href="/">
            <b>Stronę Główną</b>
          </Link>
        </p>
      </div>
    </Layout>
  );
};

export default PageNotFound;

export async function getServerSideProps({ req, query }: any) {
  const menu = await getMenu();
  const footer = await getDataOne("footers");
  const info = await getDataOne("infos");
  const { dayid, token } = query;

  const client = new MongoClient(process.env.MONGO_URI as string);
  const database = client.db("site");
  const reservations = database.collection("reservations");
  const day = await reservations.findOne({ _id: new ObjectId(dayid) });

  if (
    day !== null &&
    day.times.filter((item: any) => item.reserved && item.token === token)
      .length === 1
  ) {
    day.times.forEach((item: any) => {
      if (item.token === token && item.reserved) {
        item.reserved = false;
        item.token = "";
        item.person = "";
        item.reservedDate = "";
        item.phone = "";
        item.mail = "";
      }
    });

    const updateDay = await reservations.updateOne(
      { _id: new ObjectId(dayid) },
      { $set: { times: day.times } }
    );

    if (updateDay.acknowledged !== undefined) {
      return {
        props: {
          menu,
          footer,
          info,
          result: {
            error: false,
            msg: "Rezerwacja została anulowana!",
          },
        },
      };
    } else {
      return {
        props: {
          menu,
          footer,
          info,
          result: {
            error: false,
            msg: "Nie można anulować tej rezerwacji!",
          },
        },
      };
    }
  } else {
    return {
      props: {
        menu,
        footer,
        info,
        result: {
          error: true,
          msg: "Nie odnaleziono rezerwacji do anulowania!",
        },
      },
    };
  }
}
