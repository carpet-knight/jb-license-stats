import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import axios from 'axios';
import useSWR from 'swr';
import quarterSupport from 'dayjs/plugin/quarterOfYear';
import { Spin, notification } from 'antd';

// types for date picker change handler
import { RangeValue } from 'rc-picker/lib/interface';
import { RangeInfo } from 'rc-picker/lib/RangePicker';

import { LicenseUsageChart, LicenseUsageTable, DatePicker } from './components';
import { getStatsWithinRange, mergeStatsWithSameDay } from './utils/statsUtil';
import { useAdaptiveSize } from './hooks';

import './App.scss';

dayjs.extend(quarterSupport);

// fetcher function for swr
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

function App() {
  // used for size adjustment according to screen width
  const { size } = useAdaptiveSize({
    smallScreenQuery: '(min-width: 320px)',
    midScreenQuery: '(min-width: 425px)',
    largeScreenQuery: '(min-width: 768px)',
  });

  // date range for filtering license usage info
  const [dateRange, setDateRange] = useState<DateRange>();

  // min and max dates (used for specifying allowed date range)
  const [dateLimit, setDateLimit] = useState<DateRange>();

  const { data, error } = useSWR<APIResponse>('/api/stats', fetcher);

  // data after merge of license usage info with duplicated timestamps
  const [processedData, setProcessedData] = useState<LicenseUsageDataSummary>();

  // processed data within date range
  const [filteredData, setFilteredData] = useState<LicenseUsageDataSummary>();

  useEffect(() => {
    if (!data) return;

    const dateStart = dayjs(data.dateRange.from).utc();

    setDateLimit({
      from: dateStart,
      to: dayjs(data.dateRange.to).utc(),
    });

    // set default time range (1 quarter)
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

  // filter license usage data according to dateRange state
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

  // display error message on error
  useEffect(() => {
    if (error) {
      notification.error({
        message: 'Failed To Fetch Data',
        description: 'Something went terribly wrong.',
      });

      notification.info({
        message: 'Trying to fetch data again...',
      });
    }
  }, [error]);

  // change dateRange state according to selected values
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
            /**************************** Loading Spinner **************************/
            <div className="loading">
              <Spin size="large" tip="Loading license usage statistics..." />
            </div>
          ) : (
            <div className="license-usage-stats__inner">
              <h2>Date Range</h2>
              {/************************ Date Range Selector *****************************/}
              <DatePicker.RangePicker
                size="large"
                allowClear={false}
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
              {/* ***************** End Date Range Selector ****************** */}

              {/****************** License Usage Table *************************/}
              <LicenseUsageTable data={filteredData} size={size} />

              {/********************  License Usage Charts *********************/}
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
              {/******************** End License Usage Charts *******************/}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default App;
