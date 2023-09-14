import { TimeSlotsItem } from "../../hooks/useTimeSlots";

import "./styles.css";

interface Props {
  items: TimeSlotsItem[];
  value: string;
  onSelect(item: string): void;
}

export function Hours({ items, value, onSelect }: Props) {
  return (
    <div className="container-hour">
      <p>
        Horários disponíveis{" "}
        <span>
          (os horários disponíveis são de acordo com o dia selecionado)
        </span>
      </p>
      <div className="wrapper-hour">
        {items.map((item) => (
          <button
            key={item.time}
            type="button"
            className={
              item.schedule ? "danger" : item.time === value ? "success" : ""
            }
            onClick={() => onSelect(item.time)}
          >
            {item.time}
          </button>
        ))}
      </div>
    </div>
  );
}
