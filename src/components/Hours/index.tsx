import { TimeSlotsItem } from "../../hooks/useTimeSlots";

import "./styles.css";

interface Props {
  items: TimeSlotsItem[];
  value: string;
  onSelect(item: string): void;
  schedulesWithUserName: { time: string; username: string }[];
}

export function Hours({
  items,
  value,
  onSelect,
  schedulesWithUserName,
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

          return (
            <button
              key={item.time}
              type="button"
              className={
                item.schedule ? "danger" : item.time === value ? "success" : ""
              }
              onClick={() => {
                if (!item.schedule) onSelect(item.time);
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
