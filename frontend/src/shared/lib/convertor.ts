/* eslint-disable @typescript-eslint/no-unused-vars */

import { IOption } from "./options";


/* eslint-disable @typescript-eslint/no-explicit-any */
export const transformArrayToObjectByKey = <T extends Record<string, any>, K extends keyof T>(
  array: T[],
  key: K
): Record<string, Omit<T, K>> => {
  return array.reduce((acc, item) => {
    acc[String(item[key])] = item as Omit<T, K>;
    return acc;
  }, {} as Record<string, Omit<T, K>>);
};

export interface IOptions {
  label: string;
  value: string | undefined;
}

export const converToOption = (
  rawData: any,
  optionKey: string,
  optionValue: string,
  setting?: {
    includeAll?: boolean;
    allLabel?: string;
    extra?: string;
  }
): IOption[] => {
  const modifiedVals = (rawData ?? []).map((item: any) => {
    return {
      label: item[optionKey],
      value: item[optionValue],
      ...(setting?.extra && item[setting?.extra] && { [setting?.extra]: item[setting?.extra] }),
    };
  });

  return [
    ...(setting?.includeAll ? [{ label: setting?.allLabel ?? "All", value: null }] : []),
    ...modifiedVals,
  ];
};

export const flattenToDotNotation = (obj: any, parentKey = "", result: any = {}) => {
  for (const key in obj) {
    const value = obj[key];
    const newKey = parentKey ? `${parentKey}.${key}` : key;

    if (value && typeof value === "object" && !Array.isArray(value)) {
      flattenToDotNotation(value, newKey, result);
    } else {
      result[newKey] = value;
    }
  }
  return result;
};

export const exludeNullUndefinedValue = (obj: Record<any, any>) => {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([_, val]) =>
        val !== undefined && val !== null && val !== "" && val !== "undefined" && val !== "null"
    )
  );
};
