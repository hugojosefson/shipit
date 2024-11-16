import * as colors from "@std/fmt/colors";

export const logHeader: typeof console.log = (msg: string, ...args) => {
  console.log(colors.cyan(colors.bold(`► ${msg}`)), ...args);
};
