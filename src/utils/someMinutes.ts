export function someMinutes(horaString: string, minutosASomar: number) {
  const hora = new Date("2000-01-01T" + horaString + ":00");

  hora.setMinutes(hora.getMinutes() + minutosASomar);

  const novaHoraString = hora.toLocaleTimeString("pt-BR", { hour12: false });

  return novaHoraString;
}
