import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StreakCard } from '@/components/analytics/streak-card';
import { useStreaks } from '@/hooks/use-analytics';

vi.mock('@/hooks/use-analytics');

const mockUseStreaks = useStreaks as any;

describe('StreakCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state', () => {
    mockUseStreaks.mockReturnValue({ data: null, isLoading: true });
    const { container } = render(<StreakCard />);
    expect(container.innerHTML).toContain('grid');
  });

  it('should render streak data', () => {
    mockUseStreaks.mockReturnValue({
      data: { currentStreak: 7, longestStreak: 21, lastCompletedDate: '2024-01-15' },
      isLoading: false,
    });
    render(<StreakCard />);
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('should display current streak', () => {
    mockUseStreaks.mockReturnValue({
      data: { currentStreak: 5, longestStreak: 10, lastCompletedDate: '2024-01-15' },
      isLoading: false,
    });
    render(<StreakCard />);
    expect(screen.getByText(/Current Streak/)).toBeInTheDocument();
  });

  it('should display longest streak', () => {
    mockUseStreaks.mockReturnValue({
      data: { currentStreak: 3, longestStreak: 12, lastCompletedDate: '2024-01-15' },
      isLoading: false,
    });
    render(<StreakCard />);
    expect(screen.getByText(/Longest Streak/)).toBeInTheDocument();
  });

  it('should show zero values', () => {
    mockUseStreaks.mockReturnValue({
      data: { currentStreak: 0, longestStreak: 0, lastCompletedDate: null },
      isLoading: false,
    });
    render(<StreakCard />);
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(2);
  });

  it('should display days unit', () => {
    mockUseStreaks.mockReturnValue({
      data: { currentStreak: 7, longestStreak: 14, lastCompletedDate: '2024-01-15' },
      isLoading: false,
    });
    render(<StreakCard />);
    expect(screen.getAllByText(/days/).length).toBeGreaterThanOrEqual(2);
  });

  it('should handle undefined data', () => {
    mockUseStreaks.mockReturnValue({ data: undefined, isLoading: false });
    render(<StreakCard />);
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(2);
  });

  it('should show activity message', () => {
    mockUseStreaks.mockReturnValue({
      data: { currentStreak: 3, longestStreak: 10, lastCompletedDate: '2024-01-15' },
      isLoading: false,
    });
    render(<StreakCard />);
    expect(screen.getByText(/Keep it going/)).toBeInTheDocument();
  });

  it('should show personal best message', () => {
    mockUseStreaks.mockReturnValue({
      data: { currentStreak: 5, longestStreak: 10, lastCompletedDate: '2024-01-15' },
      isLoading: false,
    });
    render(<StreakCard />);
    expect(screen.getByText(/Personal best/)).toBeInTheDocument();
  });

  it('should display large values', () => {
    mockUseStreaks.mockReturnValue({
      data: { currentStreak: 100, longestStreak: 365, lastCompletedDate: '2024-01-15' },
      isLoading: false,
    });
    render(<StreakCard />);
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('365')).toBeInTheDocument();
  });
});
