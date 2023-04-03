import HomeIcon from "@mui/icons-material/Home";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import CopyrightIcon from "@mui/icons-material/Copyright";
import BuildIcon from "@mui/icons-material/Build";
import ListIcon from "@mui/icons-material/List";
import GroupIcon from "@mui/icons-material/Group";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MailLockIcon from "@mui/icons-material/MailLock";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import PhotoSizeSelectActualIcon from "@mui/icons-material/PhotoSizeSelectActual";
import style from "../styles/admin.module.css";
import Link from "next/link";
import { IconButton, Tooltip } from "@mui/material";
import logo from "@/public/images/next-logo.png";
import Image from "next/image";

const IconButtonStyled = ({
  href,
  icon,
  name,
}: {
  href: string;
  icon: JSX.Element;
  name: string;
}) => {
  return (
    <Tooltip title={name} placement="right">
      <IconButton
        aria-label={name}
        LinkComponent={Link}
        href={href}
        sx={{
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.3)",
          },
          "& > svg": {
            fontSize: "18px",
          },
        }}
      >
        {icon}
      </IconButton>
    </Tooltip>
  );
};

const Menu = ({ perms }: any) => {
  return (
    <>
      <div className={style["icon-menu"]}>
        <Image priority src={logo} alt="Logo" width={50} height={50} />
      </div>
      <ul>
        <li>
          <IconButtonStyled
            name={"Strona Główna"}
            href={`${process.env.NEXT_PUBLIC_AFTER_SITE_URL}/`}
            icon={<HomeIcon fontSize="inherit" />}
          />
        </li>
        {perms?.basic && (
          <li>
            <IconButtonStyled
              name={"Konfiguracja Podstawowa"}
              href={`${process.env.NEXT_PUBLIC_AFTER_SITE_URL}/basicconfig`}
              icon={<BuildIcon fontSize="inherit" />}
            />
          </li>
        )}
        {perms?.footer && (
          <li>
            <IconButtonStyled
              name={"Konfiguracja Stopki"}
              href={`${process.env.NEXT_PUBLIC_AFTER_SITE_URL}/footerconfig`}
              icon={<CopyrightIcon fontSize="inherit" />}
            />
          </li>
        )}
        {perms?.menu && (
          <li>
            <IconButtonStyled
              name={"Edycja Nawigacji"}
              href={`${process.env.NEXT_PUBLIC_AFTER_SITE_URL}/menuconfig`}
              icon={<ListIcon fontSize="inherit" />}
            />
          </li>
        )}
        {perms?.news && (
          <li>
            <IconButtonStyled
              name={"Aktualności"}
              href={`${process.env.NEXT_PUBLIC_AFTER_SITE_URL}/news`}
              icon={<NewspaperIcon fontSize="inherit" />}
            />
          </li>
        )}
        {perms?.workers && (
          <li>
            <IconButtonStyled
              name={"Pracownicy"}
              href={`${process.env.NEXT_PUBLIC_AFTER_SITE_URL}/workersconfig`}
              icon={<GroupIcon fontSize="inherit" />}
            />
          </li>
        )}
        {perms?.reservations && (
          <li>
            <IconButtonStyled
              name={"Rezerwacje"}
              href={`${process.env.NEXT_PUBLIC_AFTER_SITE_URL}/reservations`}
              icon={<AccessTimeIcon fontSize="inherit" />}
            />
          </li>
        )}
        {perms?.smtpconfig && (
          <li>
            <IconButtonStyled
              name={"Konfiguracja Poczty"}
              href={`${process.env.NEXT_PUBLIC_AFTER_SITE_URL}/postconfig`}
              icon={<MailLockIcon fontSize="inherit" />}
            />
          </li>
        )}
        {perms?.users && (
          <li>
            <IconButtonStyled
              name={"Użytkownicy Panelu"}
              href={`${process.env.NEXT_PUBLIC_AFTER_SITE_URL}/usersconfig`}
              icon={<ManageAccountsIcon fontSize="inherit" />}
            />
          </li>
        )}
        <li>
          <IconButtonStyled
            name="Biblioteka obrazów"
            href={`${process.env.NEXT_PUBLIC_AFTER_SITE_URL}/imagelist`}
            icon={<PhotoSizeSelectActualIcon fontSize="inherit" />}
          />
        </li>
      </ul>
      <ul>
        <li>
          <IconButtonStyled
            name={"Wyloguj"}
            href={`${process.env.NEXT_PUBLIC_AFTER_SITE_URL}/logout`}
            icon={<ExitToAppIcon fontSize="inherit" />}
          />
        </li>
      </ul>
    </>
  );
};

export default Menu;
