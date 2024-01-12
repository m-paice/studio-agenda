import { CSSProperties, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  format,
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  getDay,
  addDays,
} from "date-fns";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import { blue, pink } from "@mui/material/colors";
import {
  Button,
  CardContent,
  CardHeader,
  Container,
  TextField,
} from "@mui/material";

import { Header } from "../components/Header";
import { Hours } from "../components/Hours";
import { Services } from "../components/Services";
import { LoadingOverlay } from "../components/LoadingOverlay";
import { LabelError } from "../components/LabelError";
import { useRequestFindMany } from "../hooks/useRequestFindMany";
import { useRequestFindOne } from "../hooks/useRequestFindOne";
import { handleTimeSlots } from "../hooks/useTimeSlots";
import { useRequestCreate } from "../hooks/useRequestCreate";
import { transformTime } from "../hooks/useTransformTime";
import { calculateTotalAverageTime } from "../utils/calculateAverageTime";
import { maskTextCellPhone } from "../hooks/maskText";

export type DayNames =
  | "DOMINGO"
  | "SEGUNDA-FEIRA"
  | "TERÇA-FEIRA"
  | "QUARTA-FEIRA"
  | "QUINTA-FEIRA"
  | "SEXTA-FEIRA"
  | "SABADO";

export interface Account {
  id: string;
  name: string;
  config: {
    startAt: string;
    endAt: string;
    days: {
      dom: boolean;
      seg: boolean;
      ter: boolean;
      qua: boolean;
      qui: boolean;
      sex: boolean;
      sab: boolean;
    };
    weekHours: { [key: string]: string[][] };
  };
}
export interface Service {
  id: string;
  name: string;
  price: string;
  averageTime: string;
}

export interface Schedules {
  id: string;
  scheduleAt: string;
  shortName: string;
  user: { name: string };
  averageTime: number;
  status: string;
}

interface Fields {
  name: string;
  cellPhone: string;
  date: Date;
  services: Service[];
  hour: string;
}

const daysOfWeek: DayNames[] = [
  "DOMINGO",
  "SEGUNDA-FEIRA",
  "TERÇA-FEIRA",
  "QUARTA-FEIRA",
  "QUINTA-FEIRA",
  "SEXTA-FEIRA",
  "SABADO",
];

export function Home() {
  const params = useParams<{ id: string }>();

  const validationSchema = Yup.object({
    name: Yup.string().required("O campo nome é obrigatório"),
    cellPhone: Yup.string()
      .required("O campo telefone é obrigatório")
      .matches(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Formato inválido"),
    date: Yup.string().required("Selecione uma data"),
    hour: Yup.string().required("Selecione um horário"),
    services: Yup.array().min(1, "Selecione pelo menos um serviço"),
  });

  const formik = useFormik<Fields>({
    initialValues: {
      name: "",
      cellPhone: "",
      date: new Date(),
      services: [],
      hour: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      const [hour, minute] = values.hour.split(":");

      const scheduleAt = new Date(
        format(
          setMinutes(setHours(values.date, Number(hour)), Number(minute)),
          "YYY/MM/dd HH:mm:ss"
        )
      );

      const payload = {
        shortName: values.name,
        cellPhone: values.cellPhone.replace(/\D/g, ""),
        services: values.services.map((service) => ({
          id: service.id,
          isPackage: false,
        })),
        scheduleAt,
        averageTime: calculateTotalAverageTime(values.services),
      };

      execCreateSchedules(payload);
      toast.success("Agendamento realizado com sucesso");
    },
  });

  const {
    execute: execAccount,
    response: responseAccount,
    loading: loadingAccount,
  } = useRequestFindOne<Account>({
    path: "/public/account",
    id: `${params.id}/info`,
  });

  const {
    execute: execServices,
    response: responseServices,
    loading: loadingServices,
  } = useRequestFindMany<Service>({
    path: `/public/account/${params.id}/services`,
  });

  const {
    response: responseSchedules,
    loading: loadingSchedules,
    execute: execSchedules,
  } = useRequestFindMany<Schedules>({
    path: `/public/account/${params.id}/schedules`,
    defaultQuery: {
      where: {
        scheduleAt: {
          $between: [
            startOfDay(formik.values.date),
            endOfDay(formik.values.date),
          ],
        },
      },
    },
  });

  const {
    execute: execCreateSchedules,
    loading: loadingCreateSchedule,
    response: responseCreated,
  } = useRequestCreate({ path: `/public/account/${params.id}/schedules` });

  useEffect(() => {
    execServices();
    execAccount();
  }, []);

  useEffect(() => {
    execSchedules();
    if (formik.values.hour) formik.setFieldValue("hour", "");
  }, [formik.values.date]);

  useEffect(() => {
    if (responseCreated) {
      formik.resetForm();

      execSchedules();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [responseCreated]);

  const daySelected = formik?.values?.date
    ? getDay(formik.values.date)
    : getDay(new Date());

  const dayWeek: DayNames = daysOfWeek[daySelected];
  const enableDays: { [key: string]: boolean } =
    responseAccount?.config?.days || {};
  const hours = responseAccount?.config?.weekHours?.[dayWeek] || [];

  const schedulesWithUserName = (responseSchedules || [])
    .filter((item) => item.status !== "canceled")
    .map((item) => ({
      time: format(new Date(item.scheduleAt), "HH:mm"),
      username: item?.shortName || item?.user?.name || "",
    }));

  const slots = hours.map((item) => {
    const [startAt, endAt] = item;

    const startTime = transformTime({ time: startAt });
    const endTime = transformTime({ time: endAt });

    const schedulesHours = (responseSchedules || [])
      .filter((item) => item.status !== "canceled")
      .map((item) => ({
        scheduleAt: format(new Date(item.scheduleAt), "HH:mm"),
        averageTime: item.averageTime,
      }));

    const { timeSlots } = handleTimeSlots({
      payload: schedulesHours,
      startAt: startTime,
      endAt: endTime,
    });

    return timeSlots;
  });

  const timeDataSlots =
    Array.isArray(slots) && slots.length ? [...slots[0], ...slots[1]] : [];

  return (
    <Container sx={{ backgroundColor: "#003049" }}>
      <LoadingOverlay
        visible={
          loadingAccount ||
          loadingSchedules ||
          loadingServices ||
          loadingCreateSchedule
        }
      />
      <img
        style={{
          paddingBottom: 5,
          margin: "auto",
          display: "block",
          height: 60,
        }}
        src="../../public/meu-petrecho.png"
      />

      <div style={{ background: "#fff" }}>
        <CardHeader
          title="Faça seu agendamento"
          sx={{
            fontSize: 18,
            backgroundColor: pink[900],
            color: blue[50],
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        />
        <CardContent>
          <Header name={responseAccount?.name} />

          <form onSubmit={formik.handleSubmit}>
            <TextField
              label="Nome"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              color="primary"
              placeholder="Digite seu nome"
            />
            <LabelError message={formik.errors.name} />
            <TextField
              label="Telefone"
              name="cellPhone"
              value={formik.values.cellPhone}
              onChange={(event) => {
                const { value } = event.target;
                formik.setFieldValue("cellPhone", maskTextCellPhone(value));
              }}
              color="primary"
              placeholder="Digite seu telefone"
            />
            <LabelError message={formik.errors.cellPhone} />

            <div style={styles.container}>
              <div style={styles.content}>
                {Array.from({ length: 7 }).map((_, index) => {
                  const currentDay = new Date().getDay();

                  const dia =
                    currentDay + index < 7
                      ? currentDay + index
                      : currentDay + index - 7;

                  const data = format(addDays(new Date(), index), "dd");
                  const dayName = daysOfWeek[dia].slice(0, 3);

                  // if (enableDays[dayName.toLocaleLowerCase()] === false)
                  //   return null;

                  return (
                    <div
                      key={index}
                      onClick={() => {
                        if (!enableDays[dayName.toLocaleLowerCase()]) return;
                        formik.setFieldValue(
                          "date",
                          addDays(new Date(), index)
                        );
                      }}
                      style={{
                        ...styles.days,
                        color:
                          formik.values.date?.getDate() ===
                          addDays(new Date(), index).getDate()
                            ? "white"
                            : "",
                        background:
                          formik.values.date?.getDate() ===
                          addDays(new Date(), index).getDate()
                            ? "green"
                            : enableDays[dayName.toLocaleLowerCase()] === false
                            ? "red"
                            : " ",
                      }}
                    >
                      <span>{dayName}</span>
                      <span>{data}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <Hours
              items={timeDataSlots}
              value={formik.values.hour}
              onSelect={(item) => formik.setFieldValue("hour", item)}
              schedulesWithUserName={schedulesWithUserName}
            />
            <LabelError message={formik.errors.hour} />

            <Services
              values={formik.values.services}
              services={responseServices || []}
              onSelect={(service) => {
                const services = formik.values.services.some(
                  (item) => item.id === service.id
                )
                  ? formik.values.services.filter(
                      (item) => item.id !== service.id
                    )
                  : [...formik.values.services, service];
                formik.setFieldValue("services", services);
              }}
            />
            <LabelError message={formik.errors.services} />
            <Container sx={{ textAlign: "center" }}>
              <Button
                variant="contained"
                type="submit"
                disabled={loadingCreateSchedule}
                size="large"
                fullWidth
                sx={{ fontWeight: "bold", fontSize: 22 }}
              >
                Agendar
              </Button>
            </Container>
          </form>
        </CardContent>
      </div>
    </Container>
  );
}

const styles: { [key: string]: CSSProperties } = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",

    color: "#000",
  },
  content: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  days: {
    border: "1px solid",
    borderRadius: "10px",
    width: "60px",
    height: "80px",
    cursor: "pointe",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
  },
};
