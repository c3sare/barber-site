import {
    FaHome,
    FaWalking,
    FaUserEdit,
    FaBars,
    FaCopyright,
    FaWrench,
    FaThList,
    FaUsersCog,
    FaRegClock,
    FaMailBulk,
    FaNewspaper,
  } from "react-icons/fa";
import style from "../styles/admin.module.css";
//   import logo from "../logo.svg";
  import Link from "next/link";
// import Image from "next/image";
  
  const Menu = ({ perms, setMenuShow }: any) => {
    return (
      <>
        <div className={style["head-menu"]}>
          <div className={style["icon-menu"]}>
            {/* <Image src={logo} alt="Logo" /> */}
          </div>
          <div className={style["title-menu"]}>Panel Administratora</div>
          <div
            className={style["menu-show-btn"]}
            onClick={() => setMenuShow((prev:boolean) => !prev)}
          >
            <FaBars />
          </div>
        </div>
        <ul>
          <li>
            <Link href={`${process.env.NEXT_PUBLIC_AFTER_SITE_URL}/`}>
              <div className={style["icon-menu"]}>
                <FaHome />
              </div>
              <div className={style["title-menu"]}>Strona Główna</div>
            </Link>
          </li>
          {perms?.basic && (
            <li>
              <Link href={`${process.env.NEXT_PUBLIC_AFTER_SITE_URL}/basicconfig`}>
                <div className={style["icon-menu"]}>
                  <FaWrench />
                </div>
                <div className={style["title-menu"]}>Konfiguracja Podstawowa</div>
              </Link>
            </li>
          )}
          {perms?.footer && (
            <li>
              <Link href={`${process.env.NEXT_PUBLIC_AFTER_SITE_URL}/footerconfig`}>
                <div className={style["icon-menu"]}>
                  <FaCopyright />
                </div>
                <div className={style["title-menu"]}>Konfiguracja Stopki</div>
              </Link>
            </li>
          )}
          {perms?.menu && (
            <li>
              <Link href={`${process.env.NEXT_PUBLIC_AFTER_SITE_URL}/menuconfig`}>
                <div className={style["icon-menu"]}>
                  <FaThList />
                </div>
                <div className={style["title-menu"]}>Edycja Nawigacji</div>
              </Link>
            </li>
          )}
          {perms?.news && (
            <li>
              <Link href={`${process.env.NEXT_PUBLIC_AFTER_SITE_URL}/news`}>
                <div className={style["icon-menu"]}>
                  <FaNewspaper />
                </div>
                <div className={style["title-menu"]}>Aktualności</div>
              </Link>
            </li>
          )}
          {perms?.workers && (
            <li>
              <Link href={`${process.env.NEXT_PUBLIC_AFTER_SITE_URL}/workersconfig`}>
                <div className={style["icon-menu"]}>
                  <FaUsersCog />
                </div>
                <div className={style["title-menu"]}>Pracownicy</div>
              </Link>
            </li>
          )}
          {perms?.reservations && (
            <li>
              <Link href={`${process.env.NEXT_PUBLIC_AFTER_SITE_URL}/reservations`}>
                <div className={style["icon-menu"]}>
                  <FaRegClock />
                </div>
                <div className={style["title-menu"]}>Rezerwacje</div>
              </Link>
            </li>
          )}
          {perms?.smtpconfig && (
            <li>
              <Link href={`${process.env.NEXT_PUBLIC_AFTER_SITE_URL}/postconfig`}>
                <div className={style["icon-menu"]}>
                  <FaMailBulk />
                </div>
                <div className={style["title-menu"]}>Konfiguracja Poczty</div>
              </Link>
            </li>
          )}
          {perms?.users && (
            <li>
              <Link href={`${process.env.NEXT_PUBLIC_AFTER_SITE_URL}/usersconfig`}>
                <div className={style["icon-menu"]}>
                  <FaUserEdit />
                </div>
                <div className={style["title-menu"]}>Użytkownicy Panelu</div>
              </Link>
            </li>
          )}
        </ul>
        <ul>
          <li>
            <Link
              href={`${process.env.NEXT_PUBLIC_AFTER_SITE_URL}/logout`}
            >
              <div className={style["icon-menu"]}>
                <FaWalking />
              </div>
              <div className={style["title-menu"]}>Wyloguj</div>
            </Link>
          </li>
        </ul>
      </>
    );
  };
  
  export default Menu;
  