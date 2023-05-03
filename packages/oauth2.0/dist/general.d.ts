export type SearchParam = string | number | boolean | SearchParamArray;
export type SearchParamArray = SearchParam[];
export type SearchParams = {
    [k: string]: SearchParam | undefined;
};
/**
 * Creates a query string from the object and skips `undefined` values.
 */
export declare const toQueryString: <T extends SearchParams>(obj: T) => string;
export declare const getBasicAuthHeader: (clientId: string, clientSecret: string) => string;
