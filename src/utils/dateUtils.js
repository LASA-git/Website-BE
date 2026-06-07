const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const pad2 = (value) => String(value).padStart(2, "0");

const parseDateOnlyToUtcDate = (value) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Date(
      Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate())
    );
  }

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

  return parsed;
};

const formatDateOnlyUTC = (value) => {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getUTCFullYear();
  const month = pad2(date.getUTCMonth() + 1);
  const day = pad2(date.getUTCDate());

  return `${year}-${month}-${day}`;
};

const getCurrentUTCYear = () => new Date().getUTCFullYear();

const getStartOfUTCToday = () => {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
};

const getYearEndUTC = (year) =>
  new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));

module.exports = {
  parseDateOnlyToUtcDate,
  formatDateOnlyUTC,
  getCurrentUTCYear,
  getStartOfUTCToday,
  getYearEndUTC
};