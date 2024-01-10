import { Service } from "../views/Home";

export function calculateTotalAverageTime(services: Service[]) {
  return services.reduce(
    (total, service) => total + parseFloat(service.averageTime || "0"),
    0
  );
}
