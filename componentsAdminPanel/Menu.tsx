import {
    FaHome,
    FaWalking,
    FaUserEdit,
    FaCopyright,
    FaWrench,
    FaThList,
    FaUsersCog,
    FaRegClock,
    FaMailBulk,
    FaNewspaper,
  } from "react-icons/fa";
import style from "../styles/admin.module.css";
import Link from "next/link";
import { IconButton, Tooltip } from "@mui/material";
import logo from "@/public/images/next-logo.png";
import Image from "next/image";

const IconButtonStyled = ({href, icon, name}:{href: string, icon: JSX.Element, name: string}) => {

  return (
    <Tooltip title={name} placement="right">
      <IconButton aria-label={name} LinkComponent={Link} href={href} sx={{width: "50px", height: "50px", borderRadius: "50%", "&:hover": {backgroundColor: "rgba(0, 0, 0, 0.3)"}}}>
        {icon}
      </IconButton>
    </Tooltip>
  )
}
  
  const Menu = ({ perms }: any) => {
    return (
      <>
        <div className={style["icon-menu"]}>
          <Image src={logo} alt="Logo" width={50} height={50}/>
        </div>
        <ul>
          <li>
            <IconButtonStyled name={"Strona Główna"} href={`${process.env.NEXT_PUBLIC_AFTER_SITE_URL}/`} icon={<FaHome size={"large"}/>}/>
          </li>
          {perms?.basic && (
            <li>
              <IconButtonStyled name={"Konfiguracja Podstawowa"} href={`${process.env.NEXT_PUBLIC_AFTER_SITE_URL}/basicconfig`} icon={<FaWrench size={"large"}/>}/>
            </li>
          )}
          {perms?.footer && (
            <li>
              <IconButtonStyled name={"Konfiguracja Stopki"} href={`${process.env.NEXT_PUBLIC_AFTER_SITE_URL}/footerconfig`} icon={<FaCopyright size={"large"}/>}/>
            </li>
          )}
          {perms?.menu && (
            <li>
              <IconButtonStyled name={"Edycja Nawigacji"} href={`${process.env.NEXT_PUBLIC_AFTER_SITE_URL}/menuconfig`} icon={<FaThList size={"large"}/>}/>
            </li>
          )}
          {perms?.news && (
            <li>
              <IconButtonStyled name={"Aktualności"} href={`${process.env.NEXT_PUBLIC_AFTER_SITE_URL}/news`} icon={<FaNewspaper size={"large"}/>}/>
            </li>
          )}
          {perms?.workers && (
            <li>
              <IconButtonStyled name={"Pracownicy"} href={`${process.env.NEXT_PUBLIC_AFTER_SITE_URL}/workersconfig`} icon={<FaUsersCog size={"large"}/>}/>
            </li>
          )}
          {perms?.reservations && (
            <li>
              <IconButtonStyled name={"Rezerwacje"} href={`${process.env.NEXT_PUBLIC_AFTER_SITE_URL}/reservations`} icon={<FaRegClock size={"large"}/>}/>
            </li>
          )}
          {perms?.smtpconfig && (
            <li>
              <IconButtonStyled name={"Konfiguracja Poczty"} href={`${process.env.NEXT_PUBLIC_AFTER_SITE_URL}/postconfig`} icon={<FaMailBulk size={"large"}/>}/>
            </li>
          )}
          {perms?.users && (
            <li>
              <IconButtonStyled name={"Użytkownicy Panelu"} href={`${process.env.NEXT_PUBLIC_AFTER_SITE_URL}/usersconfig`} icon={<FaUserEdit size={"large"}/>}/>
            </li>
          )}
        </ul>
        <ul>
          <li>
            <IconButtonStyled name={"Wyloguj"} href={`${process.env.NEXT_PUBLIC_AFTER_SITE_URL}/logout`} icon={<FaWalking size={"large"}/>}/>
          </li>
        </ul>
      </>
    );
  };
  
  export default Menu;
  