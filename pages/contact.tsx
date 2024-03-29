import Layout from "@/components/Layout";
import dbConnect from "@/lib/dbConnect";
import getLayoutData from "@/lib/getLayoutData";
import { useRef, useState } from "react";
import Contacts from "@/models/Contact";
import dynamic from "next/dynamic";
import Menu from "@/models/Menu";
const CustomPage = dynamic(import("@/components/CustomPage"));

const Contact = ({ info, contactData, menu, footer }: any) => {
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState("");
  const [mail, setMail] = useState("");
  const [phone, setPhone] = useState("");
  const [text, setText] = useState("");

  const refName = useRef<any>(null);
  const refPhone = useRef<any>(null);
  const refMail = useRef<any>(null);
  const refText = useRef<any>(null);

  const handleSendMail = (e: any) => {
    e.preventDefault();

    const pattern = /^[a-zA-Z]+$/;
    let error = false;
    if (!name.length || !pattern.test(name)) {
      refName.current!.textContent = "Nieprawidłowe imię!";
      error = true;
    }
    const patternText = /^(.|\s)*[a-zA-Z]+(.|\s)*$/;
    if (!text.length || !patternText.test(text)) {
      refText.current.textContent = "Nieprawidłowo wypełniona treść!";
      error = true;
    }

    const patternMail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
    if (!mail.length || !patternMail.test(mail)) {
      refMail.current.textContent = "Nieprawidłowy adres e-mail!";
      error = true;
    }

    const patternPhone =
      /(?<!\w)(\(?(\+|00)?48\)?)?[ -]?\d{3}[ -]?\d{3}[ -]?\d{3}(?!\w)/;
    if (!phone.length || !patternPhone.test(phone)) {
      refPhone.current.textContent = "Nieprawidłowy numer telefonu!";
      error = true;
    }
    if (error) {
      return;
    }
    setSending(true);
    fetch("http://localhost:3000/api/sendmail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        phone,
        mail,
        text,
      }),
    })
      .then((data) => data.json())
      .then((data) => {
        setSending(false);
        if (!data.error) setSuccess(true);
      })
      .catch((err) => {
        setSending(false);
        console.log(err);
      });
  };

  const title = menu.find((item: any) => item.slug === "contact")?.title;

  return (
    <Layout menu={menu} footer={footer} info={info} title={title}>
      <div className="container">
        <h1>{title}</h1>
        <div className="contactPage">
          <div className="contactBg"></div>
          <div className="contactContent">
            {!success ? (
              <form onSubmit={handleSendMail}>
                <label>
                  <span>Imię:</span>{" "}
                  <input
                    value={name}
                    onChange={(e) => {
                      refName.current.textContent = "";
                      setName(e.target.value);
                    }}
                    type="text"
                  />
                </label>
                <span ref={refName} className="formError"></span>
                <label>
                  <span>E-Mail:</span>{" "}
                  <input
                    value={mail}
                    onChange={(e) => {
                      refMail.current.textContent = "";
                      setMail(e.target.value);
                    }}
                    type="mail"
                  />
                </label>
                <span ref={refMail} className="formError"></span>
                <label>
                  <span>Numer Telefonu:</span>{" "}
                  <input
                    value={phone}
                    onChange={(e) => {
                      refPhone.current.textContent = "";
                      setPhone(e.target.value);
                    }}
                    type="phone"
                  />
                </label>
                <span ref={refPhone} className="formError"></span>
                <label style={{ textAlign: "center" }}>
                  Treść wiadomości:
                  <br />{" "}
                  <textarea
                    value={text}
                    onChange={(e) => {
                      refText.current.textContent = "";
                      setText(e.target.value);
                    }}
                  />
                </label>
                <span ref={refText} className="formError"></span>
                <button type="submit" className="btn">
                  Wyślij wiadomość
                </button>
              </form>
            ) : (
              <h4>Pomyślnie wysłano wiadomość!</h4>
            )}
            <div className="contactInfo">
              <div className="address">
                <h5>Informacje</h5>
                <p>{info?.companyName}</p>
                <p>{contactData.address}</p>
                <p>
                  {contactData.city} {contactData.zipcode}
                </p>
                <p>NIP: {contactData.nip}</p>
                <p>REGON: {contactData.regon}</p>
              </div>
              <div className="mail">
                <h5>Adres E-Mail</h5>
                <p>{contactData.mail}</p>
              </div>
              <div className="phone">
                <h5>Numer Telefonu</h5>
                <p>{contactData.phone}</p>
              </div>
            </div>
          </div>
        </div>
        {sending && (
          <div className="fullLoading">
            <div className="lds-ellipsis">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default function Page(props: any) {
  if (props.custom) {
    return <CustomPage {...props} />;
  } else {
    return <Contact {...props} />;
  }
}

export async function getStaticProps() {
  await dbConnect();
  const { menu, info, footer } = await getLayoutData();
  const page = await Menu.findOne({ slug: "contact" });

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
    const contactData = JSON.parse(JSON.stringify(await Contacts.findOne({})));
    delete contactData._id;

    return {
      props: {
        menu,
        footer,
        contactData,
        info,
        custom: page.custom,
      },
      revalidate: 60,
    };
  }
}
