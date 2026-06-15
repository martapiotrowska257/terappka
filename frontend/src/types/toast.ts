export type ToastMessageType = "success" | "error" | "warning" | "info";
export type ToastType = {
  message: string;
  type: ToastMessageType;
};
