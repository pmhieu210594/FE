import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";
import localizedFormat from "dayjs/plugin/localizedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";

dayjs.extend(localeData);
dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(utc);

export { dayjs };
