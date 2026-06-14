export const getPrevDay = (date: Date) => {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return d;
};

export const getNextDay = (date: Date) => {
  const d = new Date(date);
  d.setDate(d.getDate() + 1);
  return d;
};

export const isToday = (date: Date) => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export const getLocalISODate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatDate = (date: Date) => {
  return date.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const formatDateToISO = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const formatTimeToHHMM = (date: Date) => {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
};
