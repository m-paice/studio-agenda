import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { format, startOfDay, endOfDay, setHours, setMinutes } from "date-fns";
import { useFormik, Field } from "formik";
import * as Yup from "yup";
import { useAlert } from "react-alert";

import { Header } from "../components/Header";
import { Hours } from "../components/Hours";
import { Services } from "../components/Services";
import { LoadingOverlay } from "../components/LoadingOverlay";
import { useRequestFindMany } from "../hooks/useRequestFindMany";
import { useRequestFindOne } from "../hooks/useRequestFindOne";
import { useTimeSlots } from "../hooks/useTimeSlots";
import { useRequestCreate } from "../hooks/useRequestCreate";
import { useTransformTime } from "../hooks/useTransformTime";
import { LabelError } from "../components/LabelError";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Input,
  InputLabel,
  TextField,
  FormControl,
} from "@mui/material";
import { blue, pink } from "@mui/material/colors";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

//import "dayjs/locale/ptBr"
import ptBR from "date-fns/locale/pt-BR";
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { IMaskInput } from "react-imask";

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
  };
}
export interface Service {
  id: string;
  name: string;
  price: string;
}

interface Fields {
  name: string;
  cellPhone: string;
  date: Date;
  services: string[];
  hour: string;
  onChange: (event: { target: { cellPhone: string; value: string } }) => void;
}

export function Home() {
  const params = useParams<{ id: string }>();
  const alert = useAlert();

  const validationSchema = Yup.object({
    name: Yup.string().required("O nome é obrigatório"),
    cellPhone: Yup.string().required("O telefone é obrigatório"),
    date: Yup.string().required("A data é obrigatória"),
    hour: Yup.string().required("A hora é obrigatória"),
    services: Yup.array().min(1, "Selecione pelo menos um serviço"),
  });

  const formik = useFormik<Fields>({
    initialValues: {
      name: "",
      cellPhone: "",
      date: new Date(),
      services: [],
      hour: "",
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onChange: function (event: {
        target: { cellPhone: string; value: string };
      }): void {
        throw new Error("Function not implemented.");
      },
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
        cellPhone: values.cellPhone,
        services: values.services.map((serviceId) => ({
          id: serviceId,
          isPackage: false,
        })),
        scheduleAt,
      };

      execCreateSchedules(payload);
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
  } = useRequestFindMany<{ id: string; scheduleAt: string }>({
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
      alert.success("Agendamento criado com sucesso!");
      execSchedules();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [responseCreated]);

  const startAt = useTransformTime({
    time: responseAccount?.config.startAt
      ? responseAccount?.config.startAt
      : "07:00",
  });

  const endAt = useTransformTime({
    time: responseAccount?.config.endAt
      ? responseAccount?.config.endAt
      : "20:00",
  });

  const { timeSlots } = useTimeSlots({
    payload: (responseSchedules || []).map((item) =>
      format(new Date(item.scheduleAt), "HH:mm")
    ),
    startAt,
    endAt,
  });

  const TextMaskCustom = React.forwardRef<HTMLInputElement, Fields>(
    function TextMaskCustom(props, ref) {
      const { onChange, ...other } = props;
      return (
        <IMaskInput
          {...other}
          mask="(00) 00000-0000"
          inputRef={ref}
          name="cellPhone"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onAccept={(value: any) =>
            onChange({ target: { cellPhone: props.cellPhone, value } })
          }
          overwrite
        />
      );
    }
  );

  return (
    <Container>
      <Box sx={{ paddingTop: 3, backgroundColor: "#003049" }}>
        <Box>
          <img
            style={{
              paddingBottom: 5,
              margin: "auto",
              display: "block",
            }}
            src="src/assets/meu-petrecho.png"
          />
        </Box>
        <Card>
          <LoadingOverlay
            visible={
              loadingAccount ||
              loadingSchedules ||
              loadingServices ||
              loadingCreateSchedule
            }
          />
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
                placeholder="Digite o nome"
              />
              <LabelError message={formik.errors.name} />
              <TextField
                id="formatted-cellPhone"
                name="cellPhone"
                label="Telefone"
                placeholder="Digite seu telefone"
                color="primary"
                value={formik.values.cellPhone}
                //onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                InputProps={{
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  inputComponent: TextMaskCustom as any,
                }}
              />
              <LabelError message={formik.errors.cellPhone} />

              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={ptBR}
              >
                <DemoContainer components={["DesktopDatePicker"]}>
                  <DemoItem>
                    <DesktopDatePicker
                      label="Dia do agendamento"
                      name="date"
                      value={formik.values.date}
                      //format="DD/MMMM/YYYY"
                      onChange={(date) =>
                        date && formik.setFieldValue("date", date)
                      }
                    ></DesktopDatePicker>
                  </DemoItem>
                </DemoContainer>
              </LocalizationProvider>
              <Hours
                items={timeSlots}
                value={formik.values.hour}
                onSelect={(item) => formik.setFieldValue("hour", item)}
              />
              <LabelError message={formik.errors.hour} />
              <Services
                values={formik.values.services}
                services={responseServices || []}
                onSelect={(serviceId: string) => {
                  const services = formik.values.services.includes(serviceId)
                    ? formik.values.services.filter((id) => id !== serviceId)
                    : [...formik.values.services, serviceId];
                  formik.setFieldValue("services", services);
                }}
              />
              <LabelError message={formik.errors.services} />
              <Button
                variant="contained"
                type="submit"
                disabled={loadingCreateSchedule}
              >
                Agendar
              </Button>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
