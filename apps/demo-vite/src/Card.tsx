interface CardProps {
  title: string;
  description: string;
  icon: string;
}

export function Card({ title, description, icon }: CardProps) {
  return (
    <article
      style={{
        background: '#13132a',
        border: '1px solid #2a2a45',
        borderRadius: '17px',
        padding: '28px 24px',
        transition: 'border-color 0.2s ease',
      }}
    >
      <div
        style={{
          fontSize: '32px',
          marginBottom: '16px',
          lineHeight: 1,
        }}
      >
        {icon}
      </div>
      <h2
        style={{
          fontSize: '17px',
          fontWeight: 700,
          color: '#e2e8f0',
          marginBottom: '10px',
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontSize: '14px',
          color: '#64748b',
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>
    </article>
  );
}
