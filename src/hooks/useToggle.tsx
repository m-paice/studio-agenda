import { useState } from "react";

export const useToggle = () => {
  const [toggle, setToggle] = useState(false);

  const handleChangeToggle = () => setToggle(!toggle);

  return {
    toggle,
    onChangeToggle: handleChangeToggle,
  };
};
