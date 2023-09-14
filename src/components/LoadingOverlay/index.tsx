import "./styles.css";

interface Props {
  visible: boolean;
}

export function LoadingOverlay({ visible }: Props) {
  if (!visible) return null;

  return (
    <div className="container">
      <div className="overlay">
        <div className="wrapper">
          <p className="text">Carregando...</p>
        </div>
      </div>
    </div>
  );
}
