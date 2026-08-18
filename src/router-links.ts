/**
 * Generates a link or API endpoint based on the provided name and type.
 *
 * @param name - The name of the link or API endpoint.
 * @param type - The type of the link or API endpoint. (Optional)
 * @returns The generated link or API endpoint.
 */
export const routerLinks = (name: string, type?: string) => {
  const array: {
    [selector: string]: string;
  } = {}; // 💬 generate link to here

  const apis: {
    [selector: string]: string;
  } = {}; // 💬 generate api to here

  if (type === "api") {
    return apis[name];
  } else {
    return array[name];
  }
};
