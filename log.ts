import { colors } from "./deps.ts";

export const logHeader: typeof console.log = (msg: string) => {
  console.log(colors.cyan(colors.bold(`► ${msg}`)));
};
