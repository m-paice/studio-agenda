import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { format, startOfDay, endOfDay, setHours, setMinutes } from "date-fns";
import { useFormik } from "formik";
import * as Yup from "yup";

import { Header } from "../components/Header";
import { Hours } from "../components/Hours";
import { Input } from "../components/Input";
import { Services } from "../components/Services";
import { InputDate } from "../components/InputDate";
import { LoadingOverlay } from "../components/LoadingOverlay";
import { useRequestFindMany } from "../hooks/useRequestFindMany";
import { useRequestFindOne } from "../hooks/useRequestFindOne";
import { useTimeSlots } from "../hooks/useTimeSlots";
import { useRequestCreate } from "../hooks/useRequestCreate";
import { days } from "../constants/days";
import { useTransformTime } from "../hooks/useTransformTime";

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
  date: Date;
  services: string[];
  hour: string;
}

export function Home() {
  const params = useParams<{ id: string }>();

  const validationSchema = Yup.object({
    name: Yup.string().required("O nome é obrigatório"),
    date: Yup.date().required("A data é obrigatória"),
    hour: Yup.string().required("A hora é obrigatória"),
    services: Yup.array().min(1, "Selecione pelo menos um serviço"),
  });

  const formik = useFormik<Fields>({
    initialValues: {
      name: "",
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

  const { response: responseSchedules, loading: loadingSchedules } =
    useRequestFindMany<{ id: string; scheduleAt: string }>({
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

  const { execute: execCreateSchedules, loading: loadingCreateSchedule } =
    useRequestCreate({ path: `/public/account/${params.id}/schedules` });

  useEffect(() => {
    execServices();
    execAccount();
  }, []);

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
          items={timeSlots}
          value={formik.values.hour}
          onSelect={(item) => formik.setFieldValue("hour", item)}
        />

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

        <button type="submit">Agendar</button>
      </form>
    </div>
  );
}
