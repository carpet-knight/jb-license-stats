import { Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import React, { useState, useEffect } from 'react';
import { SizeType } from 'antd/es/config-provider/SizeContext';

import { getLicenseUsageStats } from '../../utils/statsUtil';

import './LicenseUsageTable.scss';

interface LicenseUsageTableRow extends LicenseUsageStats {
  key: number;
  name: string;
}

interface LicesnseUsageTableProps {
  data?: LicenseUsageDataSummary;
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

const LicesnseUsageTable: React.FC<LicesnseUsageTableProps> = ({
  data,
  size = 'large',
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [rows, setRows] = useState<LicenseUsageTableRow[]>([]);

  useEffect(() => {
    if (!data) {
      setLoading(true);
      return;
    }

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
