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
import { useFormik } from "formik";
import * as Yup from "yup";

import { Header } from "../components/Header";
import { Hours } from "../components/Hours";
import { Input } from "../components/Input";
import { Services } from "../components/Services";
import { LoadingOverlay } from "../components/LoadingOverlay";
import { useRequestFindMany } from "../hooks/useRequestFindMany";
import { useRequestFindOne } from "../hooks/useRequestFindOne";
import { handleTimeSlots } from "../hooks/useTimeSlots";
import { useRequestCreate } from "../hooks/useRequestCreate";
import { transformTime } from "../hooks/useTransformTime";
import { LabelError } from "../components/LabelError";
import { formatarTelefone } from "../utils/formatNumber";
import { calculateTotalAverageTime } from "../utils/calculateAverageTime";
import { toast } from "react-toastify";

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
    name: Yup.string().required("O nome é obrigatório"),
    cellPhone: Yup.string()
      .required("O telefone é obrigatório")
      .matches(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Formato inválido"),
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
  const hours = responseAccount?.config?.weekHours?.[dayWeek] || [];
  const enableDays: { [key: string]: boolean } =
    responseAccount?.config?.days || {};

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const telefoneFormatado = formatarTelefone(e.target.value);
    formik.setFieldValue("cellPhone", telefoneFormatado);
  };

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
          onChange={handleChange}
        />
        <LabelError message={formik.errors.cellPhone} />

        <div
          style={{ display: "flex", justifyContent: "space-between", gap: 10 }}
        >
          {Array.from({ length: 7 }).map((_, index) => {
            const currentDay = new Date().getDay();

            const dia =
              currentDay + index < 7
                ? currentDay + index
                : currentDay + index - 7;

            const data = format(addDays(new Date(), index), "dd");
            const dayName = daysOfWeek[dia].slice(0, 3);

            return (
              <div
                key={index}
                onClick={() => {
                  if (!enableDays[dayName.toLocaleLowerCase()]) return;
                  formik.setFieldValue("date", addDays(new Date(), index));
                }}
                style={{
                  ...styles.days,
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
              ? formik.values.services.filter((item) => item.id !== service.id)
              : [...formik.values.services, service];
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

const styles: { days: CSSProperties } = {
  days: {
    border: "1px solid",
    borderRadius: "10px",
    width: "45px",
    height: "80px",
    cursor: "pointe",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
  },
};
