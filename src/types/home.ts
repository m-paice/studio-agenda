export type DayNames =
  | "DOMINGO"
  | "SEGUNDA-FEIRA"
  | "TERÇA-FEIRA"
  | "QUARTA-FEIRA"
  | "QUINTA-FEIRA"
  | "SEXTA-FEIRA"
  | "SABADO";

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
    weekHours: { [key: string]: string[][] };
  };
}
export interface Service {
  id: string;
  name: string;
  price: string;
  averageTime: string;
}

export interface Schedules {
  id: string;
  scheduleAt: string;
  shortName: string;
  user: { name: string; cellPhone: string };
  averageTime: number;
  status: string;
}

export interface Fields {
  name: string;
  cellPhone: string;
  date: Date;
  services: Service[];
  hour: string;
}
