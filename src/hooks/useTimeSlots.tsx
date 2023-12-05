interface Props {
  startAt?: number;
  endAt?: number;
  payload: string[];
}

export interface TimeSlotsItem {
  time: string;
  schedule: boolean;
}

export function handleTimeSlots({ startAt = 7, endAt = 20.5, payload }: Props) {
  const startTime = startAt * 60;
  const endTime = endAt * 60;
  const interval = 30;

  const timeSlots: TimeSlotsItem[] = [];

  for (let i = startTime; i <= endTime; i += interval) {
    const hours = Math.floor(i / 60);
    const minutes = i % 60;
    const timeString = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;

    if (payload.includes(timeString)) {
      timeSlots.push({ time: timeString, schedule: true });

      continue;
    }

    timeSlots.push({ time: timeString, schedule: false });
  }

  return {
    timeSlots,
  };
}
