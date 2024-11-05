// tests/integration/linkedin-auth.test.tsx
import { render, fireEvent, waitFor } from '@testing-library/react';
import { PlatformSelect } from '@/components/PlatformSelect';
import { useSocialConnect } from '@/hooks/useSocialConnect';

// Mock component to test the hook
function TestComponent() {
  const { connectPlatform, loading, error } = useSocialConnect();

  return (
    <div>
      <button 
        onClick={() => connectPlatform('linkedin_oidc')}
        data-testid="linkedin-connect"
      >
        Connect LinkedIn
      </button>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
    </div>
  );
}

describe('LinkedIn Integration', () => {
  it('initiates LinkedIn OAuth flow', async () => {
    const { getByTestId } = render(<TestComponent />);
    
    // Click connect button
    fireEvent.click(getByTestId('linkedin-connect'));
    
    // Should redirect to LinkedIn
    // Note: Full OAuth flow can't be tested in unit tests
    expect(window.location.href).toContain('linkedin.com');
  });
});