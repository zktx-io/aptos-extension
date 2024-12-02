export const User = ({ data }: { data: string }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '1rem',
      }}
    >
      <div
        style={{
          maxWidth: '80%',
          backgroundColor: 'var(--vscode-input-background)',
          color: 'var(--vscode-foreground)',
          padding: '10px 15px',
          borderRadius: '15px',
          textAlign: 'left',
          position: 'relative',
          boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.2)',
        }}
      >
        {data}
        <div
          style={{
            content: '""',
            position: 'absolute',
            bottom: '10px',
            right: '-10px',
            width: '0',
            height: '0',
            borderTop: '10px solid var(--vscode-input-background)',
            borderLeft: '10px solid transparent',
            borderRight: 'none',
            borderBottom: 'none',
          }}
        />
      </div>
    </div>
  );
};
