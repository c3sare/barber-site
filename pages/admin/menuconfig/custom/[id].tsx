import { Layout } from "@/componentsAdminPanel/Layout"
import Loading from "@/componentsAdminPanel/Loading";
import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionSsr } from "iron-session/next";
import { useRouter } from "next/router";
import useSWR from "swr";
import type { Value } from '@react-page/editor';
import Editor from '@react-page/editor';
import { useState } from "react";
import { StylesProvider, createGenerateClassName } from '@material-ui/core/styles';
import '@react-page/editor/lib/index.css';
import { cellPlugins } from "@/ReactPagesComponents/cellPlugins";

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
};

const generateClassName = createGenerateClassName({
    disableGlobal: true,
    seed: 'mui-jss',
  });

const AdminPanelIndex = ({permissions={}}: any) => {
  const router = useRouter();
  const {data, error, isLoading} = useSWR("/api/menu/settings/"+router.query.id);
  const [value, setValue] = useState<Value | null>(null);

    return (
        <Layout perms={permissions}>
          {!isLoading ?
            !error ?
                <StylesProvider generateClassName={generateClassName}>
                    <Editor
                        cellPlugins={cellPlugins}
                        zoomEnabled={false}
                        value={value}
                        onChange={setValue}
                        uiTranslator={(label?: string | null | undefined) => {
                            if (TRANSLATIONS[label as string] !== undefined) {
                              return TRANSLATIONS[label as string] as string;
                            }
                            return `${label}(to translate)`;
                          }}/>
                </StylesProvider>
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