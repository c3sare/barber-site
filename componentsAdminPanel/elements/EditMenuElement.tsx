import { Box, Checkbox, Container } from "@mui/material";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import CButton from "./CButton";
import CFormControlLabel from "./CFormControlLabel";
import CTextField from "./CTextField";

const EditMenuElement = ({
    setEdit,
    state,
    setState,
    item,
    mode,
    parentId = null,
    setSnackBar,
}: any) => {
    const [sending, setSending] = useState(false);
    const {
      formState: { errors },
      control,
      handleSubmit,
    } = useForm({
      defaultValues: {
        title: item.title || "",
        url: item.url || "",
        on: item.on === true || item.on === false ? item.on : true,
        custom:
          item.custom === true || item.custom === false ? item.custom : true,
      },
    });
  
    const onSubmit = (data:any) => {
      if (mode === 1) {
        fetch("/api/menu", {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "cors",
          body: JSON.stringify({
            id: item._id,
            currentState: state,
            menuItem: data,
            parentId: parentId,
          }),
        })
          .then((res) => res.json())
          .then((res) => {
            if (res.error === true) {
              setSnackBar({
                open: true,
                msg: "Nie można zaaktualizować danych!",
                type: "error",
              });
            } else {
              setSnackBar({
                open: true,
                msg: "Pomyślnie zaaktualizowano węzeł!",
                type: "success",
              });
              setState((state:any) => {
                const newState = [...state];
                newState.forEach((newItem) => {
                  if (newItem._id === item._id) {
                    newItem.title = data.title;
                    newItem.url = data.url;
                    newItem.custom = data.custom;
                    newItem.on = data.on;
                  } else {
                    newItem.children?.forEach((newSubItem:any) => {
                      if (newSubItem._id === item._id) {
                        newSubItem.title = data.title;
                        newSubItem.url = data.url;
                        newSubItem.custom = data.custom;
                        newSubItem.on = data.on;
                      }
                    });
                  }
                });
  
                return newState;
              });
              setEdit(null);
            }
          });
      } else if (mode === 2) {
        setSending(true);
        fetch("/api/menu", {
          method: "PUT",
          credentials: "include",
          body: JSON.stringify(data),
          headers: {
            "Content-Type": "application/json",
          },
        })
        .catch((err) => {
            console.log(err);
            setSending(false);
        })
        .then((res:any) => res.json())
        .then((res) => {
            if (res._id) {
              setState((state:any) => {
                const newItem = { _id: res._id, ...data, children: [] };
                return [...state, newItem];
              });
              setEdit(null);
            } else {
              console.log("Błąd!");
            }
          });
      }
    };
  

    return (
        <div className="editMenuElement">
        <Container
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box p={1}>
              <Controller
                control={control}
                name="title"
                rules={{
                  required: "To pole jest wymagane.",
                  pattern: {
                    value:
                      /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u,
                    message: "Nieprawidłowo uzupełnione pole",
                  },
                  maxLength: {
                    value: 20,
                    message: "Max. ilość znaków to 20",
                  },
                }}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <CTextField
                    variant="outlined"
                    placeholder="Nazwa strony"
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                    inputRef={ref}
                    error={Boolean(errors.title)}
                    helperText={errors.title?.message as string}
                  />
                )}
              />
            </Box>
            <Box p={1}>
              <Controller
                control={control}
                name="url"
                rules={
                  !item.default
                    ? {
                        required: "To pole jest wymagane.",
                        pattern: {
                          value: /(^\/)+[^\s]+[\w]/,
                          message: "Nieprawidłowo uzupełnione pole",
                        },
                        maxLength: {
                          value: 20,
                          message: "Max. ilość znaków to 20",
                        },
                        validate: {
                          anotherElementHaveUrl: (v) =>
                            state.filter(
                              (curItem:any) =>
                                (curItem.url === v && item._id !== curItem._id) ||
                                curItem.children?.filter(
                                  (sub:any) => sub.url === v && sub._id !== item._id
                                ).length !== 0
                            ).length === 0 ||
                            item.default ||
                            item.url === "/" ||
                            "Taki adres już istnieje.",
                        },
                      }
                    : {}
                }
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <CTextField
                    disabled={item.default || item.url === "/"}
                    variant="outlined"
                    placeholder="Adres strony"
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                    inputRef={ref}
                    error={Boolean(errors.url)}
                    helperText={errors.url?.message as string}
                  />
                )}
              />
            </Box>
            <Box p={1}>
              <Controller
                control={control}
                name="on"
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <CFormControlLabel
                    label="Wyświetlaj"
                    disabled={item.url === "/" || mode === 2}
                    control={
                      <Checkbox
                        color="default"
                        checked={value}
                        onChange={onChange}
                        onBlur={onBlur}
                        inputRef={ref}
                      />
                    }
                  />
                )}
              />
            </Box>
            <Box p={1}>
              <Controller
                control={control}
                name="custom"
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <CFormControlLabel
                    label="Własna strona"
                    control={
                      <Checkbox
                        disabled={!item.default || mode === 2}
                        color="default"
                        checked={value}
                        onBlur={onBlur}
                        inputRef={ref}
                        onChange={onChange}
                      />
                    }
                  />
                )}
              />
            </Box>
            <Box p={1}>
              <CButton type="submit">
                {mode === 1 ? "Zapisz zmiany" : "Dodaj element"}
              </CButton>
              <CButton onClick={() => setEdit(null)}>Anuluj</CButton>
            </Box>
          </form>
        </Container>
      </div>
    )
}

export default EditMenuElement;