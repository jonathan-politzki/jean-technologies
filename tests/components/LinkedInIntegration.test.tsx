// tests/components/LinkedInIntegration.test.tsx
import { render, fireEvent, waitFor } from '@testing-library/react';
import { PlatformSelect } from '@/components/PlatformSelect';

describe('LinkedIn Integration', () => {
  it('shows LinkedIn connect button', () => {
    const { getByText } = render(
      <PlatformSelect
        connectedPlatforms={[]}
        onConnect={() => {}}
        onDisconnect={() => {}}
      />
    );
    
    expect(getByText('LinkedIn')).toBeInTheDocument();
  });

  // Add more tests...
});