const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const pad2 = (value) => String(value).padStart(2, "0");

const normalizeDateOnlyString = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!DATE_ONLY_PATTERN.test(trimmed)) {
    return null;
  }

  const [yearRaw, monthRaw, dayRaw] = trimmed.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);

  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return `${yearRaw}-${monthRaw}-${dayRaw}`;
};

const isDateOnlyString = (value) => normalizeDateOnlyString(value) !== null;

const toDateOnlyString = (value) => {
  const normalized = normalizeDateOnlyString(value);
  if (normalized) {
    return normalized;
  }

  const parsed =
    value instanceof Date ? value : typeof value === "string" ? new Date(value) : null;

  if (!(parsed instanceof Date) || Number.isNaN(parsed.getTime())) {
    return null;
  }

  const year = parsed.getUTCFullYear();
  const month = pad2(parsed.getUTCMonth() + 1);
  const day = pad2(parsed.getUTCDate());

  return `${year}-${month}-${day}`;
};

const getCurrentUTCDateString = () => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = pad2(now.getUTCMonth() + 1);
  const day = pad2(now.getUTCDate());

  return `${year}-${month}-${day}`;
};

const getCurrentUTCYear = () => Number(getCurrentUTCDateString().slice(0, 4));

const getYearFromDateOnlyString = (dateString) => {
  const normalized = normalizeDateOnlyString(dateString);
  if (!normalized) {
    return null;
  }

  return Number(normalized.slice(0, 4));
};

const getYearEndDateString = (year) => `${year}-12-31`;

module.exports = {
  normalizeDateOnlyString,
  isDateOnlyString,
  toDateOnlyString,
  getCurrentUTCDateString,
  getCurrentUTCYear,
  getYearFromDateOnlyString,
  getYearEndDateString
};