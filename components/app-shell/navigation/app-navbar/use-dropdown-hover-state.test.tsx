import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useDropdownHoverState } from '@/components/app-shell/navigation/app-navbar/use-dropdown-hover-state';

describe('useDropdownHoverState', () => {
  it('opens on trigger enter and closes after hover leave timeout', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useDropdownHoverState());

    act(() => {
      result.current.onTriggerMouseEnter({} as never);
    });
    expect(result.current.open).toBe(true);

    act(() => {
      result.current.onTriggerMouseLeave({} as never);
      vi.advanceTimersByTime(200);
    });
    expect(result.current.open).toBe(false);
    vi.useRealTimers();
  });

  it('stays open while pointer is over content', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useDropdownHoverState());

    act(() => {
      result.current.onTriggerPointerEnter({} as never);
      result.current.onTriggerPointerLeave({} as never);
      result.current.onContentPointerEnter({} as never);
      vi.advanceTimersByTime(200);
    });
    expect(result.current.open).toBe(true);

    act(() => {
      result.current.onContentPointerLeave({} as never);
      vi.advanceTimersByTime(200);
    });
    expect(result.current.open).toBe(false);
    vi.useRealTimers();
  });
});
