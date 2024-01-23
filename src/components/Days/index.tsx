import { CSSProperties } from "react";
import { addDays, format } from "date-fns";
import { DayNames, Fields } from "../../types/home";
import { FormikProps } from "formik";

interface Props {
  daysOfWeek: DayNames[];
  enableDays: {
    [key: string]: boolean;
  };
  formik: FormikProps<Fields>;
}

export function Days({ daysOfWeek, enableDays, formik }: Props) {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {Array.from({ length: 7 }).map((_, index) => {
          const currentDay = new Date().getDay();

          const dia =
            currentDay + index < 7
              ? currentDay + index
              : currentDay + index - 7;

          const data = format(addDays(new Date(), index), "dd");
          const dayName = daysOfWeek[dia].slice(0, 3);

          // if (enableDays[dayName.toLocaleLowerCase()] === false)
          //   return null;

          return (
            <div
              key={index}
              onClick={() => {
                if (!enableDays[dayName.toLocaleLowerCase()]) return;
                formik.setFieldValue("date", addDays(new Date(), index));
              }}
              style={{
                ...styles.days,
                color:
                  formik.values.date?.getDate() ===
                  addDays(new Date(), index).getDate()
                    ? "white"
                    : enableDays[dayName.toLocaleLowerCase()] === false
                    ? "white"
                    : "",
                background:
                  formik.values.date?.getDate() ===
                  addDays(new Date(), index).getDate()
                    ? "green"
                    : enableDays[dayName.toLocaleLowerCase()] === false
                    ? "red"
                    : " ",
              }}
            >
              <span>{dayName}</span>
              <span>{data}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles: { [key: string]: CSSProperties } = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",

    color: "#000",
  },
  content: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  days: {
    border: "1px solid",
    borderRadius: "10px",
    width: "60px",
    height: "80px",
    cursor: "pointe",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
  },
};
