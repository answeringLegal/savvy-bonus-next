'use client';
import { BREAK_POINTS, useMediaQuery } from './useMediaQuery';

export const useIconSize = () => {
  const isDesktop = useMediaQuery(BREAK_POINTS.sm);
  return isDesktop ? 18 : 24;
};
