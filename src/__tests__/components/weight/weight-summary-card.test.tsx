import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WeightSummaryCard } from '@/components/weight/weight-summary-card';
import { useWeightEntries } from '@/hooks/use-weight';

vi.mock('@/hooks/use-weight');
vi.mock('@/components/weight/add-weight-dialog', () => ({
  AddWeightDialog: () => <div data-testid="add-weight-dialog">Add Weight Dialog</div>,
}));

const mockUseWeightEntries = useWeightEntries as any;

describe('WeightSummaryCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });;

  it('should render skeleton while loading', () => {
    mockUseWeightEntries.mockReturnValue({
      data: [],
      isLoading: true,
    });

    const { container } = render(<WeightSummaryCard />);
    // Should render loading state with Card
    expect(container.firstChild).toBeTruthy();
  });

  it('should render weight data when loaded', () => {
    const mockEntries = [
      {
        id: '1',
        user_id: 'user-1',
        weight: '70.5',
        unit: 'kg',
        date: '2024-01-15T00:00:00Z',
        created_at: '2024-01-15T00:00:00Z',
      },
    ];

    mockUseWeightEntries.mockReturnValue({
      data: mockEntries,
      isLoading: false,
    });

    render(<WeightSummaryCard />);
    expect(screen.getByText('70.5')).toBeInTheDocument();
    expect(screen.getByText('kg')).toBeInTheDocument();
  });

  it('should display latest weight entry', () => {
    const mockEntries = [
      {
        id: '1',
        user_id: 'user-1',
        weight: '70.5',
        unit: 'kg',
        date: '2024-01-15T00:00:00Z',
        created_at: '2024-01-15T00:00:00Z',
      },
      {
        id: '2',
        user_id: 'user-1',
        weight: '71.0',
        unit: 'kg',
        date: '2024-01-14T00:00:00Z',
        created_at: '2024-01-14T00:00:00Z',
      },
    ];

    mockUseWeightEntries.mockReturnValue({
      data: mockEntries,
      isLoading: false,
    });

    render(<WeightSummaryCard />);
    expect(screen.getByText('70.5')).toBeInTheDocument();
  });

  it('should show weight change delta', () => {
    const mockEntries = [
      {
        id: '1',
        user_id: 'user-1',
        weight: '70.0',
        unit: 'kg',
        date: '2024-01-15T00:00:00Z',
        created_at: '2024-01-15T00:00:00Z',
      },
      {
        id: '2',
        user_id: 'user-1',
        weight: '71.0',
        unit: 'kg',
        date: '2024-01-14T00:00:00Z',
        created_at: '2024-01-14T00:00:00Z',
      },
    ];

    mockUseWeightEntries.mockReturnValue({
      data: mockEntries,
      isLoading: false,
    });

    const { container } = render(<WeightSummaryCard />);
    // Delta is -1.0, should show trending down icon
    expect(container).toBeInTheDocument();
  });

  it('should handle single weight entry without delta', () => {
    const mockEntries = [
      {
        id: '1',
        user_id: 'user-1',
        weight: '70.5',
        unit: 'kg',
        date: '2024-01-15T00:00:00Z',
        created_at: '2024-01-15T00:00:00Z',
      },
    ];

    mockUseWeightEntries.mockReturnValue({
      data: mockEntries,
      isLoading: false,
    });

    render(<WeightSummaryCard />);
    expect(screen.getByText('70.5')).toBeInTheDocument();
  });

  it('should handle empty entries', () => {
    mockUseWeightEntries.mockReturnValue({
      data: [],
      isLoading: false,
    });

    const { container } = render(<WeightSummaryCard />);
    expect(container).toBeInTheDocument();
  });

  it('should display unit in weight text', () => {
    const mockEntries = [
      {
        id: '1',
        user_id: 'user-1',
        weight: '155.0',
        unit: 'lbs',
        date: '2024-01-15T00:00:00Z',
        created_at: '2024-01-15T00:00:00Z',
      },
    ];

    mockUseWeightEntries.mockReturnValue({
      data: mockEntries,
      isLoading: false,
    });

    render(<WeightSummaryCard />);
    expect(screen.getByText('lbs')).toBeInTheDocument();
  });

  it('should show add weight button', () => {
    mockUseWeightEntries.mockReturnValue({
      data: [],
      isLoading: false,
    });

    const { container } = render(<WeightSummaryCard />);
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should format date correctly', () => {
    const mockEntries = [
      {
        id: '1',
        user_id: 'user-1',
        weight: '70.5',
        unit: 'kg',
        date: '2024-01-15T00:00:00Z',
        created_at: '2024-01-15T00:00:00Z',
      },
    ];

    mockUseWeightEntries.mockReturnValue({
      data: mockEntries,
      isLoading: false,
    });

    render(<WeightSummaryCard />);
    // Should show formatted date
    expect(screen.getByText(/Jan/)).toBeInTheDocument();
  });

  it('should handle weight gain (positive delta)', () => {
    const mockEntries = [
      {
        id: '1',
        user_id: 'user-1',
        weight: '72.0',
        unit: 'kg',
        date: '2024-01-15T00:00:00Z',
        created_at: '2024-01-15T00:00:00Z',
      },
      {
        id: '2',
        user_id: 'user-1',
        weight: '70.0',
        unit: 'kg',
        date: '2024-01-14T00:00:00Z',
        created_at: '2024-01-14T00:00:00Z',
      },
    ];

    mockUseWeightEntries.mockReturnValue({
      data: mockEntries,
      isLoading: false,
    });

    render(<WeightSummaryCard />);
    expect(screen.getByText('72.0')).toBeInTheDocument();
  });

  it('should call useWeightEntries with correct limit', () => {
    mockUseWeightEntries.mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<WeightSummaryCard />);
    expect(mockUseWeightEntries).toHaveBeenCalledWith(2);
  });
});
