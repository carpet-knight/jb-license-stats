import dayjs from 'dayjs';

// get license usage data with timestamps between <rangeStart> and <rangeEnd>
export const getStatsWithinRange = (
  stats: LicenseUsageData[],
  rangeStart: dayjs.Dayjs,
  rangeEnd: dayjs.Dayjs
) => {
  return stats.filter((stat) => {
    const timestamp = dayjs(stat.timestamp);
    return timestamp >= rangeStart && timestamp <= rangeEnd;
  });
};

// get list of merged license usage data objects
// only objects whose timestamps differ by less than a day are merged
export const mergeStatsWithSameDay = (stats: LicenseUsageData[]) => {
  // assuming that <stats> array is sorted

  let prev = Object.assign({}, stats[0]);
  const merged = [prev];

  for (let i = 1; i < stats.length; i++) {
    const current = Object.assign({}, stats[i]);
    const timeDiff = dayjs(current.timestamp).diff(dayjs(prev.timestamp), 'days');

    if (timeDiff === 0) {
      prev.licenseCount += current.licenseCount;
    } else {
      merged.push(current);
    }

    prev = current;
  }

  return merged;
};
