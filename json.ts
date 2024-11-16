import {
  applyEdits,
  findNodeAtLocation,
  getNodeValue,
  type JSONPath,
  type ModificationOptions,
  modify,
  type Node,
  parseTree,
} from "jsonc-parser";

const MODIFICATION_OPTIONS: ModificationOptions = {
  formattingOptions: {
    insertSpaces: true,
    tabSize: 2,
  },
};

/**
 * Set the value at the given JSON path in the given JSON or JSONC string.
 * @param jsonc JSON or JSONC string to modify.
 * @param jsonPath JSON path to the value to set.
 * @param value Value to set.
 * @returns New JSON or JSONC string with the value set.
 */
export function setValueInJson<V>(
  jsonc: string,
  jsonPath: JSONPath,
  value: V,
): string {
  const edits = modify(jsonc, jsonPath, value, MODIFICATION_OPTIONS);
  return applyEdits(jsonc, edits);
}

/**
 * Set the value at the given JSON path in the given JSON or JSONC file.
 * @param filePath Path to the JSON or JSONC file to modify.
 * @param jsonPath JSON path to the value to set.
 * @param value Value to set.
 * @returns Promise that resolves when the value is set.
 */
export async function setValueInJsonFile<V>(
  filePath: string,
  jsonPath: JSONPath,
  value: V,
): Promise<void> {
  const jsonc = await Deno.readTextFile(filePath);
  const newJsonc = setValueInJson(jsonc, jsonPath, value);
  await Deno.writeTextFile(filePath, newJsonc);
}

/**
 * Get the value at the given JSON path in the given JSON or JSONC string.
 * @param jsonc JSON or JSONC string to get the value from.
 * @param jsonPath JSON path to the value to get.
 * @param defaultValue Default value to return if the value is not found.
 * @returns Value at the given JSON path in the given JSON or JSONC string.
 */
export function getValueInJson<V>(
  jsonc: string,
  jsonPath: JSONPath,
  defaultValue: V | undefined = undefined,
): V | undefined {
  const tree: Node | undefined = parseTree(jsonc);
  if (tree === undefined) {
    return defaultValue;
  }
  const value: Node | undefined = findNodeAtLocation(tree, jsonPath);
  if (value === undefined) {
    return defaultValue;
  }
  return getNodeValue(value);
}

/**
 * Get the value at the given JSON path in the given JSON or JSONC file.
 * @param filePath Path to the JSON or JSONC file to get the value from.
 * @param jsonPath JSON path to the value to get.
 * @param defaultValue Default value to return if the file or the value is not
 * found.
 * @returns Promise that resolves to the value at the given JSON path in the
 * given JSON or JSONC file.
 */
export async function getValueInJsonFile<V>(
  filePath: string,
  jsonPath: JSONPath,
  defaultValue: V | undefined = undefined,
): Promise<V | undefined> {
  const jsonc = await Deno.readTextFile(filePath);
  return getValueInJson(jsonc, jsonPath, defaultValue);
}

/**
 * Get the version from the given `deno.json` or `deno.jsonc` file.
 * @param filePath Path to the `deno.json` or `deno.jsonc` file to get the
 * version from.
 * @returns Promise that resolves to the version from the given `deno.json` or
 * `deno.jsonc` file.
 */
export async function getVersionInDenoJsonFile<V>(
  filePath: string,
): Promise<V | undefined> {
  return await getValueInJsonFile<V>(
    filePath,
    ["version"],
  );
}

/**
 * Set the version in the given `deno.json` or `deno.jsonc` file.
 * @param filePath Path to the `deno.json` or `deno.jsonc` file to set the
 * version in.
 * @param version Version to set.
 * @returns Promise that resolves when the version is set.
 */
export async function setVersionInDenoJsonFile(
  filePath: string,
  version: string,
): Promise<void> {
  await setValueInJsonFile<string>(
    filePath,
    ["version"],
    version,
  );
}
