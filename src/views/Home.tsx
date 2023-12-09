import { useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  format,
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  getDay,
} from "date-fns";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAlert } from "react-alert";

import { Header } from "../components/Header";
import { Hours } from "../components/Hours";
import { Input } from "../components/Input";
import { Services } from "../components/Services";
import { InputDate } from "../components/InputDate";
import { LoadingOverlay } from "../components/LoadingOverlay";
import { useRequestFindMany } from "../hooks/useRequestFindMany";
import { useRequestFindOne } from "../hooks/useRequestFindOne";
import { handleTimeSlots } from "../hooks/useTimeSlots";
import { useRequestCreate } from "../hooks/useRequestCreate";
import { days } from "../constants/days";
import { transformTime } from "../hooks/useTransformTime";
import { LabelError } from "../components/LabelError";

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
}

interface Fields {
  name: string;
  cellPhone: string;
  date: Date;
  services: string[];
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
  const alert = useAlert();

  const validationSchema = Yup.object({
    name: Yup.string().required("O nome é obrigatório"),
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
  } = useRequestFindMany<{
    id: string;
    scheduleAt: string;
    shortName: string;
    user: { name: string };
  }>({
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

  const daySelected = formik?.values?.date
    ? getDay(formik.values.date)
    : getDay(new Date());

  const dayWeek: DayNames = daysOfWeek[daySelected];
  const hours = responseAccount?.config?.weekHours?.[dayWeek] || [];

  const schedulesHours = (responseSchedules || []).map((item) =>
    format(new Date(item.scheduleAt), "HH:mm")
  );

  const schedulesWithUserName = (responseSchedules || []).map((item) => ({
    time: format(new Date(item.scheduleAt), "HH:mm"),
    username: item?.shortName || item?.user?.name || "",
  }));

  const slots = hours.map((item) => {
    const [startAt, endAt] = item;

    const startTime = transformTime({ time: startAt });
    const endTime = transformTime({ time: endAt });

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
    <div>
      <LoadingOverlay
        visible={
          loadingAccount ||
          loadingSchedules ||
          loadingServices ||
          loadingCreateSchedule
        }
      />
      <Header name={responseAccount?.name} />

      <form onSubmit={formik.handleSubmit}>
        <Input
          placeholder="Digite seu nome"
          labelText="Nome"
          name="name"
          value={formik.values.name}
          onChange={formik.handleChange}
        />
        <LabelError message={formik.errors.name} />

        <Input
          placeholder="Digite seu telefone"
          labelText="Telefone"
          name="cellPhone"
          value={formik.values.cellPhone}
          onChange={formik.handleChange}
        />

        <InputDate
          labelText="Dia"
          name="date"
          value={formik.values.date}
          onSelect={(date) => date && formik.setFieldValue("date", date)}
          disable={
            responseAccount?.config.days
              ? Object.entries(responseAccount?.config.days)
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  .filter(([_, value]) => Boolean(value))
                  .map(([key]) => days[key])
              : []
          }
        />

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
          onSelect={(serviceId: string) => {
            const services = formik.values.services.includes(serviceId)
              ? formik.values.services.filter((id) => id !== serviceId)
              : [...formik.values.services, serviceId];
            formik.setFieldValue("services", services);
          }}
        />
        <LabelError message={formik.errors.services} />

        <button className="full" type="submit" disabled={loadingCreateSchedule}>
          Agendar
        </button>
      </form>
    </div>
  );
}
