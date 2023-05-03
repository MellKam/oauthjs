export type SearchParam = string | number | boolean | SearchParamArray;
export type SearchParamArray = SearchParam[];
export type SearchParams = { [k: string]: SearchParam | undefined };

/**
 * Creates a query string from the object and skips `undefined` values.
 */
export const toQueryString = <T extends SearchParams>(obj: T): string => {
  const params = new URLSearchParams();

  for (const [name, value] of Object.entries(obj)) {
    if (typeof value !== "undefined") params.set(name, value.toString());
  }

  return params.toString();
};

export const getBasicAuthHeader = (clientId: string, clientSecret: string) => {
  return (
    "Basic " +
    ("_IS_NODE_"
      ? Buffer.from(clientId + ":" + clientSecret).toString("base64")
      : btoa(clientId + ":" + clientSecret))
  );
};
