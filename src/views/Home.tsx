import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  format,
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  getDay,
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
import { useRequestDestroy } from "../hooks/useRequestDestroy";
import { transformTime } from "../hooks/useTransformTime";
import { maskTextCellPhone } from "../hooks/maskText";
import { calculateTotalAverageTime } from "../utils/calculateAverageTime";
import type {
  Account,
  DayNames,
  Fields,
  Schedules,
  Service,
} from "../types/home";
import { Days } from "../components/Days";
import { Modal } from "../components/Modal";
import { useToggle } from "../hooks/useToggle";

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

  const { toggle, onChangeToggle } = useToggle();

  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

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
      name: localStorage.getItem("name") ?? "",
      cellPhone: localStorage.getItem("cellPhone") ?? "",
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

      if (
        !localStorage.getItem("cellPhone") ||
        localStorage.getItem("cellPhone") !== values.cellPhone
      ) {
        onChangeToggle();
        localStorage.setItem("name", values.name);
        localStorage.setItem("cellPhone", values.cellPhone);
      }
    },
  });

  const handleResetLocal = () => {
    localStorage.removeItem("name");
    localStorage.removeItem("cellPhone");

    onChangeToggle();
  };

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
      ...(localStorage.getItem("cellPhone") && {
        me: localStorage.getItem("cellPhone").replace(/\D/g, ""),
      }),
    },
  });

  const {
    execute: execCreateSchedules,
    loading: loadingCreateSchedule,
    response: responseCreated,
  } = useRequestCreate({ path: `/public/account/${params.id}/schedules` });

  const { execute: destroy } = useRequestDestroy<Schedules>({
    path: ` /schedule/cancel/${params.id}`,
    callbackSucess: () => {
      toast.success("Agendamento cancelado com sucesso");
      setIsOpenModal(false);
    },
  });

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
      cellPhone: item.user.cellPhone,
      id: item.id,
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

  const handleConfirmCancellation = (id: string) => {
    console.log("Confirmar cancelamento de agendamento");
    destroy(id);
  };

  const handleCancelCancellation = () => {
    setIsOpenModal(false);
  };

  return (
    <div style={{ backgroundColor: "#003049" }}>
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
        src="/meu-petrecho.png"
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

            <Days
              daysOfWeek={daysOfWeek}
              enableDays={enableDays}
              formik={formik}
            />

            <Hours
              items={timeDataSlots}
              value={formik.values.hour}
              onSelect={(item) => formik.setFieldValue("hour", item)}
              schedulesWithUserName={schedulesWithUserName}
              daySelected={formik.values.date}
              setIsModalOpen={setIsOpenModal}
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

      <Modal
        title="Agendamento realizado com sucesso!"
        subTitle="Deseja salvar esse nome e telefone para reutilizar novamente ?"
        isActive={toggle}
        handleCancel={handleResetLocal}
        handleConfirm={onChangeToggle}
      />

      {isOpenModal && (
        <Modal
          title="Cancelamento de agendamento"
          subTitle="Deseja cancelar esse agendamento?"
          isActive={setIsOpenModal}
          handleCancel={handleCancelCancellation}
          handleConfirm={() => {}}
        />
      )}
    </div>
  );
}
