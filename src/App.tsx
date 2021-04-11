import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import axios from 'axios';
import useSWR from 'swr';
import quarterSupport from 'dayjs/plugin/quarterOfYear';
import { Alert, Spin } from 'antd';
import { useMediaQuery } from 'react-responsive';

// types for date picker change handler
import { RangeValue } from 'rc-picker/lib/interface';
import { RangeInfo } from 'rc-picker/lib/RangePicker';

import { LicenseUsageChart, LicenseUsageTable, DatePicker } from './components';
import { getStatsWithinRange, mergeStatsWithSameDay } from './utils/statsUtil';

import './App.scss';

dayjs.extend(quarterSupport);

// fetcher function for swr
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

function App() {
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

  // const isDesktop = useMediaQuery({ query: '(min-width: 1024px)' });
  // const isTablet = useMediaQuery({ query: '(max-width: 768px)' });
  // const isMobile = useMediaQuery({ query: '(min-width: 768px)' });

  const [dateRange, setDateRange] = useState<DateRange>();
  const [dateLimit, setDateLimit] = useState<DateRange>();

  const { data, error } = useSWR<APIResponse>('/api/stats', fetcher);
  const [filteredData, setFilteredData] = useState<LicenseUsageDataSummary>();
  const [processedData, setProcessedData] = useState<LicenseUsageDataSummary>();

  useEffect(() => {
    if (!data) return;

    const dateStart = dayjs(data.dateRange.from).utc();

    setDateLimit({
      from: dateStart,
      to: dayjs(data.dateRange.to).utc(),
    });

    // default time range (1 quarter)
    setDateRange({
      from: dateStart,
      to: dateStart.add(1, 'quarter').subtract(1, 'day'),
    });

    setProcessedData({
      idea: mergeStatsWithSameDay(data.idea),
      webstorm: mergeStatsWithSameDay(data.webstorm),
      goland: mergeStatsWithSameDay(data.goland),
    });
  }, [data]);

  useEffect(() => {
    if (!dateRange) return;

    const rangeStart = dateRange.from;
    const rangeEnd = dateRange.to;

    setFilteredData({
      idea: getStatsWithinRange(processedData!.idea, rangeStart, rangeEnd),
      webstorm: getStatsWithinRange(processedData!.webstorm, rangeStart, rangeEnd),
      goland: getStatsWithinRange(processedData!.goland, rangeStart, rangeEnd),
    });
  }, [dateRange, processedData]);

  const calendarChangeHandler = (
    ...params: [
      values: RangeValue<dayjs.Dayjs>,
      formatString: [string, string],
      info: RangeInfo
    ]
  ) => {
    const [dates, , info] = params;

    if (info.range === 'start') {
      const dateStart = dates![0]!;

      setDateRange((prev) => ({
        from: dateStart,
        to: dateStart > prev!.to ? dateStart : prev!.to,
      }));

      return;
    }

    const dateEnd = dates![1]!;

    setDateRange((prev) => ({
      from: dateEnd < prev!.from ? dateEnd : prev!.from,
      to: dateEnd,
    }));
  };

  return (
    <div className="wrapper">
      <section className="license-usage-stats">
        <div className="container">
          <h1 className="license-usage-stats__title">License Usage Statistics</h1>
          {!data ? (
            <div className="loading">
              <Spin size="large" tip="Loading license usage statistics..." />
            </div>
          ) : (
            <div className="license-usage-stats__inner">
              <h2>Date Range</h2>
              <DatePicker.RangePicker
                size="large"
                allowClear={false}
                style={{ width: '40%' }}
                format={['DD MMM, YYYY', 'DD-MM-YYYY', 'DD-MM-YY']}
                value={(dateRange && [dateRange.from, dateRange.to]) || null}
                disabledDate={
                  dateLimit && ((date) => date < dateLimit.from || date > dateLimit.to)
                }
                ranges={
                  dateRange && {
                    Week: [
                      dateRange?.from,
                      dateRange?.from.add(1, 'week').subtract(1, 'day'),
                    ],
                    Month: [
                      dateRange?.from,
                      dateRange?.from.add(1, 'month').subtract(1, 'day'),
                    ],
                    Quarter: [
                      dateRange?.from,
                      dateRange?.from.add(1, 'quarter').subtract(1, 'day'),
                    ],
                  }
                }
                onCalendarChange={calendarChangeHandler}
              />
              <LicenseUsageTable data={filteredData} size="small" />
              <div className="license-usage-charts">
                <LicenseUsageChart
                  data={filteredData?.idea}
                  title="IntelliJ IDEA"
                  fill="#c11c77"
                />
                <LicenseUsageChart data={filteredData?.webstorm} title="WebStorm" />
                <LicenseUsageChart
                  data={filteredData?.goland}
                  title="GoLand"
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
