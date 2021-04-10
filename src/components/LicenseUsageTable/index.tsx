import { Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import React, { useState, useEffect } from 'react';
import { SizeType } from 'antd/es/config-provider/SizeContext';

import './LicenseUsageTable.scss';

interface LicenseUsageStats {
  minUsage: number;
  maxUsage: number;
  avgUsage: number;
}

interface LicenseUsageTableRow extends LicenseUsageStats {
  key: number;
  name: string;
}

interface LicesnseUsageTableProps {
  data: LicenseUsageDataSummary;
  size?: SizeType;
}

// specify table columns
const columns: ColumnsType<LicenseUsageTableRow> = [
  {
    title: 'Product',
    dataIndex: 'name',
  },
  {
    title: 'Min Usage',
    dataIndex: 'minUsage',
  },
  {
    title: 'Max Usage',
    dataIndex: 'maxUsage',
  },
  {
    title: 'Average Usage',
    dataIndex: 'avgUsage',
  },
];

// calculate min, max, avg license usage of the given product
const getLicenseUsageStats = (data: LicenseUsageData[]): LicenseUsageStats => {
  let sum = 0;
  let min = data[0].licenseCount;
  let max = data[0].licenseCount;

  for (let i = 1; i < data.length; ++i) {
    const licenseCount = data[i].licenseCount;

    min = licenseCount < min ? licenseCount : min;
    max = licenseCount > max ? licenseCount : max;

    sum += licenseCount;
  }

  return {
    minUsage: min,
    maxUsage: max,
    avgUsage: Math.round(sum / data.length),
  };
};

const LicesnseUsageTable: React.FC<LicesnseUsageTableProps> = ({
  data,
  size = 'large',
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [rows, setRows] = useState<LicenseUsageTableRow[]>([]);

  useEffect(() => {
    setLoading(true);

    const ideaStats = getLicenseUsageStats(data.idea);
    const golandStats = getLicenseUsageStats(data.goland);
    const webstormStats = getLicenseUsageStats(data.webstorm);

    setRows([
      {
        key: 1,
        name: 'IntelliJ IDEA',
        ...ideaStats,
      },
      {
        key: 2,
        name: 'WebStorm',
        ...webstormStats,
      },
      {
        key: 3,
        name: 'GoLand',
        ...golandStats,
      },
    ]);

    setLoading(false);
  }, [data]);

  return (
    <div className="license-usage-table">
      <Table
        loading={loading}
        columns={columns}
        dataSource={rows}
        size={size}
        pagination={false}
        bordered
      />
    </div>
  );
};

export default LicesnseUsageTable;
