import { useState } from "react";

export const useValidateRequiredFields = ({ fields = [] }) => {
  const [errors, setErrors] = useState(
    fields.reduce((acc, cur) => {
      return {
        ...acc,
        [cur]: false,
      };
    }, {})
  );

  const validate = (values: { [key: string]: string }) => {
    const validate = fields.filter((item) => {
      if (Array.isArray(values[item]) && !values[item].length) return true;

      return !values[item];
    });

    if (validate.length) {
      setErrors(validate.reduce((acc, cur) => ({ ...acc, [cur]: true }), {}));
    } else {
      setErrors(
        fields.reduce((acc, cur) => {
          return {
            ...acc,
            [cur]: false,
          };
        }, {})
      );
    }
  };

  return {
    validate,
    errors,
  };
};
