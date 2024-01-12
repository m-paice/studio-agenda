import { mask, unMask } from "remask";

export const maskTextCellPhone = (value: string) => {
  return mask(unMask(value), ["(99) 99999-9999"]);
};

export const maskTextCPF = (value: string) => {
  return mask(unMask(value), ["999.999.999-99"]);
};
