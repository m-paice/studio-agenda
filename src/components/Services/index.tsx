import { Service } from "../../views/Home";

import "./styles.css";

interface Props {
  values: string[];
  services: Service[];
  onSelect(serviceId: string): void;
}

export function Services({ values, services, onSelect }: Props) {
  return (
    <div className="container-services">
      <p>Selecione os serviços</p>
      <ul>
        {services.map((item) => (
          <li
            key={item.id}
            className={values.includes(item.id) ? "selected" : ""}
            onClick={() => onSelect(item.id)}
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
