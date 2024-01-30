import { CSSProperties } from "react";

interface Props {
  title: string;
  subTitle: string;
  isActive: boolean;
  handleCancel: () => void;
  handleConfirm: () => void;
}

export function Modal({
  title,
  subTitle,
  handleCancel,
  handleConfirm,
  isActive,
}: Props) {
  if (!isActive) return null;

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <h4 style={styles.title}>{title}</h4>
        <p>{subTitle}</p>
        <div style={styles.wrapperButton}>
          <button
            onClick={handleCancel}
            style={{ ...styles.button, backgroundColor: "red" }}
          >
            Não
          </button>
          <button
            onClick={handleConfirm}
            style={{ ...styles.button, backgroundColor: "green" }}
          >
            Sim
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: CSSProperties } = {
  container: {
    position: "fixed",
    top: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0, 0.5)",

    width: "100%",
    height: "100vh",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  wrapper: {
    width: "100%",
    maxWidth: 500,
    padding: 24,
    backgroundColor: "#fff",
    borderRadius: 10,
    margin: "0 15px",
  },

  title: {
    color: "#000",
  },

  wrapperButton: {
    display: "flex",
    alignItems: "center",
    gap: 20,
  },
  button: {
    width: "100%",
    height: 45,
  },
};
