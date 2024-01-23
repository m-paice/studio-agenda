export function isCurrentTimeBefore(desiredTime: string) {
  const now = new Date();

  const hours = now.getHours();
  const minutes = now.getMinutes();

  const currentTime = hours + ":" + (minutes < 10 ? "0" : "") + minutes;

  const currentTimeObject = new Date("2000-01-01 " + currentTime);
  const desiredTimeObject = new Date("2000-01-01 " + desiredTime);

  return currentTimeObject < desiredTimeObject;
}
