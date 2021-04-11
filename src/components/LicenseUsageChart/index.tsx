import dayjs from 'dayjs';
import utcSupport from 'dayjs/plugin/utc';

import { Empty } from 'antd';
import React, { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

import './LicenseUsageChart.scss';

dayjs.extend(utcSupport);

interface LicenseUsageChartProps {
  title?: string;
  width: number;
  height?: number;
  data?: LicenseUsageData[];
  fill?: string;
  maxBarSize?: number;
}

const LicenseUsageChart: React.FC<LicenseUsageChartProps> = ({
  title,
  data,
  width,
  height = 250,
  maxBarSize = 40,
  fill = '#1890ff',
}) => {
  const [empty, setEmpty] = useState<boolean>();
  const [dateFormat, setDateFormat] = useState<string>();

  useEffect(() => {
    if (!data || data.length === 0) {
      setEmpty(true);
      return;
    }

    const dateStart = dayjs(data[0].timestamp);
    const dateEnd = dayjs(data[data.length - 1].timestamp);

    setEmpty(false);
    setDateFormat(dateStart.year() === dateEnd.year() ? 'DD MMM' : 'DD MMM, YYYY');
  }, [data]);

  return (
    <div className="license-usage-chart" style={{ width }}>
      {title && <h2 className="chart__title">{title}</h2>}

      {empty ? (
        <Empty style={{ height }} description="No License Usage Data" />
      ) : (
        <>
          <h3 className="chart__label">License Usage</h3>
          <BarChart width={width} height={height} data={data}>
            <CartesianGrid strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(date: Date) => `${dayjs(date).utc().format(dateFormat)}`}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(date: Date) =>
                `${dayjs(date).utc().format('DD MMM, YYYY')}`
              }
              formatter={(value: number) => [value, 'Licenses']}
            />
            <Bar dataKey="licenseCount" fill={fill} maxBarSize={maxBarSize} />
          </BarChart>
        </>
      )}
    </div>
  );
};

export default LicenseUsageChart;
