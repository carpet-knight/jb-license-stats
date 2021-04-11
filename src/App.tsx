import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import axios from 'axios';
import useSWR from 'swr';
import quarterSupport from 'dayjs/plugin/quarterOfYear';

// import { Select, Table } from 'antd';
import { Alert, Spin } from 'antd';
import { LicenseUsageChart, LicenseUsageTable, DatePicker } from './components';
import { LoadingOutlined } from '@ant-design/icons';

import './App.scss';

// const { Option } = Select;

// dayjs.extend(utcSupport);
dayjs.extend(quarterSupport);

enum TimePeriod {
  Quarter = 'quarter',
  Month = 'month',
  Week = 'week',
  Day = 'day',
}

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

const getStatsWithinRange = (
  stats: LicenseUsageData[],
  rangeStart: dayjs.Dayjs,
  rangeEnd: dayjs.Dayjs
) => {
  const filtered = [];

  for (const stat of stats) {
    const timestamp = dayjs(stat.timestamp);

    if (timestamp < rangeStart || timestamp >= rangeEnd) break;

    filtered.push(stat);
  }

  return filtered;
};

function App() {
  // const [timePeriod, setTimePeriod] = useState<TimePeriod>(TimePeriod.Quarter);
  // const [datetimeStart, setDatetimeStart] = useState<Datetime>();
  // const [datetimeEnd, setDatetimeEnd] = useState<Datetime>();

  // const [data, setData] = useState<LicenseUsageData[]>();
  // const [data, setData] = useState<LicenseUsageDataJoined>();

  // useEffect(() => {
  //   setLoading(true);

  //   fetch('/api/stats/idea')
  //     .then((res) => res.json())
  //     .then((data: LicenseUsageData[]) => {
  //       const dateEnd = dayjs(data[0].timestamp).startOf('year').add(1, 'quarter');

  //       setData(
  //         data
  //           .map((item) => ({
  //             timestamp: new Date(item.timestamp),
  //             licenseCount: item.licenseCount,
  //           }))
  //           .filter((item) => {
  //             return dayjs(item.timestamp) < dateEnd;
  //           })
  //       );

  //       setLoading(false);
  //     });
  // }, []);

  // const ErrorMessage: React.FC<{ error: boolean }> = ({ error }) => {
  //   return error ? (
  //     <Alert
  //       style={{ width: '50%' }}
  //       message="Omg"
  //       description="Failed to fetch"
  //       // banner
  //       type="error"
  //       closable
  //       showIcon
  //     />
  //   ) : null;
  // };

  const [dateRange, setDateRange] = useState<DateRange>();
  const [dateLimit, setDateLimit] = useState<DateRange>();
  const [filteredData, setFilteredData] = useState<LicenseUsageDataSummary>();
  const { data, error } = useSWR<APIResponse>('/api/stats', fetcher);

  useEffect(() => {
    if (data) {
      const dateStart = dayjs(data.dateRange.from).utc();
      setDateLimit({
        from: dateStart,
        to: dayjs(data.dateRange.to).utc(),
      });

      setDateRange({
        from: dateStart,
        to: dateStart.add(1, 'day'),
      });
    }
  }, [data]);

  useEffect(() => {}, [dateRange]);

  return (
    <div className="wrapper">
      <section className="license-usage-stats">
        <div className="container">
          <h1 className="license-usage-stats__title">License Usage Statistics</h1>
          {/* <Navigation leftArrowText="LOL" rightArrowText="KEK" style={{ width: '25%' }} /> */}
          {!data ? (
            // <LoadingOutlined style={{ color: '#1890ff', fontSize: '100px' }} />
            <div className="loading">
              <Spin size="large" tip="Loading license usage statistics..." />
            </div>
          ) : (
            <div className="license-usage-stats__inner">
              <h2>Date Range</h2>
              <DatePicker.RangePicker
                style={{ width: '40%' }}
                format={['DD MMM, YYYY', 'DD-MM-YYYY']}
                value={(dateRange && [dateRange.from, dateRange.to]) || null}
                // defaultValue={[dateLimit.from, dateLimit.from.add(1, 'quarter')]}
                // defaultPickerValue={[dateLimit.from, dateLimit.from]}
                size="large"
                disabledDate={
                  dateLimit && ((date) => date < dateLimit.from || date > dateLimit.to)
                }
                ranges={
                  dateRange && {
                    // Today: [dayjs(), dayjs()],
                    '+Week': [dateRange.from, dateRange.from.add(1, 'week')],
                    '+Month': [dateRange.from, dateRange.from.add(1, 'month')],
                    '+Quarter': [dateRange.from, dateRange.from.add(1, 'quarter')],
                  }
                }
                onChange={(date) => {
                  date &&
                    setDateRange({
                      from: date[0]!,
                      to: date[1]!,
                    });
                }}
              />
              <div className="license-usage-charts">
                <LicenseUsageTable data={data} />
                <LicenseUsageChart
                  width={1000}
                  data={data.idea}
                  title="IntelliJ IDEA"
                  fill="#c11c77"
                  // fill="#d4244a"
                  // fill="#8884d8" // GoLand color
                />
                <LicenseUsageChart
                  width={1000}
                  data={data.webstorm}
                  title="WebStorm"
                  // fill="#d4244a"
                  // fill="#8884d8" // GoLand color
                />
                <LicenseUsageChart
                  width={1000}
                  data={data.goland}
                  title="GoLand"
                  // fill="#d4244a"
                  fill="#8884d8"
                />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default App;
