export default function NotFound() {
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
      <h1 style={{ fontSize: '72px', margin: '0', color: '#666' }}>404</h1>
      <h2 style={{ fontSize: '24px', margin: '10px 0', color: '#333' }}>Page Not Found</h2>
      <p style={{ fontSize: '16px', color: '#666', maxWidth: '400px' }}>
        The page you are looking for does not exist.
      </p>
      <a 
        href="/" 
        style={{ 
          display: 'inline-block',
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#1976d2',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px'
        }}
      >
        Go Home
      </a>
    </div>
  );
}