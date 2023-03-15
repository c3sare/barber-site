import style from "@/styles/header.module.css";
import { useState, MouseEvent } from "react";
import Link from "next/link";
import MenuItem from "@/lib/types/MenuItem";
import flatListToHierarchical from "@/utils/flatToHierarchical";
import Image from "next/image";

const generateMenu = (tab:MenuItem[], closeMenu:any) => {
  return tab.map(item => (
    <li key={item._id}>
      <Link href={`/${item.slug}`}>{item.title}</Link>
      {item.children?.length > 0 && (
        <>
          <ul className={style.subMenu}>
            {generateMenu(item.children, closeMenu)}
          </ul>
          <div
            className={style.showHideSubMenu + " " + style.rotate}
            onClick={closeMenu}
          />
        </>
      )}
  </li>
  ));
}

const Header = ({menu, logo}: {menu: MenuItem[], logo: string}) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleToggleMenu = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setShowMenu((prev) => !prev);
  };

  const handleOpenCloseSubMenu = (e: MouseEvent<HTMLDivElement>) => {
    e.currentTarget.classList.toggle(`${style.rotate}`);
    e.currentTarget!.parentNode!.querySelector(`ul`)!.style.maxHeight = e.currentTarget.classList.contains(`${style.rotate}`) ? "" : e.currentTarget.parentNode!.querySelector(`ul`)!.querySelectorAll("li").length*63+"px";
  };

  return (
    <div className={style.header}>
      <Link href="/">
        <div className={style.logo}>
          <Image
            src={`/images/${logo}`}
            alt="Logo"
            fill
            sizes="(max-width: 1200px) 200px,
            (max-width: 1024px) 150px,
            (max-width: 768px) 100px,
            100px"
          />
        </div>
      </Link>
      <div
        className={
          style.menuButton + "" + `${showMenu ? " " + style.change : ""}`
        }
        onClick={handleToggleMenu}
      >
        <div className={style.menuBtnElement}></div>
        <div className={style.menuBtnElement}></div>
        <div className={style.menuBtnElement}></div>
      </div>
      <div
        className={style.navMenu}
        style={showMenu ? { maxHeight: `${58 * menu.length + 15}px` } : {}}
      >
        <ul>
          {generateMenu(flatListToHierarchical(menu as never[]), handleOpenCloseSubMenu)}
        </ul>
      </div>
    </div>
  );
};

export default Header;
