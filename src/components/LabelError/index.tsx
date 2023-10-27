import "./index.css";

interface Props {
  message: string | string[] | Date | undefined;
}

export function LabelError({ message }: Props) {
  if (!message) return null;

  return <span className="message-error">{message.toString()}</span>;
}
