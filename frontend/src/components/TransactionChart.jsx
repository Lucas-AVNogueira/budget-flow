function toDay(dateStr) {
  const [, , day] = dateStr.split('-');
  return Number(day);
}

function sumByDay(transactions, type, daysInMonth) {
  const result = Array.from({ length: daysInMonth }, () => 0);

  transactions.forEach((item) => {
    if (item.tipo !== type) return;
    const day = toDay(item.data);
    if (day >= 1 && day <= daysInMonth) {
      result[day - 1] += Number(item.valor);
    }
  });

  return result;
}

function buildLinePath(series, chartHeight, maxValue, left, top, stepX) {
  return series
    .map((value, index) => {
      const x = left + (index * stepX) + (stepX / 2);
      const y = top + chartHeight - ((value / maxValue) * chartHeight);
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

function monthAbbr(month) {
  const names = {
    1: 'Jan',
    2: 'Fev',
    3: 'Mar',
    4: 'Abr',
    5: 'Mai',
    6: 'Jun',
    7: 'Jul',
    8: 'Ago',
    9: 'Set',
    10: 'Out',
    11: 'Nov',
    12: 'Dez',
  };

  return names[month] || '';
}

export default function TransactionChart({ transactions, mes, ano }) {
  const daysInMonth = new Date(ano, mes, 0).getDate();
  const entradas = sumByDay(transactions, 'ENTRADA', daysInMonth);
  const despesas = sumByDay(transactions, 'SAIDA', daysInMonth);

  const width = 940;
  const height = 220;
  const margin = { top: 20, right: 16, bottom: 36, left: 36 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const stepX = chartWidth / daysInMonth;

  const maxValue = Math.max(1, ...entradas, ...despesas);
  const linePath = buildLinePath(entradas, chartHeight, maxValue, margin.left, margin.top, stepX);
  const yTicks = [0, 0.25, 0.5, 0.75, 1];
  const labels = [1, 5, 10, 15, 20, 25, 30].filter((day) => day <= daysInMonth);

  return (
    <div className="tx-chart-wrap">
      <div className="tx-chart-legend">
        <span className="tx-chart-legend-item">
          <span className="tx-chart-dot tx-chart-dot-entrada" /> Entradas
        </span>
        <span className="tx-chart-legend-item">
          <span className="tx-chart-dot tx-chart-dot-despesa" /> Despesas
        </span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="tx-chart" role="img" aria-label="Grafico de transacoes">
        {yTicks.map((tick) => {
          const y = margin.top + chartHeight - (chartHeight * tick);
          return (
            <g key={`grid-${tick}`}>
              <line x1={margin.left} y1={y} x2={width - margin.right} y2={y} className="tx-grid" />
              <text x={8} y={y + 4} className="tx-axis-label">
                {Math.round(maxValue * tick)}
              </text>
            </g>
          );
        })}

        {entradas.map((value, index) => {
          const x = margin.left + (index * stepX) + (stepX / 2);
          const barHeight = (value / maxValue) * chartHeight;
          const y = margin.top + chartHeight - barHeight;
          return (
            <rect
              key={`e-${index}`}
              x={x - 8}
              y={y}
              width={6.5}
              height={Math.max(0, barHeight)}
              rx={1.4}
              className="tx-bar-entrada"
            />
          );
        })}

        {despesas.map((value, index) => {
          const x = margin.left + (index * stepX) + (stepX / 2);
          const barHeight = (value / maxValue) * chartHeight;
          const y = margin.top + chartHeight - barHeight;
          return (
            <rect
              key={`d-${index}`}
              x={x + 1.5}
              y={y}
              width={6.5}
              height={Math.max(0, barHeight)}
              rx={1.4}
              className="tx-bar-despesa"
            />
          );
        })}

        <path d={linePath} className="tx-line" />

        {entradas.map((value, index) => {
          if (index % 5 !== 0 && index !== daysInMonth - 1) return null;
          const x = margin.left + (index * stepX) + (stepX / 2);
          const y = margin.top + chartHeight - ((value / maxValue) * chartHeight);
          return <circle key={`p-${index}`} cx={x} cy={y} r="3" className="tx-line-point" />;
        })}

        {labels.map((day) => {
          const x = margin.left + ((day - 1) * stepX) + (stepX / 2);
          return (
            <text key={`x-${day}`} x={x} y={height - 12} textAnchor="middle" className="tx-axis-label">
              {String(day).padStart(2, '0')} {monthAbbr(mes)}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
