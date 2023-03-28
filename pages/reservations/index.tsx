import Layout from "@/components/Layout";
import FooterData from "@/lib/types/FooterData";
import InfoData from "@/lib/types/InfoData";
import MenuItem from "@/lib/types/MenuItem";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { format } from "date-fns";
import { ClassNames, DayPicker } from "react-day-picker";
import styles from "react-day-picker/dist/style.css";
import { pl } from "date-fns/locale";
import { Divider } from "@mui/material";
import getLayoutData from "@/lib/getLayoutData";
import dbConnect from "@/lib/dbConnect";

const Reservations = ({
  menu,
  footer,
  info,
}: {
  menu: MenuItem[];
  footer: FooterData;
  info: InfoData;
}) => {
  const [loading, setLoading] = useState(true);
  const date = new Date();
  const year = date.getFullYear();
  const month =
    date.getMonth() + 1 < 10
      ? "0" + (date.getMonth() + 1)
      : date.getMonth() + 1;
  const day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();

  const today = `${year}-${month}-${day}`;

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [barbers, setBarbers] = useState<any>([]);
  const [currentBarber, setCurrentBarber] = useState<number>(0);
  const [dates, setDates] = useState<any>([]);
  const [selectedTime, setSelectedTime] = useState<any>("00:00");
  const [showReservForm, setShowReservForm] = useState<any>(false);
  const [nums, setNums] = useState<any>([
    Math.round(Math.random() * 10),
    Math.round(Math.random() * 10),
  ]);
  const captcha = useRef<any>(null);
  const refName = useRef<any>(null);
  const refSurName = useRef<any>(null);
  const refMail = useRef<any>(null);
  const refPhone = useRef<any>(null);
  const refCaptcha = useRef<any>(null);

  const [formName, setFormName] = useState("");
  const [formSurName, setFormSurName] = useState("");
  const [formMail, setFormMail] = useState("");
  const [formPhone, setFormPhone] = useState("");

  const [sending, setSending] = useState(false);

  const [formMsg, setFormMsg] = useState({ ok: false, msg: "" });
  const [error, setError] = useState(false);

  const clearReservationForm = () => {
    setFormName("");
    setFormSurName("");
    setFormMail("");
  };

  const handleSendReservation = (e: any) => {
    e.preventDefault();
    let error = false;
    const pattern = /^[a-zA-Z]+$/;

    if (!formName.length || !pattern.test(formName)) {
      refName.current!.textContent = "Nieprawidłowe imię!";
      error = true;
    }

    if (!formSurName.length || !pattern.test(formSurName)) {
      refSurName.current.textContent = "Nieprawidłowe nazwisko!";
      error = true;
    }
    const patternMail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
    if (!formMail.length || !patternMail.test(formMail)) {
      refMail.current.textContent = "Nieprawidłowy adres e-mail!";
      error = true;
    }

    const patternPhone =
      /(?<!\w)(\(?(\+|00)?48\)?)?[ -]?\d{3}[ -]?\d{3}[ -]?\d{3}(?!\w)/;
    if (!formPhone.length || !patternPhone.test(formPhone)) {
      refPhone.current.textContent = "Nieprawidłowy numer telefonu!";
      error = true;
    }

    if (Number(captcha.current.value) !== nums[0] + nums[1]) {
      refCaptcha.current.textContent = "Wynik działania nieprawidłowy!";
      setNums([Math.round(Math.random() * 10), Math.round(Math.random() * 10)]);
      error = true;
    }

    if (error) return;

    const reservationForm = {
      firstname: formName,
      lastname: formSurName,
      mail: formMail,
      phone: formPhone,
    };
    setSending(true);
    fetch(
      `/api/reservations/${barbers[currentBarber]._id}/${format(
        currentDate,
        "yyyy-MM-dd"
      )}/${selectedTime}`,
      {
        method: "PUT",
        headers: {
          "Content-type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(reservationForm),
      }
    )
      .then((data: any) => {
        setFormMsg({ ok: data.error, msg: data.msg });
      })
      .catch((error) => {
        setFormMsg({ ok: false, msg: `Wystąpił błąd - ${error}` });
      })
      .finally(() => {
        clearReservationForm();
        setShowReservForm(false);
        setTimeout(() => {
          setFormMsg({ ok: false, msg: "" });
        }, 4000);
        setSending(false);
        handleGetDate();
      });
  };

  const handleGetDate = useCallback(() => {
    if (barbers.length > 0) {
      setLoading(true);
      fetch(
        `/api/reservations/${barbers[currentBarber]._id}/${format(
          currentDate,
          "yyyy-MM-dd"
        )}`
      )
        .then((res) => res.json())
        .then((dates: any) => {
          setDates(dates);
          setLoading(false);
        })
        .catch((error) => {
          console.log(error);
          setError(true);
          setLoading(false);
        });
    }
  }, [currentBarber, currentDate, barbers]);

  useEffect(() => {
    fetch(`/api/reservations/barbers`)
      .then((res) => res.json())
      .then((barbers: any) => setBarbers(barbers))
      .catch((error) => {
        console.log(error);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    handleGetDate();
  }, [handleGetDate]);

  const selectBarber =
    barbers?.length > 0
      ? barbers.map((barber: any, i: number) => (
          <option key={barber._id} value={i}>
            {barber.name}
          </option>
        ))
      : [];

  const reservTimeList = dates.map((item: any) => (
    <li key={item.time}>
      <span>{item.time}</span>
      <button
        onClick={() => {
          setSelectedTime(item.time);
          setShowReservForm(true);
          setNums([
            Math.round(Math.random() * 10),
            Math.round(Math.random() * 10),
          ]);
        }}
      >
        Rezerwuj
      </button>
    </li>
  ));

  const classNames: ClassNames = {
    ...styles,
    root: "rdp customdp",
  };

  return (
    <Layout title="Rezerwacje" menu={menu} footer={footer} info={info}>
      <div className="container">
        <h1>Rezerwacje</h1>
        {barbers?.length > 0 && (
          <>
            <div>
              <label htmlFor="barber">
                <span>Wybierz Fryzjera:</span>
                <select
                  name="barber"
                  value={currentBarber}
                  onChange={(e) => setCurrentBarber(Number(e.target.value))}
                >
                  {selectBarber}
                </select>
              </label>
            </div>
          </>
        )}
        {formMsg.msg && <span>{formMsg.msg}</span>}
        <DayPicker
          disabled={loading}
          classNames={classNames}
          mode="single"
          locale={pl}
          selected={currentDate}
          defaultMonth={new Date()}
          onSelect={(e) => {
            if (e !== undefined && format(e, "yyyy-MM-dd") >= (today as any))
              setCurrentDate(e as any);
          }}
        />
        <Divider sx={{ margin: "16px" }} />
        <h2>Terminy dostępne w wybranym dniu</h2>
        <ul className="reservList">
          {!loading ? (
            reservTimeList?.length > 0 ? (
              reservTimeList
            ) : (
              <h3>Brak terminów!</h3>
            )
          ) : (
            <div className="lds-ellipsis">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          )}
        </ul>
      </div>
      {showReservForm && (
        <div className="reservForm">
          <h5>Data: {format(currentDate, "yyyy-MM-dd")}</h5>
          <h5>Fryzjer: {barbers[Number(currentBarber)].name}</h5>
          <h5>Godzina: {selectedTime}</h5>
          <form>
            <label>
              <span>Imię:</span>
              <input
                type="text"
                value={formName}
                onChange={(e) => {
                  setFormName(e.target.value);
                  refName.current.textContent = "";
                }}
              />
            </label>
            <span className="formError" ref={refName}></span>
            <label>
              <span>Naziwsko:</span>
              <input
                type="text"
                value={formSurName}
                onChange={(e) => {
                  setFormSurName(e.target.value);
                  refSurName.current.textContent = "";
                }}
              />
            </label>
            <span className="formError" ref={refSurName}></span>
            <label>
              <span>Adres E-Mail:</span>
              <input
                type="text"
                value={formMail}
                onChange={(e) => {
                  setFormMail(e.target.value);
                  refMail.current.textContent = "";
                }}
              />
            </label>
            <span className="formError" ref={refMail}></span>
            <label>
              <span>Numer Telefonu:</span>
              <input
                type="text"
                value={formPhone}
                onChange={(e) => {
                  setFormPhone(e.target.value);
                  refPhone.current.textContent = "";
                }}
              />
            </label>
            <span className="formError" ref={refPhone}></span>
            <label>
              <span style={{ paddingTop: "4px" }}>
                {nums[0]} + {nums[1]} ={" "}
              </span>
              <input
                ref={captcha}
                type="text"
                onChange={() => (refCaptcha.current.textContent = "")}
              />
            </label>
            <span className="formError" ref={refCaptcha}></span>
            <button
              style={{ marginTop: "8px" }}
              onClick={(e) => handleSendReservation(e)}
            >
              Zapisz się
            </button>
            {sending && (
              <div
                className="fullLoading"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
              >
                <div className="lds-ellipsis">
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              </div>
            )}
          </form>

          <div
            className="closeBtn"
            onClick={() => {
              setShowReservForm(false);
              clearReservationForm();
            }}
          >
            <div className="closeBtn_1"></div>
            <div className="closeBtn_2"></div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Reservations;

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
