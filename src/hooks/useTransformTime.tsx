interface Props {
  time: string;
}

export const transformTime = ({ time }: Props) => {
  const parts = time.split(":");
  const horas = parseInt(parts[0], 10);
  const minutos = parseInt(parts[1], 10);

  return horas + minutos / 60;
};
