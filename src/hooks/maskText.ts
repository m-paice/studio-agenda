import { mask, unMask } from "remask";

export const maskTextCellPhone = (value) => {
  return mask(unMask(value), ["(99) 99999-9999"]);
};

export const maskTextCPF = (value) => {
  return mask(unMask(value), ["999.999.999-99"]);
};
