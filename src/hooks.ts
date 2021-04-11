import { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';

import { SizeType } from 'antd/es/config-provider/SizeContext';

interface AdaptiveSizeParams {
  smallScreenQuery: string;
  midScreenQuery: string;
  largeScreenQuery: string;
}

const useAdaptiveSize = ({
  smallScreenQuery,
  midScreenQuery,
  largeScreenQuery,
}: AdaptiveSizeParams) => {
  const [size, setSize] = useState<SizeType>();

  const largeScreen = useMediaQuery({ query: largeScreenQuery });
  const midScreen = useMediaQuery({ query: midScreenQuery });
  const smallScreen = useMediaQuery({ query: smallScreenQuery });

  useEffect(() => {
    if (largeScreen) {
      setSize('large');

      return;
    }

    if (midScreen) {
      setSize('middle');

      return;
    }

    if (smallScreen) {
      setSize('small');
    }
  }, [smallScreen, midScreen, largeScreen]);

  return { size };
};

export { useAdaptiveSize };
