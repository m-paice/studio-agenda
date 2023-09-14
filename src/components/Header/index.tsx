import "./styles.css";

interface Props {
  name: string;
}

export function Header({ name }: Props) {
  return (
    <div className="container-header">
      <h1>{name}</h1>
      <p>Preencha o formulário abaixo para agendar seu próprio horário!</p>
    </div>
  );
}
