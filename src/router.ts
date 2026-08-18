export const messageRef: {
  current: {
    error: (text: string) => void;
    success: (text: string) => void;
  } | null;
} = {
  current: null,
};
