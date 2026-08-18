import type { MessageInstance } from "antd/es/message/interface";

export let message: MessageInstance;

export const setRouterMessage = (instance: MessageInstance) => {
  message = instance;
};
