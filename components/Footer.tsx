import style from "@/styles/footer.module.css";
import Link from "next/link";
import InfoData from "@/lib/types/InfoData";
import FooterData from "@/lib/types/FooterData";

const Footer = ({footerData, info}: {footerData: FooterData, info: InfoData}) => {

  return (
    <div className={style.footer}>
      <div className={style.mainContent}>
        <div className={style.descBox}>
          <img className={style.logo} src={`/images/${footerData.logo}`} alt="Logo" width="200px" height="auto"/>
          <p>{footerData?.desc}</p>
          {footerData.btnMore &&
            (footerData.btnLink!.indexOf("http") === 0 ? (
              <a href={footerData.btnLink!} className={style.btn}>
                {footerData.btnTitle}
              </a>
            ) : (
              <Link className={style.btn} href={footerData.btnLink!}>
                {footerData.btnTitle}
              </Link>
            ))}
        </div>
        {footerData?.linkBoxes.map((box, index: number) => (
          <div className={style.linkBox} key={index}>
            <p className={style.linkBoxName}>{box.name}</p>
            <ul>
              {box.links.map(li => (
                <li key={li.id}>
                  {li.url.indexOf("http") > -1 ? (
                    <a href={li.url}>{li.name}</a>
                  ) : (
                    <Link href={li.url}>{li.name}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className={style.copyrights}>
        <p>
          {info?.yearOfCreate} © {info?.companyName}
        </p>
      </div>
    </div>
  );
};

export default Footer;
