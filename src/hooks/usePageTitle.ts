import { useEffect } from 'react';

export function usePageTitle(title: string) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title ? `${title} | FundLens` : 'FundLens - Campaign Finance Data';

    return () => {
      document.title = prevTitle;
    };
  }, [title]);
}
