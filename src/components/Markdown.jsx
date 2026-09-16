// Simple markdown renderer — supports:
// # H1, ## H2, ### H3
// **bold**, *italic*
// - bullet lists
// blank lines = paragraph breaks

const MUTED = "#B4B4B4";

function parseLine(line, key) {
  // Replace **bold** and *italic* inline
  const parts = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let last = 0;
  let match;
  while ((match = regex.exec(line)) !== null) {
    if (match.index > last) parts.push(line.slice(last, match.index));
    if (match[2]) parts.push(<strong key={match.index}>{match[2]}</strong>);
    else if (match[3]) parts.push(<em key={match.index}>{match[3]}</em>);
    last = match.index + match[0].length;
  }
  if (last < line.length) parts.push(line.slice(last));
  return parts;
}

export default function Markdown({ text, style = {} }) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let bulletBuffer = [];
  let i = 0;

  const flushBullets = () => {
    if (bulletBuffer.length) {
      elements.push(
        <ul key={`ul-${i}`} style={{ margin: '8px 0', paddingLeft: 20 }}>
          {bulletBuffer.map((b, j) => (
            <li key={j} style={{ marginBottom: 4 }}>{parseLine(b)}</li>
          ))}
        </ul>
      );
      bulletBuffer = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('### ')) {
      flushBullets();
      elements.push(<h3 key={i} style={{ fontSize: 16, fontWeight: 600, margin: '16px 0 6px', color: '#000' }}>{parseLine(trimmed.slice(4))}</h3>);
    } else if (trimmed.startsWith('## ')) {
      flushBullets();
      elements.push(<h2 key={i} style={{ fontSize: 18, fontWeight: 600, margin: '20px 0 8px', color: '#000' }}>{parseLine(trimmed.slice(3))}</h2>);
    } else if (trimmed.startsWith('# ')) {
      flushBullets();
      elements.push(<h1 key={i} style={{ fontSize: 22, fontWeight: 600, margin: '24px 0 10px', color: '#000' }}>{parseLine(trimmed.slice(2))}</h1>);
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      bulletBuffer.push(trimmed.slice(2));
    } else if (trimmed === '') {
      flushBullets();
      elements.push(<div key={i} style={{ height: 8 }} />);
    } else {
      flushBullets();
      elements.push(<p key={i} style={{ margin: '0 0 6px' }}>{parseLine(trimmed)}</p>);
    }
    i++;
  }
  flushBullets();

  return (
    <div style={{ fontSize: 15, lineHeight: 1.8, color: MUTED, ...style }}>
      {elements}
    </div>
  );
}
