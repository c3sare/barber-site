import { Layout } from "@/componentsAdminPanel/Layout"
import Loading from "@/componentsAdminPanel/Loading";
import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionSsr } from "iron-session/next";
import { useRouter } from "next/router";
import useSWR from "swr";
import type { Value } from '@react-page/editor';
import Editor from '@react-page/editor';
import { useEffect, useState } from "react";
import { cellPlugins } from "@/ReactPagesComponents/cellPlugins";
import CButton from "@/componentsAdminPanel/elements/CButton";
import Link from "next/link";
import CLoadingButton from "@/componentsAdminPanel/elements/CLoadingButton";
import SaveIcon from '@mui/icons-material/Save';

const TRANSLATIONS: { [key: string]: string } = {
    'Edit blocks': 'Edycja bloku',
    'Add blocks': 'Dodawanie bloku',
    'Move blocks': 'Przenoszenie bloku',
    'Resize blocks': 'Zmiana rozmiaru bloku',
    'Preview blocks': 'Podgląd bloku',
    'Preview page' : 'Podgląd strony',
    'Add blocks to page': 'Dodaj blok do strony',
    'Search for blocks': 'Szukaj komponentów',
    'Text': 'Tekst',
    'An advanced rich text area.': 'Zaawansowany edytor tekstu (WYSIWYG).',
    "Image": 'Obraz',
    "Loads an image from an url.": "Ładuje obraz z podanego adresu.",
    "Spacer": "Pusta przestrzeń",
    "Resizeable, horizontal and vertical empty space.": "Skalowalna, pozioma i pionowa pusta przestrzeń.",
    "Divider": "Rozdzielacz",
    "A horizontal divider": "Pozioma linia - Rozdzielacz",
    "Change size of this window": "Zmień rozmiar tego okna",
    "Content is visible": "Treść jest widoczna",
    "Content is hidden": "Treść jest ukryta",
    "Duplicate Plugin": "Powiel blok",
    "Remove Plugin": "Usuń blok",
    "Write here...": "Pisz tutaj...",
    "Image URL": "Adres obrazu",
    "Link to open upon image click": "Adres strony do otwarcia po kliknięciu",
    "Open link in new window": "Otwórz stronę w nowym oknie",
    "Image's alternative description": "Alternatywny tekst obrazu",
    "Click to add or drag and drop it somewhere on your page!": "Kliknij aby dodać lub przeciągnij i upuść gdzieś na stronę",
    "OR": "LUB",
    "Existing image URL": "Istniejący adres obrazu",
    "Video": "Film",
    "Include videos from Vimeo or YouTube": "Dołącza film z serwisu Youtube lub Vimeo",
    "HTML 5 Video": "Film HTML5",
    "Add webm, ogg and other HTML5 video": "Dodaj filmy WEBM, OGG i inne obsługiwane przez HTML5",
    "Background": "Tło",
    "Add background color, image or gradient": "Dodaj kolor tła, obraz lub gradient",
    
};

const AdminPanelIndex = ({permissions={}}: any) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {data, error, isLoading} = useSWR("/api/menu/custom/content/"+router.query.id);
  const [value, setValue] = useState<Value | null>(null);

  useEffect(() => {
    setValue(data);
  }, [data]);

  const handleSendContent = () => {
    setLoading(true);
    fetch(`/api/menu/custom/content/${router.query.id}`, {
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify(value)
    })
    .then(res => res.json())
    .then(data => {
      if(data.error) {
        console.log("Wystąpił błąd");
        setLoading(false);
      } else {
        router.push("/admin/menuconfig#edit")
      }
    });
  }

    return (
        <Layout perms={permissions}>
          {!isLoading ?
            !error ?
              <>
                <div style={{width: "100%", position: "relative"}}>
                  <Editor
                    cellPlugins={cellPlugins}
                    zoomEnabled={false}
                    value={value}
                    onChange={setValue}
                    uiTranslator={(label?: string | null | undefined) => {
                      if (TRANSLATIONS[label as string] !== undefined) {
                        return TRANSLATIONS[label as string] as string;
                      }
                      return `${label}`;
                    }}
                  />
                  {loading && 
                    <div style={{width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "absolute", top: "0", left: "0"}}>
                      <Loading/>
                    </div>
                  }
                </div>
                <div style={{textAlign: "center"}}>
                  <CButton
                    disabled={loading}
                    LinkComponent={Link}
                    href="/admin/menuconfig#edit"
                  >
                    Wróć
                  </CButton>
                  <CLoadingButton
                    disabled={loading}
                    loading={loading}
                    loadingPosition="start"
                    startIcon={<SaveIcon/>}
                    onClick={handleSendContent}
                  >
                    Zapisz zmiany
                  </CLoadingButton>
                </div>
              </>
            :
            <span>Nie znaleziono strony!</span>
            :
            <Loading/>
          }
        </Layout>
    )
}

export default AdminPanelIndex;

export const getServerSideProps = withIronSessionSsr(
    async function getServerSideProps({ req }) {
      const user = req.session.user;
  
      if (user?.isLoggedIn !== true || !user?.permissions.menu) {
        return {
          notFound: true,
        };
      }
  
      return {
        props: {
          permissions: req.session.user?.permissions,
        },
      };
    },
    sessionOptions
);