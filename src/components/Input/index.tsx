import "./styles.css";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  labelText: string;
  value: string;
}

export function Input({ labelText, value, ...props }: Props) {
  return (
    <div className="container-input">
      <label>{labelText}</label>
      <input value={value} {...props} />
    </div>
  );
}
