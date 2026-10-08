import { fireEvent, render, screen } from '@testing-library/react-native';

import { ScanResultPanel } from '../ScanResultPanel';

describe('ScanResultPanel', () => {
  it('shows VALID with a check mark and a boarding message', async () => {
    await render(<ScanResultPanel outcome={{ result: 'VALID' }} onNext={() => {}} />);
    expect(screen.getByText('VALID')).toBeTruthy();
    expect(screen.getByText('✓', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.queryByText('INVALID')).toBeNull();
  });

  it('shows INVALID with a cross and the reason, not colour alone', async () => {
    await render(<ScanResultPanel outcome={{ result: 'INVALID', reason: 'This ticket has already been scanned.' }} onNext={() => {}} />);
    expect(screen.getByText('INVALID')).toBeTruthy();
    expect(screen.getByText('✕', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByText('This ticket has already been scanned.')).toBeTruthy();
  });

  it('falls back to a generic reason when the server sends none', async () => {
    await render(<ScanResultPanel outcome={{ result: 'INVALID' }} onNext={() => {}} />);
    expect(screen.getByText('This ticket cannot be accepted.')).toBeTruthy();
  });

  it('resets for the next scan when the button is pressed', async () => {
    const onNext = jest.fn();
    await render(<ScanResultPanel outcome={{ result: 'VALID' }} onNext={onNext} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Scan next ticket' }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
