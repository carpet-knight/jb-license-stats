interface LicenseUsageData {
  timestamp: Date | string;
  licenseCount: number;
}

interface LicenseUsageDataSummary {
  idea: LicenseUsageData[];
  webstorm: LicenseUsageData[];
  goland: LicenseUsageData[];
}
