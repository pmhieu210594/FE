import dayjs, { type Dayjs } from "dayjs";
import queryString from "query-string";

import { ETypeChart } from "@/enums";
import type { IPaginationQuery } from "@/interfaces";
import { KEY_TOKEN, LINK_API } from "./variable";

export * from "./api";
export * from "./number-format";
export * from "./reportWebVitals";
export * from "./variable";

/**
 * Handles the formatting of parameters.
 *
 * @param save - A boolean indicating whether to save the parameters.
 * @returns The formatted parameters.
 */
export const formatParams = ({
  save = true,
  defaultParams = {},
}: {
  save?: boolean;
  defaultParams?: IPaginationQuery;
}) => {
  const search = location.hash.split("?");
  if (save && search.length > 1 && location.hash.includes("="))
    defaultParams = {
      ...defaultParams,
      ...queryString.parse(`?${search.at(-1)}`, { arrayFormat: "index" }),
    };

  if (defaultParams.sort && typeof defaultParams.sort === "string")
    defaultParams.sort = {
      [defaultParams.sort.split(",")[0]]: defaultParams.sort.split(",")[1],
    };
  return Object.keys(defaultParams).length === 0 ? null : defaultParams;
};

/**
 * Recursively loops through the children of an item and applies a flatMap operation.
 * @param {Object} options - The options for the loop and flatMap operation.
 * @param {any} options.item - The item to start the loop from.
 * @param {string} [options.keyChildren='children'] - The key for the children property in the item.
 * @param {number} [options.level=1] - The current level of the item in the hierarchy.
 * @returns {any} - The modified item with updated level and hidden properties.
 */
export const loopFlatMapChildren = ({
  item,
  keyChildren = "children",
  level = 1,
}: any) => {
  item.level = level;
  item.hidden = level > 1;
  if (item[keyChildren])
    return [
      item,
      ...item[keyChildren].flatMap((child: any) =>
        loopFlatMapChildren({ item: child, keyChildren, level: level + 1 }),
      ),
    ];
  return item;
};
/**
 * Recursively loops through the children of an item and performs operations on each child.
 * @param item - The item to loop through its children.
 * @param keyChildren - The key used to access the children array in the item object.
 * @param id - The key used to assign an id to each item.
 * @returns The modified item after looping through its children.
 */
export const loopMapChildren = ({
  item,
  keyChildren = "children",
  id,
}: any) => {
  if (item[keyChildren])
    item.children = item[keyChildren].length
      ? item[keyChildren].map((child: any) =>
          loopMapChildren({ item: child, keyChildren, id }),
        )
      : null;
  if (id) item.id = item[id];
  item.key = item?.id || uuidv4();
  return item;
};

/**
 * Removes null, undefined, empty string, and empty object properties from the given object.
 * @param obj - The object to clean.
 * @returns The cleaned object.
 */
export const cleanObjectKeyNull = (obj: { [selector: string]: any }) => {
  for (const propName in obj) {
    if (Object.hasOwn(obj, propName)) {
      if (
        obj[propName] === null ||
        obj[propName] === undefined ||
        obj[propName] === "" ||
        (typeof obj[propName] === "object" &&
          Object.keys(obj[propName]).length === 0)
      ) {
        delete obj[propName];
      } else if (typeof obj[propName] === "object") {
        const keys = Object.keys(obj[propName]);
        let check = true;
        keys.forEach((key: string) => {
          if (check && obj[propName][key] !== undefined) {
            check = false;
          }
        });
        if (check) {
          delete obj[propName];
        }
      }
    }
  }
  return obj;
};

/**
 * Calculates the number of pages based on the height of the document body.
 *
 * @param height - The height of each page in pixels. Default is 39.
 * @param minusNumber - The number to subtract from the calculated page count. Default is 2.
 * @returns The number of pages based on the height of the document body.
 */
export const getSizePageByHeight = (height = 39, minusNumber = 2) =>
  Math.floor(
    (document.body.getBoundingClientRect().height -
      document.getElementsByTagName("tbody")[0].getBoundingClientRect().top) /
      height,
  ) - minusNumber;
/**
 * Retrieves a filter value from query parameters.
 *
 * @param queryParams - The query parameters as a JSON string. Defaults to '{}'.
 * @param key - The key of the filter value to retrieve. Defaults to 'id'.
 * @returns The filter value corresponding to the provided key, or null if not found.
 */
export const getFilter = (queryParams = "{}", key = "id") =>
  JSON.parse(JSON.parse(queryParams || "{}").filter || "{}")[key] || null;

/**
 * Removes duplicate elements from an array.
 * If a key is provided, it checks for duplicates based on the value of the specified key.
 * If no key is provided, it checks for duplicates based on the entire object.
 *
 * @param array - The array to remove duplicates from.
 * @param key - The key to check for duplicates (optional).
 * @returns A new array with duplicate elements removed.
 */
export const arrayUnique = (array: any, key?: string) => {
  const a = array.concat();
  for (let i = 0; i < a.length; ++i) {
    for (let j = i + 1; j < a.length; ++j) {
      if (
        (key && a[i][key] === a[j][key]) ||
        JSON.stringify(a[i]) === JSON.stringify(a[j])
      ) {
        a.splice(j, 1);
      }
    }
  }
  return a;
};

/**
 * Downloads a CSV file from the specified URL.
 *
 * @param url - The URL of the CSV file to download.
 * @param name - The name of the downloaded file (default: 'file-csv').
 * @returns A Promise that resolves when the download is complete.
 */
export const handleDownloadCSV = async (
  url: string,
  name: string = "file-csv",
) => {
  const res = await fetch(LINK_API + url, {
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      authorization: "Bearer " + (localStorage.getItem(KEY_TOKEN) ?? ""),
      "Accept-Language": localStorage.getItem("i18nextLng") ?? "",
    },
    redirect: "follow",
    referrerPolicy: "no-referrer",
  });
  if (res.status < 300) {
    const text = await res.text();
    const link = globalThis.document.createElement("a");
    link.setAttribute(
      "href",
      "data:text/csv;charset=utf-8,%EF%BB%BF" + encodeURI(text),
    );
    link.setAttribute("download", name + ".csv");
    link.click();
  }
};

/**
 * Converts a File object to a base64 string.
 *
 * @param file - The File object to convert.
 * @returns A Promise that resolves to the base64 string representation of the file.
 */
export const handleGetBase64 = async (file: File) =>
  await new Promise((resolve) => {
    const fileReader = new FileReader();
    fileReader.onload = () => resolve(fileReader.result);
    fileReader.readAsDataURL(file);
  });
/**
 * Moves an element within an array from the old index to the new index.
 *
 * @param arr - The array to modify.
 * @param old_index - The index of the element to move.
 * @param new_index - The new index where the element should be moved to.
 * @returns The modified array with the element moved.
 */
export const arrayMove = (arr: any[], old_index: number, new_index: number) => {
  if (new_index >= arr.length) {
    let k = new_index - arr.length + 1;
    while (k--) {
      arr.push(undefined);
    }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
  return arr.filter((item) => !!item);
};
/**
 * Generates a version 4 UUID (Universally Unique Identifier).
 *
 * @returns {string} The generated UUID.
 */
export const uuidv4 = () => {
  let d = Date.now(); //Timestamp
  let d2 =
    (typeof performance !== "undefined" &&
      performance.now &&
      performance.now() * 1000) ||
    0; //Time in microseconds since page-load or 0 if unsupported
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replaceAll(
    /[xy]/g,
    function (c) {
      let r = Math.random() * 16; //random number between 0 and 16
      if (d > 0) {
        //Use timestamp until depleted
        r = Math.trunc((d + r) % 16);
        d = Math.floor(d / 16);
      } else {
        //Use microseconds since page-load if supported
        r = Math.trunc((d2 + r) % 16);
        d2 = Math.floor(d2 / 16);
      }
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    },
  );
};

/**
 * Checks if a given string is numeric.
 *
 * @param str - The string to check.
 * @returns `true` if the string is numeric, `false` otherwise.
 */
export const isNumeric = (str: string) => {
  return !Number.isNaN(Number(str)) && !Number.isNaN(Number.parseFloat(str));
};
/**
 * Searches a tree-like structure for an item with a specific value in a given key.
 * @param array - The array representing the tree structure.
 * @param value - The value to search for.
 * @param key - The key to compare the value against in each item.
 * @returns The first item found with the specified value in the specified key, or null if not found.
 */
export const searchTree = ({
  array,
  value,
  key = "",
}: {
  array: any;
  value?: string;
  key?: string;
}): any => {
  let result: any = null;
  if (array?.length)
    array.forEach((item: any) => {
      if (!result) {
        if (item[key] == value) {
          result = item;
        } else if (item.children != null) {
          result = searchTree({ array: item.children, value, key });
        }
      }
    });
  return result;
};
/**
 * Maps a tree object to a new object with modified properties.
 *
 * @param item - The tree object to be mapped.
 * @returns The mapped object.
 */
export const mapTreeObject = (item: any): any => {
  return {
    ...item,
    title: item?.title ?? item?.name,
    key: item?.code ?? item?.id,
    value: item?.code ?? item?.id,
    isLeaf: !item?.children?.length,
    expanded: true,
    children: item?.children
      ? item?.children?.map((i: any) => mapTreeObject(i))
      : null,
  };
};
/**
 * Calculates the width of a given text string.
 *
 * @param text - The text string to calculate the width for.
 * @param fontProp - The font property to apply to the text.
 * @returns The width of the text string in pixels.
 */
export const textWidth = (text?: string, fontProp?: string) => {
  if (text) {
    const tag = document.createElement("div");
    tag.style.position = "absolute";
    tag.style.left = "-999em";
    tag.style.whiteSpace = "nowrap";
    if (fontProp) tag.style.font = fontProp;
    tag.innerHTML = text;
    document.body.appendChild(tag);
    const result = tag.clientWidth;
    tag.remove();
    return result;
  }
  return 0;
};
/**
 * Returns the longest text in an array of strings.
 *
 * @param arr - The array of strings.
 * @returns The longest text in the array.
 */
export const getLongTextInArray = (arr: string[]) =>
  arr.reduce((a: string, b) => (a.length > b.length ? a : b), "");
/**
 * Reorders an array by moving an element from one index to another.
 *
 * @param list - The array to be reordered.
 * @param startIndex - The index of the element to be moved.
 * @param endIndex - The index where the element should be moved to.
 * @returns The reordered array.
 */
export const reorderArray = (list: any[], startIndex: any, endIndex: any) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};
/**
 * Sorts two objects based on a specified property.
 * @param {Object} options - The options for sorting.
 * @param {any} options.left - The left object to compare.
 * @param {any} options.right - The right object to compare.
 * @param {string} [options.name] - The name of the property to compare. (optional)
 * @returns {number} - Returns -1 if left is less than right, 1 if left is greater than right, or 0 if they are equal.
 */
export const sortObject = ({
  left,
  right,
  name,
}: {
  left: any;
  right: any;
  name?: string;
}) => {
  if (name !== undefined) {
    if (left[name] < right[name]) return -1;
    else if (left[name] > right[name]) return 1;
  }
  return 0;
};
/**
 * Converts a CSS string into an object representation.
 *
 * @param styles - The CSS string to convert.
 * @returns An object representing the CSS styles.
 */
export const cssInObject = (styles: string) =>
  styles
    ? styles
        .trim()
        .split(";")
        .map((cur) =>
          cur
            .trim()
            .split(":")
            .map((i) => i.trim()),
        )
        .filter((i) => i.length === 2)
        .reduce((acc: any, val) => {
          const [key, value] = val;
          const newKey = key.replaceAll(/-./g, (css) => css.toUpperCase()[1]);
          acc[newKey] = value;
          return acc;
        }, {})
    : {};
/**
 * Formats data for a chart.
 *
 * @param obj - The data object.
 * @param title - The title of the chart.
 * @param level - The level of the data.
 * @param list - The list of fields to include in the chart.
 * @param type - The type of chart.
 * @returns An object containing the formatted data for the chart.
 */
export const formatDataChart = ({
  obj,
  title,
  level = 1,
  list,
  type = ETypeChart.pie,
}: {
  obj: any;
  title: string;
  level?: number;
  list?: string[];
  type: ETypeChart;
}) => {
  const listXy = new Set([ETypeChart.scatter, ETypeChart.bubble]);
  const listNumber = new Set([ETypeChart.pie, ETypeChart.ring]);
  let series: any[] = [];
  const category = obj.data
    .filter((i: any) => !level || (i.level === level && !i.isSummary))
    .map((i: any) => i.content);
  if (listXy.has(type)) {
    const listField: any[] = [];
    obj.meta
      .filter(
        (i: any) =>
          i.type === "number" && (!list?.length || list.includes(i.field)),
      )
      .forEach((i: any, j: number, array: any[]) => {
        if (type === ETypeChart.bubble) {
          if (j % 3 === 2) {
            listField.push({
              name:
                array[j - 1].fullName +
                " vs " +
                array[j - 2].fullName +
                " vs " +
                i.fullName,
              field:
                array[j - 1].field + "|" + array[j - 2].field + "|" + i.field,
              value: [],
            });
          }
        } else if (j % 2 === 1) {
          listField.push({
            name: array[j - 1].fullName + " vs " + i.fullName,
            field: array[j - 1].field + "|" + i.field,
            value: [],
          });
        }
      });
    obj.data
      .filter((i: any) => !level || (i.level === level && !i.isSummary))
      .forEach((e: any) => {
        series.push({ name: e.content, value: [] });
        listField.forEach((_: any, index: number) => {
          const arrayField = listField[index].field.split("|");
          const value: number[] = [];
          arrayField.forEach((i: string) => {
            value.push(isNumeric(e[i]) ? Number.parseFloat(e[i]) : 0);
          });
          series
            .at(-1)!
            .value.push([...value, ...listField[index].name.split(" vs ")]);
        });
      });
  } else {
    const listField = obj.meta
      .filter(
        (i: any) =>
          i.type === "number" && (!list?.length || list.includes(i.field)),
      )
      .map((i: any) => ({
        value: listNumber.has(type) ? 0 : [],
        name: i.fullName,
        field: i.field,
      }));
    obj.data
      .filter((i: any) => !level || (i.level === level && !i.isSummary))
      .forEach((e: any) => {
        listField.forEach((i: any, index: number) => {
          if (listNumber.has(type) && isNumeric(e[i.field]))
            listField[index].value += Number.parseFloat(e[i.field]);
          else
            listField[index].value.push(
              isNumeric(e[i.field]) ? Number.parseFloat(e[i.field]) : 0,
            );
        });
      });
    series = listNumber.has(type) ? [{ data: listField }] : listField;
  }
  return { title, type, series, category };
};
/**
 * Generates an object containing dates based on the provided start and end dates.
 *
 * @param {Object} options - The options for generating the object.
 * @param {Dayjs} options.start - The start date.
 * @param {Dayjs} options.end - The end date.
 * @param {number} [options.widthColumnDay=40.8] - The width of each column representing a day.
 * @param {number} [options.widthMonthYear=110] - The width of each column representing a month or year.
 * @param {number} [options.perRow=1] - The number of columns per row.
 *
 * @returns {Object} - The generated object containing dates and the total number of days.
 */
export const generateObjDate = ({
  start,
  end,
  widthColumnDay = 40.8,
  widthMonthYear = 110,
  perRow = 1,
}: {
  start: Dayjs;
  end: Dayjs;
  widthColumnDay?: number;
  widthMonthYear?: number;
  perRow?: number;
}) => {
  const addEndDate = end.date() + 1;
  if (addEndDate * (widthColumnDay / perRow) < widthMonthYear)
    end = end.add(
      Math.ceil(widthMonthYear / widthColumnDay) * perRow - addEndDate,
      "days",
    );
  const endMonth =
    end.month() - start.month() + 1 + (end.year() - start.year()) * 12;
  const objDate: any = {};
  let totalDay = start.date();
  let lengthDay = 0;
  for (let i = 0; i < endMonth; i++) {
    const currentDay = start.add(i, "months");
    const month = currentDay.month();
    if (!objDate[currentDay.year()]) objDate[currentDay.year()] = {};
    if (!objDate[currentDay.year()][month])
      objDate[currentDay.year()][month] = [];
    const dayInMonth = currentDay.daysInMonth();
    for (let j = totalDay; j <= dayInMonth; j += perRow) {
      if (j + perRow > dayInMonth) totalDay = j + perRow - dayInMonth;
      const nextDate = generateNextDate({ currentDay, month, number: j });
      if (nextDate < end.add(perRow, "days"))
        objDate[currentDay.year()][month].push(nextDate);
    }
    lengthDay += objDate[currentDay.year()][month].length;
  }
  return { obj: objDate, total: lengthDay };
};
/**
 * Generates the next date based on the given parameters.
 *
 * @param {Object} options - The options for generating the next date.
 * @param {Dayjs} options.currentDay - The current day.
 * @param {number} options.month - The month.
 * @param {number} options.number - The number.
 * @returns {Dayjs} The next date.
 */
export const generateNextDate = ({
  currentDay,
  month,
  number,
}: {
  currentDay: Dayjs;
  month: number;
  number: number;
}) =>
  dayjs(
    currentDay.year() +
      "-" +
      (month < 10 ? "0" : "") +
      (month + 1) +
      "-" +
      (number < 10 ? "0" : "") +
      number,
  );

/**
 * Determines whether two numbers are approximately equal within a small tolerance.
 *
 * @param a - The first number to compare.
 * @param b - The second number to compare.
 * @returns `true` if the absolute difference between `a` and `b` is less than `1e-5`; otherwise, `false`.
 */
export const equals = (a: number, b: number) => {
  const EPSILON = 1e-5;
  return Math.abs(a - b) < EPSILON;
};
