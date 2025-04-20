export type FetchError = {
  code: string | undefined | null;
  message: string | undefined | null;
  status?: number;
  statusText?: string;
};
