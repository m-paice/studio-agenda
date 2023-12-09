import { Service } from "../../views/Home";

import "./styles.css";

interface Props {
  values: Service[];
  services: Service[];
  onSelect(service: Service): void;
}

export function Services({ values, services, onSelect }: Props) {
  return (
    <div className="container-services">
      <p>Selecione os serviços</p>
      <ul>
        {services.map((item) => (
          <li
            key={item.id}
            className={
              values.some((value) => value.id === item.id) ? "selected" : ""
            }
            onClick={() => onSelect(item)}
          >
            <span>{item.name}</span>
            <span>
              {Number(item.price).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
