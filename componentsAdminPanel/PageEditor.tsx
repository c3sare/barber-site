import Editor from "@react-page/editor";
import cellPlugins from "@/ReactPagesComponents/cellPlugins";
import Loading from "./Loading";

const TRANSLATIONS: { [key: string]: string } = {
  "Edit blocks": "Edycja bloku",
  "Add blocks": "Dodawanie bloku",
  "Move blocks": "Przenoszenie bloku",
  "Resize blocks": "Zmiana rozmiaru bloku",
  "Preview blocks": "Podgląd bloku",
  "Preview page": "Podgląd strony",
  "Add blocks to page": "Dodaj blok do strony",
  "Search for blocks": "Szukaj komponentów",
  Text: "Tekst",
  "An advanced rich text area.": "Zaawansowany edytor tekstu (WYSIWYG).",
  Image: "Obraz",
  "Loads an image from an url.": "Ładuje obraz z podanego adresu.",
  Spacer: "Pusta przestrzeń",
  "Resizeable, horizontal and vertical empty space.":
    "Skalowalna, pozioma i pionowa pusta przestrzeń.",
  Divider: "Rozdzielacz",
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
  "Click to add or drag and drop it somewhere on your page!":
    "Kliknij aby dodać lub przeciągnij i upuść gdzieś na stronę",
  OR: "LUB",
  "Existing image URL": "Istniejący adres obrazu",
  Video: "Film",
  "Include videos from Vimeo or YouTube":
    "Dołącza film z serwisu Youtube lub Vimeo",
  "HTML 5 Video": "Film HTML5",
  "Add webm, ogg and other HTML5 video":
    "Dodaj filmy WEBM, OGG i inne obsługiwane przez HTML5",
  Background: "Tło",
  "Add background color, image or gradient":
    "Dodaj kolor tła, obraz lub gradient",
};

export default function PageEditor({ value, setValue, loading }: any) {
  return (
    <div style={{ width: "100%", position: "relative" }}>
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
      {loading && (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            top: "0",
            left: "0",
          }}
        >
          <Loading />
        </div>
      )}
    </div>
  );
}
