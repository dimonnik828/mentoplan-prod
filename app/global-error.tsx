'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div>
            <h2>Критическая ошибка</h2>
            <p>{error.message}</p>
            <button onClick={() => reset()}>Попробовать снова</button>
          </div>
        </div>
      </body>
    </html>
  );
}