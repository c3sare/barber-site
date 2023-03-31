import { ThemeProvider } from "@emotion/react";
import styled from "@emotion/styled";
import { createTheme, IconButton } from "@mui/material";
import { blueGrey } from "@mui/material/colors";
import Image from "next/image";
import React from "react";
import { useEffect, useState } from "react";
import CButton from "./elements/CButton";
import Loading from "./Loading";
import CameraAlt from "@mui/icons-material/CameraAlt";

const InputStyled = styled("input")({
  display: "none",
  color: "",
});

const theme = createTheme({
  palette: {
    primary: {
      main: blueGrey[700],
      contrastText: "white",
    },
  },
});

const ImageSelect = ({ setSelectedImage, setOpen }: any) => {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);

  useEffect(() => {
    let mounted = true;
    fetch("/api/images")
      .then((res) => res.json())
      .then((data) => {
        if (mounted) setList(data);
      })
      .catch((err) => {
        console.log(err);
        setOpen(false);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [setOpen]);

  const handleSelectImage = (
    e: React.MouseEvent<HTMLAnchorElement>,
    key: string
  ) => {
    e.preventDefault();
    setSelectedImage(key);
    setOpen(false);
  };

  const upload = async (e: any) => {
    if (e.target?.files?.length === 1) {
      setLoading(true);
      const file = e.target.files[0];

      const res = await fetch("/api/images", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: file.name,
          type: file.type,
        }),
      }).then((data) => data.json());

      const { url, fields } = res;

      const formData = new FormData();

      Object.entries({ ...fields, file }).forEach(([key, value]) => {
        formData.append(key, value as string);
      });

      const upload = await fetch(url, {
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: formData,
      });

      if (upload.ok) {
        console.log("Uploaded successfully!");
        fetch("/api/images")
          .then((res) => res.json())
          .then((data) => {
            setList(data);
          })
          .finally(() => setLoading(false));
      } else {
        console.error("Upload failed.");
        setLoading(false);
      }
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "fixed",
        top: "0",
        left: "0",
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        textAlign: "center",
        zIndex: 999,
      }}
    >
      <h1>Wybierz obraz</h1>
      <ThemeProvider theme={theme}>
        <label htmlFor="upload">
          <InputStyled
            type="file"
            name="upload"
            id="upload"
            onChange={upload}
          />
          <IconButton
            disabled={loading}
            color="primary"
            aria-label="upload picture"
            component="span"
          >
            <CameraAlt />
          </IconButton>
        </label>
      </ThemeProvider>
      <div>
        {!loading ? (
          list.map((item: any) => (
            <a
              style={{ display: "inline-block", margin: "0 4px" }}
              key={item.Key}
              href={`https://barberianextjs.s3.eu-central-1.amazonaws.com/${item.Key}`}
              onClick={(e) => handleSelectImage(e, item.Key)}
            >
              <Image
                src={`https://barberianextjs.s3.eu-central-1.amazonaws.com/${item.Key}`}
                alt={item.Key}
                sizes=""
                width={200}
                height={200}
                style={{ objectFit: "contain", objectPosition: "center" }}
              />
            </a>
          ))
        ) : (
          <Loading />
        )}
      </div>
      <CButton onClick={() => setOpen(false)}>Anuluj</CButton>
    </div>
  );
};

export default ImageSelect;
