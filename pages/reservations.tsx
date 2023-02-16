import Layout from "@/components/Layout";
import getMenu from "@/lib/getMenu";
import FooterData from "@/lib/types/FooterData";
import InfoData from "@/lib/types/InfoData";
import MenuItem from "@/lib/types/MenuItem";
import { getDataOne } from "@/utils/getData";
import { useState, useEffect, useCallback, useRef } from "react";

const Reservations = ({
  menu,
  footer,
  info
} : {
  menu:MenuItem[],
  footer: FooterData,
  info: InfoData
}) => {
  const [loading, setLoading] = useState(false);
  const date = new Date();
  const year = date.getFullYear();
  const month =
    date.getMonth() + 1 < 10
      ? "0" + (date.getMonth() + 1)
      : date.getMonth() + 1;
  const day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();

  const today = `${year}-${month}-${day}`;

  const [currentDate, setCurrentDate] = useState<string>(today);
  const [barbers, setBarbers] = useState<any>([]);
  const [currentBarber, setCurrentBarber] = useState<string>("0");
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

  const handleSendReservation = (e:any) => {
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
      time: selectedTime,
      firstname: formName,
      lastname: formSurName,
      mail: formMail,
      phone: formPhone,
    };
    setSending(true);
    fetch(
        `/api/reservations/barber/${currentBarber}/${currentDate}`, {
            method: "POST",
            headers: {
                "Content-type": "application/json; charset=utf-8",
            },
            body: JSON.stringify(reservationForm)
            
        }
      )
      .then((data:any) => {
        setFormMsg({ ok: data.data.error, msg: data.data.msg });
        setSending(false);
        setTimeout(() => {
          setFormMsg({ ok: false, msg: "" });
          console.log(data.data!.data!);
        }, 4000);
        clearReservationForm();
        setShowReservForm(false);
        handleGetDate();
      })
      .catch((error) => {
        setSending(false);
        setFormMsg({ ok: false, msg: `Wystąpił błąd - ${error}` });
      });
  };

  const handleGetBarbers = () => {
    fetch(`/api/reservations/barbers`)
      .then((barbers:any) => setBarbers(barbers.data))
      .catch((error) => {
        console.log(error);
        setError(true);
      });
  };

  const handleGetDate = useCallback(() => {
    setLoading(true);
    fetch(`/api/reservations/barber/${currentBarber}/${currentDate}`)
    .then((dates:any) => {
        setDates(dates.data);
        setLoading(false);
    })
      .catch((error) => {
        console.log(error);
        setError(true);
        setLoading(false);
      });
  }, [currentBarber, currentDate]);

  useEffect(() => {
    handleGetBarbers();
  }, []);

  useEffect(() => {
    handleGetDate();
  }, [handleGetDate]);

  if (currentDate < today) setCurrentDate(today);

  const selectBarber = barbers?.length > 0 ? barbers.map((barber:any) => (
    <option key={barber.id} value={`${barber.id}`}>
      {barber.name}
    </option>
  )) : [];

  const reservTimeList = dates?.[0]?.times
    ?.filter(
      (item:any) =>
        !item.reserved &&
        !item.confirmed &&
        !item.expired &&
        (item.reservedDate < new Date().getTime() ||
          item.reservedDate.length === 0)
    )
    .map((item:any) => (
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

  return (
    <Layout title="Rezerwacje" menu={menu} footer={footer} info={info}>
      <div className="container">
        <h1>Rezerwacje</h1>
        {formMsg.msg.length > 0 && (
          <h5 style={{ color: "red" }}>{formMsg.msg}</h5>
        )}
        <input
          value={currentDate}
          onChange={(e) => setCurrentDate(e.target.value)}
          min={today}
          type="date"
        />
        {barbers?.length > 0 && (
          <>
            <label htmlFor="barber">Wybierz Fryzjera:</label>
            <select
              name="barber"
              value={currentBarber}
              onChange={(e) => setCurrentBarber(e.target.value)}
            >
              {selectBarber}
            </select>
          </>
        )}
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
          <h5>Data: {currentDate}</h5>
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
    const menu: MenuItem[] = await getMenu();
    const footer: FooterData = await getDataOne("footer");
    const info: InfoData = await getDataOne("info");

    return {
      props: {
        menu,
        footer,
        info
      }
    }
}