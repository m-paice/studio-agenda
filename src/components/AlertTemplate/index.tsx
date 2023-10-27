import React from "react";
import { AlertTemplateProps } from "react-alert";

import InfoIcon from "./icons/InfoIcon";
import SuccessIcon from "./icons/SuccessIcon";
import ErrorIcon from "./icons/ErrorIcon";

const alertStyle: React.CSSProperties = {
  backgroundColor: "#151515",
  color: "white",
  padding: "10px",
  textTransform: "uppercase",
  borderRadius: "3px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  boxShadow: "0px 2px 2px 2px rgba(0, 0, 0, 0.03)",
  fontFamily: "Arial",
  width: "300px",
  boxSizing: "border-box",
};

export const AlertTemplate = ({
  message,
  options,
  style,
}: AlertTemplateProps) => {
  return (
    <div style={{ ...alertStyle, ...style }}>
      {options.type === "info" && <InfoIcon />}
      {options.type === "success" && <SuccessIcon />}
      {options.type === "error" && <ErrorIcon />}
      <span style={{ flex: 2 }}>{message}</span>
    </div>
  );
};
