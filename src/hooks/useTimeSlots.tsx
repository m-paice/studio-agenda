interface Props {
  startAt?: number;
  endAt?: number;
  payload: {
    scheduleAt: string;
    averageTime: number;
  }[];
}

export interface TimeSlotsItem {
  time: string;
  schedule: boolean;
}

export function adicionarMinutos(
  horarioOriginal: string,
  minutosAdicionais: number
) {
  const partes = horarioOriginal.split(":");
  let horas: string | number = parseInt(partes[0], 10);
  let minutos: string | number = parseInt(partes[1], 10);

  minutos = minutos + minutosAdicionais;

  horas = horas + Math.floor(minutos / 60);
  minutos = minutos % 60;

  horas = horas < 10 ? "0" + horas : horas;
  minutos = minutos < 10 ? "0" + minutos : minutos;

  const novoHorario = horas + ":" + minutos;

  return novoHorario;
}

export function handleTimeSlots({ startAt = 7, endAt = 20.5, payload }: Props) {
  const startTime = startAt * 60;
  const endTime = endAt * 60;
  const interval = 30;

  const timeSlots = [];

  for (let i = startTime; i <= endTime; i += interval) {
    const hours = Math.floor(i / 60);
    const minutes = i % 60;
    const timeString = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;

    if (payload.some((item) => item.scheduleAt.includes(timeString))) {
      timeSlots.push({ time: timeString, schedule: true });

      continue;
    }

    const times = payload
      .map((item) => ({
        time: item.scheduleAt,
        count: item.averageTime ? Math.ceil(item.averageTime / interval) : null,
      }))
      .filter((item) => item.count);

    let parar = false;
    for (let x = 0; x < times.length; x++) {
      const elementX = times[x];

      for (let y = 1; y <= elementX.count! - 1; y++) {
        const check = adicionarMinutos(elementX.time, y * interval);

        if (check === timeString) {
          parar = true;
          timeSlots.push({ time: timeString, schedule: true });
          continue;
        }
      }
    }

    if (parar) continue;

    timeSlots.push({ time: timeString, schedule: false });
  }

  return {
    timeSlots,
  };
}
