import style from "@/styles/footer.module.css";
import Link from "next/link";
import InfoData from "@/lib/types/InfoData";
import FooterData from "@/lib/types/FooterData";
import Image from "next/image";

const Footer = ({
  footerData,
  info,
}: {
  footerData: FooterData;
  info: InfoData;
}) => {
  return (
    <div className={style.footer}>
      <div className={style.mainContent}>
        <div className={style.descBox}>
          <div
            style={{
              width: "200px",
              height: "45px",
              position: "relative",
            }}
          >
            <Image {...(footerData.logo as any).img} alt="Logo Dolne" />
          </div>
          <p>{footerData?.desc}</p>
          {footerData.btnMore &&
            (footerData.btnLink!.indexOf("http") === 0 ? (
              <a href={footerData.btnLink!} className="btn">
                {footerData.btnTitle}
              </a>
            ) : (
              <Link className="btn" href={footerData.btnLink!}>
                {footerData.btnTitle}
              </Link>
            ))}
        </div>
        {footerData?.linkBoxes.map((box, index: number) => (
          <div className={style.linkBox} key={index}>
            <p className={style.linkBoxName}>{box.name}</p>
            <ul>
              {box.links.map((li) => (
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
