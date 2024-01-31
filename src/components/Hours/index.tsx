import { TimeSlotsItem } from "../../hooks/useTimeSlots";
import { isCurrentTimeBefore } from "../../utils/currentTimeBefore";

import "./styles.css";

interface Props {
  items: TimeSlotsItem[];
  value: string;
  onSelect(item: string): void;
  schedulesWithUserName: {
    time: string;
    username: string;
    cellPhone: string;
    id: string;
  }[];
  daySelected: Date;
  handleOpenMeSchedule: (id: string) => void;
}

export function Hours({
  items,
  value,
  onSelect,
  schedulesWithUserName,
  daySelected,
  handleOpenMeSchedule,
}: Props) {
  return (
    <div className="container-hour">
      <p>
        Horários disponíveis{" "}
        <span>
          (os horários disponíveis são de acordo com o dia selecionado)
        </span>
      </p>
      <div className="wrapper-hour">
        {items.map((item) => {
          const schedule = schedulesWithUserName.find(
            (scheduleItem) => scheduleItem.time === item.time
          );

          const [firstName, lastName] = schedule
            ? schedule.username.split(" ")
            : ["", ""];

          const meSchedule = localStorage.getItem("cellPhone")
            ? localStorage.getItem("cellPhone").replace(/\D/g, "") ===
              schedule?.cellPhone
            : false;

          const result =
            daySelected > new Date() ? true : isCurrentTimeBefore(item.time);

          return (
            <button
              key={item.time}
              type="button"
              className={
                meSchedule
                  ? "meSchedule"
                  : item.schedule
                  ? "danger"
                  : item.time === value
                  ? "success"
                  : !result
                  ? "notScheduled"
                  : ""
              }
              onClick={() => {
                if (!item.schedule && result) onSelect(item.time);
                if (meSchedule && schedule?.id) {
                  // e verificar se o horario é antes do horario atual
                  handleOpenMeSchedule(schedule?.id);
                }
              }}
              style={{ fontSize: 18 }}
            >
              {item.time} <br />{" "}
              <span style={{ fontSize: 14 }}>
                {firstName} {(lastName || "").slice(0, 1).toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
