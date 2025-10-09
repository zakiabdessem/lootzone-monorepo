'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '72px', margin: '0', color: '#d32f2f' }}>500</h1>
      <h2 style={{ fontSize: '24px', margin: '10px 0', color: '#333' }}>Something went wrong!</h2>
      <p style={{ fontSize: '16px', color: '#666', maxWidth: '400px' }}>
        An error occurred while loading this page.
      </p>
      <button
        onClick={reset}
        style={{ 
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#1976d2',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Try again
      </button>
    </div>
  );
}
