import Layout from "@/components/Layout";
import { ObjectId } from "mongodb";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import nodemailer from "nodemailer";
import getLayoutData from "@/lib/getLayoutData";
import Reservation from "@/models/Reservation";
import MailConfig from "@/models/MailConfigs";

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
      title="Potwierdzenie rezerwacji"
    >
      <div style={{ textAlign: "center" }}>
        <h1>Potwierdzenie rezerwacji</h1>
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
  const { menu, footer, info } = await getLayoutData();
  const { dayid, token } = query;

  const _id = new ObjectId(dayid);
  const day = await Reservation.findOne({ _id });

  if (
    day !== null &&
    day.times.filter((item: any) => !item.reserved && item.token === token)
      .length === 1
  ) {
    const newTimes = [...day.times].map((item: any) => {
      if (item.token === token) {
        item.reserved = true;
        item.reservedDate = "";
      }
      return item;
    });

    const updateDay = await Reservation.updateOne(
      { _id },
      { $set: { times: newTimes } }
    );

    if (updateDay.acknowledged !== undefined) {
      const config = await MailConfig.findOne({});
      if (config !== null) {
        const transporter = nodemailer.createTransport({
          host: config.host,
          port: config.port,
          secure: false,
          auth: {
            user: config.mail,
            pass: config.pwd,
          },
        });

        const { person, mail, time }: any = day.times.find(
          (item: any) => item.token === token
        );

        let mailOptions: any = {
          from: config.mail,
          to: mail,
          subject: "Twoja rezerwacja została potwierdzona",
          text: `Witaj ${person},\nData: ${
            day.date
          }\nCzas:${time}\n\nTwoja rezerwacja została potwierdzona, skontaktuj się z nami\nlub kliknij poniższy adres strony jeśli chcesz z niej zrezygnować.\n \n${
            req.headers.referer?.slice(0, req.headers.referer.indexOf("://")) +
            "://" +
            req.headers.host
          }/reservations/cancel/${day._id}/${token}`,
        };

        transporter.sendMail(mailOptions, function (err: any, data: any) {
          if (err) {
            console.log("Error " + err);
          } else {
            console.log("Email to confirm reservation is sent.");
          }
        });
      }

      return {
        props: {
          menu,
          footer,
          info,
          result: {
            error: false,
            msg: "Rezerwacja została potwierdzona!",
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
            error: true,
            msg: "Nie było możliwe potwierdzenie rezerwacji!",
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
          msg: "Nie odnaleziono rezerwacji do potwierdzenia!",
        },
      },
    };
  }
}
