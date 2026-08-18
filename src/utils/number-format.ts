const formatterCache = new Map<string, Intl.NumberFormat>();

type NumberFormatOptions = {
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  trimZeroFraction?: boolean;
};

const getNumberFormatter = ({
  locale = "en-US",
  minimumFractionDigits = 2,
  maximumFractionDigits = 2,
  trimZeroFraction = false,
}: NumberFormatOptions) => {
  const cacheKey = `${locale}|${minimumFractionDigits}|${maximumFractionDigits}|${trimZeroFraction}`;
  const cached = formatterCache.get(cacheKey);
  if (cached) return cached;

  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  });
  formatterCache.set(cacheKey, formatter);
  return formatter;
};

export const formatNumberValue = (
  value?: number | null,
  options?: NumberFormatOptions,
) => {
  if (value === undefined || value === null) return "";
  const {
    locale = "en-US",
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    trimZeroFraction = true,
  } = options ?? {};

  if (trimZeroFraction) {
    const rounded = Number(value.toFixed(maximumFractionDigits));
    if (Number.isInteger(rounded)) {
      return getNumberFormatter({
        locale,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(rounded);
    }
  }

  return getNumberFormatter({
    locale,
    minimumFractionDigits,
    maximumFractionDigits,
    trimZeroFraction,
  }).format(value);
};

export const formatNumberValueLoose = (
  value?: number | string | null,
  options?: NumberFormatOptions & { fallback?: string },
) => {
  if (typeof value === "number") {
    return formatNumberValue(value, options);
  }
  return value ?? options?.fallback ?? "-";
};
