import dayjs from 'dayjs';
import utcSupport from 'dayjs/plugin/utc';

import React, { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

import './LicenseUsageChart.scss';

dayjs.extend(utcSupport);

interface LicenseUsageChartProps {
  title?: string;
  width: number;
  height?: number;
  data: LicenseUsageData[];
  fill?: string;
}

const LicenseUsageChart: React.FC<LicenseUsageChartProps> = ({
  title,
  data,
  width,
  height = 250,
  fill = '#1890ff',
}) => {
  const [dateFormat, setDateFormat] = useState<string>();

  useEffect(() => {
    const dateStart = dayjs(data[0].timestamp);
    const dateEnd = dayjs(data[data.length - 1].timestamp);

    setDateFormat(dateStart.year() === dateEnd.year() ? 'DD MMM' : 'DD MMM, YYYY');
  }, [data]);

  return (
    <div className="license-usage-chart" style={{ width }}>
      {title && <h2 className="chart__title">{title}</h2>}
      <h3 className="chart__label">License Usage</h3>

      <BarChart width={width} height={height} data={data}>
        <CartesianGrid strokeDasharray="4 4" vertical={false} />
        <XAxis
          dataKey="timestamp"
          tickFormatter={(date: Date) => `${dayjs(date).utc().format(dateFormat)}`}
        />
        <YAxis />
        <Tooltip
          labelFormatter={(date: Date) => `${dayjs(date).utc().format('DD MMM, YYYY')}`}
          formatter={(value: number) => [value, 'Licenses']}
        />
        <Bar dataKey="licenseCount" fill={fill} />
      </BarChart>
    </div>
  );
};

export default LicenseUsageChart;
