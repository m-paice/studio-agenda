import { FormEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { format, startOfDay, endOfDay, setHours, setMinutes } from "date-fns";

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

  const [fields, setFields] = useState<Fields>({
    name: "",
    date: new Date(),
    services: [],
    hour: "",
  });

  const {
    execute: execAccount,
    response: responseAccount,
    loading: loadingAccount,
  } = useRequestFindOne({
    path: "/public/account",
    id: `${params.id}/info`,
  });

  const {
    execute: execServices,
    response: responseServices,
    loading: loadingServices,
  } = useRequestFindMany({
    path: `/public/account/${params.id}/services`,
  });

  const {
    execute: execSchedules,
    response: responseSchedules,
    loading: loadingSchedules,
  } = useRequestFindMany({
    path: `/public/account/${params.id}/schedules`,
    defaultQuery: {
      where: {
        scheduleAt: {
          $between: [startOfDay(fields.date), endOfDay(fields.date)],
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

  useEffect(() => {
    execSchedules();
    if (fields.hour) setFields({ ...fields, hour: "" });
  }, [fields.date]);

  const handleChangeField = ({
    key,
    value,
  }: {
    key: string;
    value: string;
  }) => {
    setFields({ ...fields, [key]: value });
  };

  const handleChangeService = ({ id }: { id: string }) => {
    if (fields.services.includes(id)) {
      return setFields({
        ...fields,
        services: fields.services.filter((serviceId) => serviceId !== id),
      });
    }

    setFields({ ...fields, services: [...fields.services, id] });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const [hour, minute] = fields.hour.split(":");

    const scheduleAt = new Date(
      format(
        setMinutes(setHours(fields.date, Number(hour)), Number(minute)),
        "YYY/MM/dd HH:mm:ss"
      )
    );

    const payload = {
      shortName: fields.name,
      services: fields.services.map((serviceId) => ({
        id: serviceId,
        isPackage: false,
      })),
      scheduleAt,
    };

    execCreateSchedules(payload);
  };

  const { timeSlots } = useTimeSlots({
    payload: (responseSchedules || []).map((item) =>
      format(new Date(item.scheduleAt), "HH:mm")
    ),
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

      <form onSubmit={handleSubmit}>
        <Input
          placeholder="Digite seu nome"
          labelText="Nome"
          value={fields.name}
          onChange={(event) =>
            handleChangeField({ key: "name", value: event.target.value })
          }
        />

        <InputDate
          labelText="Dia"
          value={fields.date}
          onSelect={(date) => date && setFields({ ...fields, date })}
        />

        <Hours
          items={timeSlots}
          value={fields.hour}
          onSelect={(item) => setFields({ ...fields, hour: item })}
        />

        <Services
          values={fields.services}
          services={responseServices || []}
          onSelect={(serviceId) => handleChangeService({ id: serviceId })}
        />

        <button type="submit">Agendar</button>
      </form>
    </div>
  );
}
