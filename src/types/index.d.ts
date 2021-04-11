interface LicenseUsageData {
  timestamp: Date | string;
  licenseCount: number;
}

interface LicenseUsageDataSummary {
  idea: LicenseUsageData[];
  webstorm: LicenseUsageData[];
  goland: LicenseUsageData[];
}

interface DateRange {
  from: import('dayjs').Dayjs;
  to: import('dayjs').Dayjs;
}

interface DateStringRange {
  from: string;
  to: string;
}

interface APIResponse extends LicenseUsageDataSummary {
  dateRange: DateStringRange;
}
