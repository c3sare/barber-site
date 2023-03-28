import CTextField from "@/componentsAdminPanel/elements/CTextField";
import { Layout } from "@/componentsAdminPanel/Layout";
import Loading from "@/componentsAdminPanel/Loading";
import { sessionOptions } from "@/lib/AuthSession/Config";
import {
  Box,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tooltip,
} from "@mui/material";
import { blueGrey } from "@mui/material/colors";
import { withIronSessionSsr } from "iron-session/next";
import React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsIcon from "@mui/icons-material/Settings";
import DeleteDialog from "@/componentsAdminPanel/elements/DeleteDialog";
import CLoadingButton from "@/componentsAdminPanel/elements/CLoadingButton";
import AddIcon from "@mui/icons-material/Add";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateCalendar, LocalizationProvider } from "@mui/x-date-pickers";
import Barbers from "@/models/Barber";
import dbConnect from "@/lib/dbConnect";
import format from "date-fns/format";

const dateRegex = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;
const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

function sortByTime(a: any, b: any) {
  if (a.time > b.time) {
    return 1;
  } else if (a.time < b.time) {
    return -1;
  } else {
    return 0;
  }
}

const AdminPanelReservations = ({ permissions, workers }: any) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ open: false, id: "", text: "" });
  const [list, setList] = useState<any[]>([]);
  const [currentWorker, setCurrentWorker] = useState<string>(
    workers?.[0]?._id || ""
  );
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [time, setTime] = useState("00:00");

  useEffect(() => {
    setLoading(true);
    fetch(
      `/api/reservations/${currentWorker}/${format(currentDate, "yyyy-MM-dd")}`
    )
      .then((res) => res.json())
      .then((res) => {
        setList(res);
      })
      .catch((err) => {
        console.log(err);
        setList([]);
      })
      .finally(() => setLoading(false));
  }, [currentWorker, currentDate]);

  const handleChange = (e: SelectChangeEvent) => {
    setCurrentWorker(e.target.value);
  };

  const handleAddTime = () => {
    if (list.filter((item) => item.time === time).length === 0) {
      setLoading(true);
      fetch(
        `/api/reservations/${currentWorker}/${format(
          currentDate,
          "yyyy-MM-dd"
        )}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: "PUT",
          body: JSON.stringify({ time }),
        }
      )
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            setList((prev) => [...prev, data.item]);
          } else {
            console.log("error");
          }
        })
        .catch((err) => console.log(err))
        .finally(() => setLoading(false));
    }
  };
  return (
    <Layout perms={permissions}>
      <h1>Rezerwacje</h1>
      <form style={{ margin: "0 auto", textAlign: "center" }}>
        <FormControl
          disabled={loading}
          sx={{
            maxWidth: "280px",
            width: "100%",
            margin: "8px",
            "& > label": {
              color: blueGrey[100],
            },
            "& > div": {
              color: blueGrey[100],
            },
            "& > div > svg": {
              color: blueGrey[100],
            },
            "& > div > fieldset": {
              borderColor: blueGrey[700],
            },
          }}
        >
          <InputLabel id="select-worker-label">Pracownik</InputLabel>
          <Select
            labelId="select-worker-label"
            id="select-worker"
            value={currentWorker}
            label="Pracownik"
            onChange={handleChange}
          >
            {workers.map((worker: any) => (
              <MenuItem key={worker._id} value={worker._id}>
                {worker.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateCalendar
            disabled={loading}
            value={currentDate}
            onChange={(e: any) => setCurrentDate(e)}
            sx={{
              maxWidth: "100%",
              "& button": {
                color: blueGrey[100],
                backgroundColor: blueGrey[700],
              },
              "& button > svg": {
                color: "white",
              },
              "& button:hover": {
                backgroundColor: blueGrey[400],
              },
              "& .MuiDayCalendar-header span": {
                color: "white",
              },
              "& button.Mui-selected, & button.Mui-selected:hover": {
                backgroundColor: blueGrey[300],
              },
              "& button.Mui-disabled": {
                backgroundColor: blueGrey[700],
              },
              "& button.Mui-disabled svg": {
                color: "rgba(0, 0, 0, 0.26)",
              },
            }}
          />
        </LocalizationProvider>
        <div>
          <h2>Dodaj rezerwację</h2>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CTextField
              type="time"
              defaultValue="00:00"
              disabled={loading}
              value={time}
              onChange={(e) => {
                setTime(e.target.value);
              }}
              error={!timeRegex.test(time)}
            />
            <CLoadingButton
              loading={loading}
              disabled={loading}
              startIcon={<AddIcon />}
              loadingPosition="start"
              onClick={handleAddTime}
            >
              Dodaj
            </CLoadingButton>
          </div>
        </div>
        <h2>Lista rezerwacji</h2>
        <Box
          sx={{
            width: "100%",
            bgcolor: "rgb(45, 45, 45)",
            borderRadius: "5px",
            overflow: "hidden",
            textAlign: "center",
          }}
        >
          <List sx={{ padding: "0" }}>
            {!loading &&
              list.sort(sortByTime).map((item, i) => (
                <React.Fragment key={item.time}>
                  <ListItem
                    sx={{
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                    secondaryAction={
                      <>
                        <Tooltip title="Usuń" placement="bottom">
                          <IconButton
                            onClick={() =>
                              setData({
                                id: item.time,
                                open: true,
                                text: `Czy chcesz usunąć godzinę ${
                                  list.find((itemf) => itemf._id === item._id)!
                                    .time
                                } z dnia ${format(
                                  currentDate,
                                  "yyyy-MM-dd"
                                )} u Pracownika - ${
                                  workers.find(
                                    (item: any) => item._id === currentWorker
                                  ).name
                                }?`,
                              })
                            }
                            sx={{
                              margin: "0 5px",
                              color: "white",
                              boxShadow: "none",
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edytuj" placement="bottom">
                          <IconButton
                            LinkComponent={Link}
                            sx={{
                              margin: "0 5px",
                              color: "white",
                              boxShadow: "none",
                            }}
                            href={
                              "/admin/reservations/" +
                              currentWorker +
                              "/" +
                              format(currentDate, "yyyy-MM-dd") +
                              "/" +
                              item.time
                            }
                          >
                            <SettingsIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    }
                  >
                    <ListItemText primary={`${item.time}`} />
                  </ListItem>
                  {i + 1 !== list.length && (
                    <Divider sx={{ borderColor: "#4c4c4c" }} />
                  )}
                </React.Fragment>
              ))}
            {loading && (
              <ListItem>
                <Loading />
              </ListItem>
            )}
          </List>
        </Box>
      </form>
      <DeleteDialog
        setState={setList}
        open={data}
        id="time"
        setOpen={setData}
        url={`/api/reservations/${currentWorker}/${format(
          currentDate,
          "yyyy-MM-dd"
        )}`}
      />
    </Layout>
  );
};

export default AdminPanelReservations;

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req }) {
    const user = req.session.user;

    if (user?.isLoggedIn !== true || !user?.permissions?.reservations) {
      return {
        notFound: true,
      };
    }
    await dbConnect();
    const workers = JSON.parse(JSON.stringify(await Barbers.find({})));

    return {
      props: {
        workers,
        permissions: user?.permissions,
      },
    };
  },
  sessionOptions
);
