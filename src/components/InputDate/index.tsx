import DatePicker from "react-datepicker";
import ptBR from "date-fns/locale/pt-BR";

import "./styles.css";

interface Props {
  labelText: string;
  value: Date;
  disable?: number[];
  onSelect: (date: Date | null) => void;
}

export function InputDate({
  labelText,
  value,
  disable = [0, 2], // domingo e terça
  onSelect,
}: Props) {
  const isTuesday = (date: Date) => {
    return disable.includes(date.getDay());
  };

  return (
    <div className="container-input-date">
      <label>{labelText}</label>
      <DatePicker
        dateFormat="dd/MMMM/YYY"
        selected={value}
        onChange={(date) => onSelect(date)}
        filterDate={isTuesday}
        locale={ptBR}
      />
    </div>
  );
}
