import style from "@/styles/header.module.css";
import { useState, MouseEvent } from "react";
import Link from "next/link";
import vercel from "@/public/images/vercel.svg";
import MenuItem from "@/lib/types/MenuItem";

function compareOrder(a: MenuItem, b: MenuItem): number {
  if (a.order > b.order) return 1;
  if (a.order < b.order) return -1;
  return 0;
}

function sortHierarchical(tab: MenuItem[]) {
  return tab.sort(compareOrder).map(item => {
    if(item?.children?.length > 0) {
      item.children = sortHierarchical(item.children);
    }
    return item;
  })
}

const flatListToHierarchical = (
  data = [],
  {idKey='_id',parentKey='parent',childrenKey='children'} = {}
): MenuItem[] => {
  const tree:MenuItem[] = [];
  const childrenOf:any = {};
  data.forEach((item:MenuItem) => {
      const newItem:any = {...item};
      const { [idKey]: id, [parentKey]: parentId = 0 } = newItem;
      childrenOf[id] = childrenOf[id] || [];
      newItem[childrenKey] = childrenOf[id];
      parentId
          ? (
              childrenOf[parentId] = childrenOf[parentId] || []
          ).push(newItem)
          : tree.push(newItem);
  });
  return sortHierarchical(tree);
};

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
        <img className={style.logo} src={`/images/${logo}`} alt="Logo" width="200px" height="auto"/>
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
