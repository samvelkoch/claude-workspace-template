
// ===== chat-shell.jsx =====
// Shared chat shell components

function Icon({ name, size = 14, color = 'currentColor' }) {
  const s = size;
  const stroke = { width: 1.5, color, fill: 'none', linecap: 'round', linejoin: 'round' };
  const props = {
    width: s, height: s, viewBox: '0 0 24 24', fill: 'none',
    stroke: color, strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round',
    style: { display: 'block', flexShrink: 0 },
  };
  switch (name) {
    case 'paperclip':
      return <svg {...props}><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.49"/></svg>;
    case 'send':
      return <svg {...props}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
    case 'arrow-up':
      return <svg {...props}><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>;
    case 'check':
      return <svg {...props}><polyline points="20 6 9 17 4 12"/></svg>;
    case 'chevron-right':
      return <svg {...props}><polyline points="9 18 15 12 9 6"/></svg>;
    case 'chevron-down':
      return <svg {...props}><polyline points="6 9 12 15 18 9"/></svg>;
    case 'chevron-left':
      return <svg {...props}><polyline points="15 18 9 12 15 6"/></svg>;
    case 'play':
      return <svg {...props}><polygon points="5 3 19 12 5 21 5 3"/></svg>;
    case 'download':
      return <svg {...props}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
    case 'link':
      return <svg {...props}><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>;
    case 'copy':
      return <svg {...props}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>;
    case 'external':
      return <svg {...props}><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>;
    case 'sparkle':
      return <svg {...props}><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>;
    case 'search':
      return <svg {...props}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
    case 'file':
      return <svg {...props}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
    case 'table':
      return <svg {...props}><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg>;
    case 'chart':
      return <svg {...props}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
    case 'slides':
      return <svg {...props}><rect x="2" y="4" width="20" height="14" rx="1"/><line x1="8" y1="22" x2="16" y2="22"/><line x1="12" y1="18" x2="12" y2="22"/></svg>;
    case 'plus':
      return <svg {...props}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    case 'minus':
      return <svg {...props}><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    case 'square':
      return <svg {...props}><rect x="4" y="4" width="16" height="16" rx="2"/></svg>;
    case 'square-check':
      return <svg {...props}><rect x="4" y="4" width="16" height="16" rx="2"/><polyline points="9 12 11 14 15 10"/></svg>;
    case 'square-dash':
      return <svg {...props}><rect x="4" y="4" width="16" height="16" rx="2"/><line x1="8" y1="12" x2="16" y2="12"/></svg>;
    case 'circle':
      return <svg {...props}><circle cx="12" cy="12" r="9"/></svg>;
    case 'circle-dot':
      return <svg {...props}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3" fill={color}/></svg>;
    case 'cmd':
      return <svg {...props}><path d="M18 3a3 3 0 00-3 3v12a3 3 0 003 3 3 3 0 003-3 3 3 0 00-3-3H6a3 3 0 00-3 3 3 3 0 003 3 3 3 0 003-3V6a3 3 0 00-3-3 3 3 0 00-3 3 3 3 0 003 3h12a3 3 0 003-3 3 3 0 00-3-3z"/></svg>;
    case 'list':
      return <svg {...props}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
    case 'tree':
      return <svg {...props}><circle cx="6" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="12" r="2"/><path d="M8 6h4a4 4 0 014 4v0M8 18h4a4 4 0 004-4v0"/></svg>;
    case 'wand':
      return <svg {...props}><path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8l1.4 1.4M17.8 6.2l1.4-1.4M3 21l9-9M12.2 6.2l-1.4-1.4"/></svg>;
    case 'bolt':
      return <svg {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
    case 'doc':
      return <svg {...props}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>;
    case 'users':
      return <svg {...props}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
    case 'briefcase':
      return <svg {...props}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>;
    case 'gauge':
      return <svg {...props}><path d="M2 12a10 10 0 1019-4"/><path d="M12 12l4-4"/></svg>;
    case 'flag':
      return <svg {...props}><path d="M4 22V4a1 1 0 011-1h12l-3 5 3 5H5"/></svg>;
    case 'spark':
      return <svg {...props}><path d="M12 2l1.5 5L19 8l-4 3.5L16 17l-4-3-4 3 1-5.5L5 8l5.5-1L12 2z"/></svg>;
    case 'x':
      return <svg {...props}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
    case 'eye':
      return <svg {...props}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
    case 'edit':
      return <svg {...props}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;
    case 'rocket':
      return <svg {...props}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/></svg>;
    default:
      return null;
  }
}

function Avatar({ kind = 'assistant' }) {
  return (
    <div className={`avatar ${kind}`}>
      {kind === 'assistant' ? 'T2D' : 'Я'}
    </div>
  );
}

function Message({ from = 'assistant', name, stamp, children }) {
  const displayName = name || (from === 'assistant' ? 'Talk2Data' : 'Вы');
  return (
    <div className="msg">
      <Avatar kind={from} />
      <div className="body">
        <div className="name">
          <strong>{displayName}</strong>
          {stamp && <span className="stamp">{stamp}</span>}
        </div>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}

function FileChip({ name = 'travel_q3_2026.xlsx', meta = '34 218 строк · 127 колонок · 8.4 MB' }) {
  return (
    <div className="file-chip">
      <div className="icon">XLS</div>
      <div className="info">
        <div className="name">{name}</div>
        <div className="sub">{meta}</div>
      </div>
    </div>
  );
}

function ChatShell({ title = 'Travel BR Q3', meta = 'qwen-72b · 12 сообщений', children, hideComposer = false, composerValue = '', composerPlaceholder = 'Спросите что-нибудь о данных...' }) {
  return (
    <div className="chat">
      <div className="chat-head">
        <div className="title">
          <span className="dot"></span>
          <span><strong>Talk2Data</strong> · {title}</span>
        </div>
        <div className="meta">{meta}</div>
      </div>
      <div className="chat-body">
        <div className="chat-feed">
          {children}
        </div>
      </div>
      {!hideComposer && (
        <div className="chat-foot">
          <div className="composer">
            <span className="clip"><Icon name="paperclip" size={16} color="currentColor" /></span>
            <input placeholder={composerPlaceholder} value={composerValue} readOnly />
            <button className="send" tabIndex={-1}><Icon name="arrow-up" size={14} color="white" /></button>
          </div>
        </div>
      )}
    </div>
  );
}

// Fake plotly-style bar chart in SVG
function FakeBars({ data, accent = 'var(--accent)', width = '100%', height = 180 }) {
  const max = Math.max(...data.map(d => d.v));
  return (
    <svg viewBox={`0 0 320 ${height}`} preserveAspectRatio="none" width={width} height={height} style={{ display: 'block' }}>
      {/* gridlines */}
      {[0.25, 0.5, 0.75, 1].map((p, i) => (
        <line key={i} x1="40" x2="316" y1={height - 24 - p * (height - 40)} y2={height - 24 - p * (height - 40)} stroke="var(--line)" strokeDasharray="2 3" />
      ))}
      {/* y-axis labels */}
      {[0.25, 0.5, 0.75, 1].map((p, i) => (
        <text key={i} x="36" y={height - 21 - p * (height - 40)} fontFamily="JetBrains Mono" fontSize="9" fill="var(--fg-3)" textAnchor="end">{Math.round(max * p / 1000)}k</text>
      ))}
      {/* bars */}
      {data.map((d, i) => {
        const bw = (316 - 40) / data.length - 6;
        const bh = (d.v / max) * (height - 40);
        const x = 40 + i * ((316 - 40) / data.length) + 3;
        const y = height - 24 - bh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={bh} fill={accent} opacity={0.85} />
            <text x={x + bw / 2} y={height - 10} fontFamily="JetBrains Mono" fontSize="9" fill="var(--fg-3)" textAnchor="middle">{d.l}</text>
          </g>
        );
      })}
    </svg>
  );
}

function FakeLine({ data, accent = 'var(--accent)', height = 180 }) {
  const max = Math.max(...data.map(d => d.v));
  const min = Math.min(...data.map(d => d.v));
  const w = 320, h = height, padL = 40, padR = 8, padT = 12, padB = 24;
  const pts = data.map((d, i) => {
    const x = padL + (i / (data.length - 1)) * (w - padL - padR);
    const y = padT + (1 - (d.v - min) / (max - min)) * (h - padT - padB);
    return [x, y];
  });
  const path = pts.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ');
  const area = path + ` L ${pts[pts.length - 1][0]} ${h - padB} L ${pts[0][0]} ${h - padB} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" width="100%" height={h} style={{ display: 'block' }}>
      {[0.25, 0.5, 0.75, 1].map((p, i) => (
        <line key={i} x1={padL} x2={w - padR} y1={padT + p * (h - padT - padB)} y2={padT + p * (h - padT - padB)} stroke="var(--line)" strokeDasharray="2 3" />
      ))}
      <path d={area} fill={accent} opacity="0.12" />
      <path d={path} fill="none" stroke={accent} strokeWidth="1.5" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="2.5" fill={accent} />)}
      {data.map((d, i) => {
        const x = padL + (i / (data.length - 1)) * (w - padL - padR);
        return <text key={i} x={x} y={h - 8} fontFamily="JetBrains Mono" fontSize="9" fill="var(--fg-3)" textAnchor="middle">{d.l}</text>;
      })}
    </svg>
  );
}

Object.assign(window, { Icon, Avatar, Message, FileChip, ChatShell, FakeBars, FakeLine });

// ===== 00-talk2data.jsx =====
// Section 0: Talk2Data — free chat with Excel
// Single hero artboard showing question -> markdown table + Plotly chart

function TalkToData() {
  const rows = [
    { dest: 'Москва — Санкт-Петербург', cnt: 4218, sum: '78 412 304', share: 23.4, dlt: '+12.1%' },
    { dest: 'Москва — Казань', cnt: 1842, sum: '31 048 122', share: 9.3, dlt: '+4.7%' },
    { dest: 'Москва — Краснодар', cnt: 1604, sum: '24 188 410', share: 7.2, dlt: '−2.3%', neg: true },
    { dest: 'Москва — Сочи', cnt: 1287, sum: '18 904 022', share: 5.6, dlt: '+18.4%' },
    { dest: 'СПб — Москва', cnt: 1106, sum: '17 220 800', share: 5.1, dlt: '+3.2%' },
    { dest: 'Москва — Новосибирск', cnt: 922, sum: '14 088 311', share: 4.2, dlt: '+0.8%' },
  ];
  return (
    <div className="artboard">
      <ChatShell title="Travel BR Q3" meta="qwen-72b · Talk2Data">
        <Message from="user" stamp="14:18">
          <p>Покажи топ-10 направлений по сумме и динамику в месяцах.</p>
        </Message>
        <Message from="assistant" stamp="14:18">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: '6px 10px', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 4, width: 'fit-content' }}>
            <Icon name="bolt" size={11} color="var(--accent)" />
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-2)' }}>tool: query_excel</span>
            <span className="mono dim" style={{ fontSize: 10 }}>· 1.2s · 34 218 → 6 строк</span>
          </div>
          <p>Топ-6 из 142 направлений по сумме за Q3:</p>
          <table className="md-table">
            <thead>
              <tr>
                <th>Направление</th>
                <th style={{ textAlign: 'right' }}>Кол-во</th>
                <th style={{ textAlign: 'right' }}>Сумма, ₽</th>
                <th style={{ textAlign: 'right' }}>Доля</th>
                <th style={{ textAlign: 'right' }}>vs Q2</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>{r.dest}</td>
                  <td className="num">{r.cnt.toLocaleString('ru')}</td>
                  <td className="num">{r.sum}</td>
                  <td className="num">{r.share}%</td>
                  <td className="num" style={{ color: r.neg ? 'var(--accent)' : 'var(--green)' }}>{r.dlt}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="plot" style={{ marginTop: 14 }}>
            <div className="plot-head">
              <div className="plot-title">Динамика расходов · Москва — СПб</div>
              <div className="plot-meta">plotly · iframe</div>
            </div>
            <FakeLine data={[
              { l: 'Июл 1', v: 22.4 }, { l: 'Июл 15', v: 25.1 }, { l: 'Авг 1', v: 28.3 },
              { l: 'Авг 15', v: 24.8 }, { l: 'Сен 1', v: 30.6 }, { l: 'Сен 15', v: 33.2 }, { l: 'Сен 30', v: 31.4 },
            ]} height={170} />
          </div>

          <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button className="chip"><Icon name="sparkle" size={10} color="var(--fg-3)" />Разбей по сегментам</button>
            <button className="chip"><Icon name="sparkle" size={10} color="var(--fg-3)" />Аномалии в этих маршрутах</button>
            <button className="chip"><Icon name="doc" size={10} color="var(--accent)" />В Business Review</button>
          </div>
        </Message>
      </ChatShell>
    </div>
  );
}

Object.assign(window, { TalkToData });

// ===== 01-entry.jsx =====
// Section 1: Entry point — choosing scenario after Excel upload
// 3 variants: A) Big cards in chat, B) Chip suggestions, C) Numbered markdown menu

function EntryA() {
  return (
    <div className="artboard">
      <ChatShell title="Новая сессия" meta="qwen-72b · 2 сообщения">
        <Message from="user" stamp="14:02">
          <FileChip name="travel_q3_2026.xlsx" meta="34 218 строк · 127 колонок" />
          <p>Загрузил отчёт за Q3 — 4 региона.</p>
        </Message>
        <Message from="assistant" stamp="14:02">
          <p>Файл распарсен. Распознал колонки: <span className="md-code">сегмент</span>, <span className="md-code">направление</span>, <span className="md-code">сумма</span>, <span className="md-code">дата</span> и ещё 123. С чего начнём?</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 12 }}>
            {[
              { i: 'spark', t: 'Спросить данные', s: 'Свободный диалог. Ответ — таблица + график.', tag: 'Talk2Data' },
              { i: 'doc', t: 'Собрать Business Review', s: 'Шаблоны, интервью или каталог вопросов.', tag: 'BR', primary: true },
              { i: 'eye', t: 'Просто посмотреть', s: 'Превью первых 50 строк и сводка.', tag: 'Preview' },
            ].map((c, i) => (
              <div key={i} style={{
                background: c.primary ? 'var(--accent-soft)' : 'var(--bg-1)',
                border: `1px solid ${c.primary ? 'var(--accent-line)' : 'var(--line)'}`,
                borderRadius: 6, padding: '14px 14px 12px', cursor: 'pointer',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 4, background: c.primary ? 'var(--accent)' : 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={c.i} size={14} color={c.primary ? '#fff' : 'var(--fg-2)'} />
                  </div>
                  <span className="mono" style={{ fontSize: 9, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.tag}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{c.t}</div>
                <div style={{ fontSize: 11.5, color: 'var(--fg-2)', lineHeight: 1.45 }}>{c.s}</div>
              </div>
            ))}
          </div>
          <p className="dim" style={{ fontSize: 11.5, marginTop: 12 }}>Подсказка: можно просто задать вопрос — я разберусь сам.</p>
        </Message>
      </ChatShell>
    </div>
  );
}

function EntryB() {
  const suggestions = [
    'Топ-10 направлений по расходам',
    'Динамика транзакций по месяцам',
    'Сравнить авиа и ж/д за период',
    'Собрать BR за Q3 для CFO',
  ];
  return (
    <div className="artboard">
      <ChatShell title="Новая сессия" meta="qwen-72b">
        <Message from="user" stamp="14:02">
          <FileChip />
          <p>Загрузил Q3.</p>
        </Message>
        <Message from="assistant" stamp="14:02">
          <p>Готово. <strong>34 218 строк</strong>, период <span className="mono dim">2026-07-01 → 2026-09-30</span>. Самое популярное на этих данных:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {suggestions.map((s, i) => (
              <button key={i} className="chip">
                <Icon name="sparkle" size={11} color="var(--accent)" />
                {s}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
            <div style={{ fontSize: 11, color: 'var(--fg-3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Или собрать Business Review</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button className="chip active"><Icon name="doc" size={11} color="var(--accent)" />Шаблонный</button>
              <button className="chip"><Icon name="users" size={11} color="var(--fg-3)" />Интервью</button>
              <button className="chip"><Icon name="list" size={11} color="var(--fg-3)" />Каталог вопросов</button>
            </div>
          </div>
        </Message>
      </ChatShell>
    </div>
  );
}

function EntryC() {
  return (
    <div className="artboard">
      <ChatShell title="Новая сессия" meta="qwen-72b">
        <Message from="user" stamp="14:02">
          <FileChip />
        </Message>
        <Message from="assistant" stamp="14:02">
          <p>Парсинг завершён. <strong>34 218 строк</strong>, <strong>127 колонок</strong>. Что делаем?</p>
          <div className="mono" style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 4, padding: '12px 14px', fontSize: 12.5, lineHeight: 1.9, marginTop: 10 }}>
            <div><span style={{ color: 'var(--accent)' }}>1.</span> Talk2Data <span className="dim">— свободные вопросы по данным</span></div>
            <div><span style={{ color: 'var(--accent)' }}>2.</span> Business Review <span className="dim">— готовая аналитика</span></div>
            <div style={{ paddingLeft: 18 }}><span className="dim">2.1</span> Шаблон <span className="dim">— Executive / Operational / Client</span></div>
            <div style={{ paddingLeft: 18 }}><span className="dim">2.2</span> Интервью <span className="dim">— LLM спросит детали</span></div>
            <div style={{ paddingLeft: 18 }}><span className="dim">2.3</span> Каталог <span className="dim">— выбор готовых вопросов</span></div>
          </div>
          <p className="dim" style={{ fontSize: 12, marginTop: 10 }}>Введите номер (например, <span className="md-code">2.1</span>) или просто опишите задачу словами.</p>
        </Message>
        <Message from="user" stamp="14:03">
          <p className="mono" style={{ fontSize: 13 }}>2.1</p>
        </Message>
      </ChatShell>
    </div>
  );
}

Object.assign(window, { EntryA, EntryB, EntryC });

// ===== 02-template.jsx =====
// Section 2: Templated BR (2.1) — 2 variants
// A) Carousel of 3 large template cards inline in chat
// B) Compact list with hover-preview thumbnail panel

function TemplateA() {
  const tpls = [
    { code: 'EXEC', t: 'Executive Summary', s: 'Коротко для топ-менеджмента. KPI, отклонения, риски.', slides: 8, time: '~30 сек', primary: true },
    { code: 'OPS', t: 'Operational Review', s: 'Детальная операционка: воронка, поставщики, аномалии.', slides: 18, time: '~1 мин' },
    { code: 'CLI', t: 'Client Presentation', s: 'Клиентоориентированный отчёт. Достижения, экономия.', slides: 12, time: '~45 сек' },
  ];
  return (
    <div className="artboard">
      <ChatShell title="Travel BR Q3" meta="Шаблонный BR">
        <Message from="user" stamp="14:05"><p>Шаблонный BR.</p></Message>
        <Message from="assistant" stamp="14:05">
          <p>Выберите шаблон. Все три используют ваши данные за <span className="md-code">2026-07-01 → 2026-09-30</span>.</p>
          <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
            {tpls.map((t, i) => (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: '52px 1fr auto',
                gap: 14,
                alignItems: 'center',
                background: t.primary ? 'var(--accent-soft)' : 'var(--bg-1)',
                border: `1px solid ${t.primary ? 'var(--accent-line)' : 'var(--line)'}`,
                borderRadius: 6, padding: 14, cursor: 'pointer',
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 4,
                  background: t.primary ? 'var(--accent)' : 'var(--bg-3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                  color: t.primary ? '#fff' : 'var(--fg-2)',
                }}>{t.code}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 3 }}>{t.t}</div>
                  <div style={{ fontSize: 12, color: 'var(--fg-2)', lineHeight: 1.45 }}>{t.s}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--fg-3)', marginTop: 6, letterSpacing: '0.04em' }}>
                    {t.slides} слайдов · {t.time}
                  </div>
                </div>
                <button className={`btn ${t.primary ? 'primary' : ''}`} style={{ flexShrink: 0 }}>
                  Выбрать
                  <Icon name="chevron-right" size={12} color={t.primary ? '#fff' : 'var(--fg-2)'} />
                </button>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="dim" style={{ fontSize: 11.5 }}>Не подходит? <span style={{ color: 'var(--accent)', cursor: 'pointer' }}>Перейти к интервью</span> или <span style={{ color: 'var(--accent)', cursor: 'pointer' }}>каталогу вопросов</span>.</span>
          </div>
        </Message>
      </ChatShell>
    </div>
  );
}

function TemplateB() {
  return (
    <div className="artboard">
      <ChatShell title="Travel BR Q3" meta="Шаблонный BR">
        <Message from="user" stamp="14:05"><p>Шаблонный BR.</p></Message>
        <Message from="assistant" stamp="14:05">
          <p>3 шаблона для ваших данных:</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 14, marginTop: 12, border: '1px solid var(--line)', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ background: 'var(--bg-1)' }}>
              {[
                { t: 'Executive Summary', s: 'Для CFO/COO · 8 слайдов', active: true },
                { t: 'Operational Review', s: 'Для travel-менеджеров · 18 слайдов' },
                { t: 'Client Presentation', s: 'Для клиента · 12 слайдов' },
                { t: 'Quarterly Trends', s: 'Динамика · 10 слайдов' },
              ].map((t, i) => (
                <div key={i} style={{
                  padding: '12px 14px',
                  borderBottom: i < 3 ? '1px solid var(--line)' : 'none',
                  borderLeft: t.active ? '2px solid var(--accent)' : '2px solid transparent',
                  background: t.active ? 'var(--bg-2)' : 'transparent',
                  cursor: 'pointer',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{t.t}</div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>{t.s}</div>
                </div>
              ))}
            </div>
            {/* preview pane */}
            <div style={{ background: 'var(--bg-2)', padding: 12, borderLeft: '1px solid var(--line)' }}>
              <div className="mono" style={{ fontSize: 9.5, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Preview · slide 1/8</div>
              <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 3, aspectRatio: '16/10', padding: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ height: 6, width: '40%', background: 'var(--accent)' }}></div>
                <div style={{ height: 8, width: '85%', background: 'var(--fg-2)', opacity: 0.4, borderRadius: 1 }}></div>
                <div style={{ height: 4, width: '60%', background: 'var(--fg-3)', opacity: 0.4, borderRadius: 1 }}></div>
                <div style={{ flex: 1, marginTop: 4, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                  <div style={{ background: 'var(--bg-3)', borderRadius: 1 }}></div>
                  <div style={{ background: 'var(--bg-3)', borderRadius: 1 }}></div>
                </div>
              </div>
              <div style={{ marginTop: 8, display: 'flex', gap: 4, justifyContent: 'center' }}>
                {[0,1,2,3,4,5,6,7].map(i => <div key={i} style={{ width: 14, height: 2, background: i === 0 ? 'var(--accent)' : 'var(--line-2)' }}></div>)}
              </div>
              <button className="btn primary" style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}>Сгенерировать</button>
            </div>
          </div>
        </Message>
      </ChatShell>
    </div>
  );
}

Object.assign(window, { TemplateA, TemplateB });

// ===== 03-interview.jsx =====
// Section 3: Interview mode (2.2) — 2 variants
// A) Conversational Q&A with progress dots inline
// B) Side-panel wizard with structured form steps

function InterviewA() {
  return (
    <div className="artboard">
      <ChatShell title="Travel BR Q3" meta="Интервью · шаг 3/5">
        <Message from="user" stamp="14:08"><p>Интервью.</p></Message>
        <Message from="assistant" stamp="14:08">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <span className="mono" style={{ fontSize: 10, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Шаг 1 из 5 · Аудитория</span>
            <div style={{ flex: 1, display: 'flex', gap: 3 }}>
              {[1,1,0,0,0].map((s, i) => <div key={i} style={{ flex: 1, height: 2, background: s ? 'var(--accent)' : 'var(--line)' }}></div>)}
            </div>
          </div>
          <p>Кому покажете BR? Это влияет на тон и глубину детализации.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 10 }}>
            {[
              { i: 'briefcase', t: 'CFO / финансы', s: 'Цифры, отклонения, ROI' },
              { i: 'gauge', t: 'Travel-менеджер', s: 'Поставщики, операционка' },
              { i: 'users', t: 'Клиент / заказчик', s: 'Достижения, экономия' },
              { i: 'flag', t: 'Совет директоров', s: 'Стратегия, риски' },
            ].map((o, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 6, cursor: 'pointer' }}>
                <Icon name={o.i} size={15} color="var(--fg-2)" />
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>{o.t}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--fg-3)' }}>{o.s}</div>
                </div>
              </div>
            ))}
          </div>
        </Message>
        <Message from="user" stamp="14:09"><p>CFO. Отчёт идёт в правление, нужны крупные цифры и отклонения.</p></Message>
        <Message from="assistant" stamp="14:09">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <span className="mono" style={{ fontSize: 10, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Шаг 2 из 5 · Период</span>
            <div style={{ flex: 1, display: 'flex', gap: 3 }}>
              {[1,1,1,0,0].map((s, i) => <div key={i} style={{ flex: 1, height: 2, background: s ? 'var(--accent)' : 'var(--line)' }}></div>)}
            </div>
          </div>
          <p>Понял. Период — Q3 2026 (по вашему файлу). Нужно ли сравнение?</p>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            <button className="chip">Q3 vs Q2</button>
            <button className="chip active">Q3 2026 vs Q3 2025</button>
            <button className="chip">YTD</button>
            <button className="chip">Без сравнения</button>
          </div>
        </Message>
      </ChatShell>
    </div>
  );
}

function InterviewB() {
  return (
    <div className="artboard">
      <div className="chat" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', height: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, borderRight: '1px solid var(--line)' }}>
          <ChatShell title="Travel BR Q3" meta="Интервью · 3/5">
            <Message from="user" stamp="14:08"><p>Интервью.</p></Message>
            <Message from="assistant" stamp="14:08">
              <p>Открыл сайдбар-визард справа. Можно отвечать там — или прямо в чате, как удобнее. Я буду подсвечивать текущий шаг.</p>
            </Message>
            <Message from="user" stamp="14:09"><p>CFO, для правления.</p></Message>
            <Message from="assistant" stamp="14:09">
              <p><Icon name="check" size={11} color="var(--green)" /> Аудитория зафиксирована: <strong>CFO / Совет</strong>.</p>
              <p>Дальше — период. Открыл шаг 3.</p>
            </Message>
          </ChatShell>
        </div>
        {/* Side wizard */}
        <div style={{ background: 'var(--bg-1)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>Параметры BR</div>
            <span className="mono dim" style={{ fontSize: 10 }}>3 / 5</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
            {[
              { num: '01', t: 'Аудитория', v: 'CFO / Совет', done: true },
              { num: '02', t: 'Цель отчёта', v: 'Презентация в правление', done: true },
              { num: '03', t: 'Период и сравнение', active: true },
              { num: '04', t: 'Ключевые метрики', pending: true },
              { num: '05', t: 'Формат и тон', pending: true },
            ].map((s, i) => (
              <div key={i} style={{
                marginBottom: 4,
                padding: s.active ? '12px' : '10px 12px',
                background: s.active ? 'var(--bg-2)' : 'transparent',
                borderLeft: `2px solid ${s.active ? 'var(--accent)' : 'transparent'}`,
                borderRadius: '0 4px 4px 0',
                opacity: s.pending ? 0.5 : 1,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: s.v || s.active ? 6 : 0 }}>
                  <span className="mono" style={{ fontSize: 10, color: s.done ? 'var(--green)' : s.active ? 'var(--accent)' : 'var(--fg-3)' }}>
                    {s.done ? <Icon name="check" size={11} color="var(--green)" /> : s.num}
                  </span>
                  <span style={{ fontSize: 12.5, fontWeight: s.active ? 600 : 500 }}>{s.t}</span>
                </div>
                {s.v && <div style={{ fontSize: 11.5, color: 'var(--fg-2)', paddingLeft: 18 }}>{s.v}</div>}
                {s.active && (
                  <div style={{ marginTop: 8, paddingLeft: 18 }}>
                    <div style={{ fontSize: 11, color: 'var(--fg-2)', marginBottom: 8 }}>Период из файла: <span className="mono">2026-07-01 → 2026-09-30</span></div>
                    <div style={{ fontSize: 11, color: 'var(--fg-3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Сравнение</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {['Q3 vs Q2 2026', 'Q3 2026 vs Q3 2025', 'YTD', 'Без сравнения'].map((o, j) => (
                        <label key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer', padding: '4px 0' }}>
                          <Icon name={j === 1 ? 'circle-dot' : 'circle'} size={13} color={j === 1 ? 'var(--accent)' : 'var(--fg-3)'} />
                          {o}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ padding: 12, borderTop: '1px solid var(--line)', display: 'flex', gap: 8 }}>
            <button className="btn ghost"><Icon name="chevron-left" size={11} color="var(--fg-2)" />Назад</button>
            <button className="btn primary" style={{ flex: 1, justifyContent: 'center' }}>Дальше<Icon name="chevron-right" size={11} color="#fff" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { InterviewA, InterviewB });

// ===== 04-catalog.jsx =====
// Section 4: Question catalog (2.3) — 3 variants
// A) Tree with checkboxes inline in chat
// B) Step wizard (category → subcategory → questions)
// C) Command palette / search-driven

function CatalogA() {
  const tree = [
    {
      cat: 'Финансы', icon: 'briefcase', open: true, items: [
        { t: 'Топ направлений по расходам', checked: true },
        { t: 'Динамика расходов по месяцам', checked: true },
        { t: 'Отклонение от бюджета', checked: false },
        { t: 'Средний чек по сегментам', checked: false },
      ]
    },
    {
      cat: 'Операционка', icon: 'gauge', open: true, items: [
        { t: 'Доля авиа vs ж/д', checked: true },
        { t: 'Топ поставщиков по объёму', checked: false },
        { t: 'Аномалии в транзакциях', checked: false },
      ]
    },
    { cat: 'Клиентский профиль', icon: 'users', open: false, count: 6 },
    { cat: 'Эффективность', icon: 'spark', open: false, count: 4 },
  ];
  return (
    <div className="artboard">
      <ChatShell title="Travel BR Q3" meta="Каталог вопросов">
        <Message from="user" stamp="14:11"><p>Каталог вопросов.</p></Message>
        <Message from="assistant" stamp="14:11">
          <p>Выберите вопросы, которые войдут в BR. Я подсказываю, что обычно выбирают для такого датасета.</p>
          <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 6, marginTop: 12, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid var(--line)', background: 'var(--bg-2)' }}>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-2)', letterSpacing: '0.04em' }}>
                <span style={{ color: 'var(--accent)' }}>5</span> / 21 выбрано
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button className="btn ghost" style={{ padding: '4px 8px', fontSize: 11 }}>Снять всё</button>
                <button className="btn ghost" style={{ padding: '4px 8px', fontSize: 11 }}>Рекомендованные</button>
              </div>
            </div>
            {tree.map((g, i) => (
              <div key={i} style={{ borderBottom: i < tree.length - 1 ? '1px solid var(--line)' : 'none' }}>
                <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: g.open ? 'transparent' : 'var(--bg-1)' }}>
                  <Icon name={g.open ? 'chevron-down' : 'chevron-right'} size={12} color="var(--fg-3)" />
                  <Icon name={g.icon} size={13} color="var(--fg-2)" />
                  <span style={{ fontSize: 12.5, fontWeight: 600 }}>{g.cat}</span>
                  {!g.open && <span className="mono dim" style={{ fontSize: 10 }}>{g.count} вопросов</span>}
                  {g.open && (
                    <span className="mono" style={{ fontSize: 10, color: 'var(--accent)', marginLeft: 'auto' }}>
                      {g.items.filter(x => x.checked).length} / {g.items.length}
                    </span>
                  )}
                </div>
                {g.open && (
                  <div style={{ paddingBottom: 6 }}>
                    {g.items.map((it, j) => (
                      <label key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px 6px 38px', cursor: 'pointer', fontSize: 12.5 }}>
                        <Icon name={it.checked ? 'square-check' : 'square'} size={14} color={it.checked ? 'var(--accent)' : 'var(--fg-3)'} />
                        <span style={{ color: it.checked ? 'var(--fg)' : 'var(--fg-2)' }}>{it.t}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'flex-end' }}>
            <span className="dim" style={{ fontSize: 11.5 }}>~12 слайдов · ~45 сек</span>
            <button className="btn primary">Сгенерировать BR<Icon name="chevron-right" size={11} color="#fff" /></button>
          </div>
        </Message>
      </ChatShell>
    </div>
  );
}

function CatalogB() {
  return (
    <div className="artboard">
      <ChatShell title="Travel BR Q3" meta="Каталог · шаг 2/3">
        <Message from="user" stamp="14:11"><p>Каталог вопросов.</p></Message>
        <Message from="assistant" stamp="14:11">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <span className="mono" style={{ fontSize: 10, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Шаг 1: категории</span>
          </div>
          <p>Что входит в обзор?</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 10 }}>
            {[
              { i: 'briefcase', t: 'Финансы', s: '8 вопросов', on: true },
              { i: 'gauge', t: 'Операционка', s: '6 вопросов', on: true },
              { i: 'users', t: 'Клиентский профиль', s: '6 вопросов', on: false },
              { i: 'spark', t: 'Эффективность', s: '4 вопроса', on: false },
            ].map((c, i) => (
              <div key={i} style={{
                padding: 12, background: c.on ? 'var(--accent-soft)' : 'var(--bg-1)',
                border: `1px solid ${c.on ? 'var(--accent-line)' : 'var(--line)'}`,
                borderRadius: 6, cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center',
              }}>
                <Icon name={c.on ? 'square-check' : 'square'} size={14} color={c.on ? 'var(--accent)' : 'var(--fg-3)'} />
                <Icon name={c.i} size={14} color="var(--fg-2)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>{c.t}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--fg-3)' }}>{c.s}</div>
                </div>
              </div>
            ))}
          </div>
        </Message>
        <Message from="user" stamp="14:12"><p>Финансы и операционка.</p></Message>
        <Message from="assistant" stamp="14:12">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <span className="mono" style={{ fontSize: 10, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Шаг 2: вопросы — финансы</span>
          </div>
          <p>14 вопросов. Выберите нужные:</p>
          <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 6, marginTop: 8 }}>
            {['Топ направлений по расходам', 'Динамика по месяцам', 'Отклонение от бюджета', 'Средний чек'].map((q, i) => (
              <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: i < 3 ? '1px solid var(--line)' : 'none', cursor: 'pointer', fontSize: 12.5 }}>
                <Icon name={i < 2 ? 'square-check' : 'square'} size={14} color={i < 2 ? 'var(--accent)' : 'var(--fg-3)'} />
                <span>{q}</span>
                <span className="mono dim" style={{ fontSize: 10, marginLeft: 'auto' }}>fin_{String(i+1).padStart(3,'0')}</span>
              </label>
            ))}
          </div>
        </Message>
      </ChatShell>
    </div>
  );
}

function CatalogC() {
  return (
    <div className="artboard">
      <ChatShell title="Travel BR Q3" meta="Каталог · палитра">
        <Message from="user" stamp="14:11"><p>Каталог вопросов.</p></Message>
        <Message from="assistant" stamp="14:11">
          <p>Открыл палитру вопросов — поиск по 21 шаблону. Выбранные попадут в BR.</p>
          <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 8, marginTop: 12, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon name="search" size={14} color="var(--fg-3)" />
              <input style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--fg)', fontFamily: 'var(--font-ui)', fontSize: 13 }} value="расход" readOnly />
              <span className="kbd">Esc</span>
            </div>
            <div style={{ padding: '6px 0' }}>
              <div style={{ padding: '4px 14px', fontSize: 10, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Финансы · 4 совпадения</div>
              {[
                { t: 'Топ направлений по ра', tt: 'сходам', tail: '', on: true, hot: '↵' },
                { t: 'Динамика ра', tt: 'сходов', tail: ' по месяцам', on: true },
                { t: 'Прогноз ра', tt: 'сходов', tail: ' Q4', on: false },
                { t: 'Ра', tt: 'сход', tail: ' на ж/д vs авиа', on: false },
              ].map((q, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', background: i === 0 ? 'var(--bg-2)' : 'transparent', cursor: 'pointer', fontSize: 13 }}>
                  <Icon name={q.on ? 'square-check' : 'square'} size={13} color={q.on ? 'var(--accent)' : 'var(--fg-3)'} />
                  <span>{q.t}<span style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>{q.tt}</span>{q.tail}</span>
                  {q.hot && <span className="kbd" style={{ marginLeft: 'auto' }}>{q.hot}</span>}
                </div>
              ))}
            </div>
            <div style={{ padding: '8px 14px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-2)', fontSize: 11, color: 'var(--fg-3)' }}>
              <span><span className="mono" style={{ color: 'var(--accent)' }}>5</span> выбрано · 21 всего</span>
              <span><span className="kbd">↑↓</span> навигация · <span className="kbd">Space</span> выбрать · <span className="kbd">↵</span> готово</span>
            </div>
          </div>
        </Message>
      </ChatShell>
    </div>
  );
}

Object.assign(window, { CatalogA, CatalogB, CatalogC });

// ===== 05-presentation.jsx =====
// Section 5: Final presentation link — 3 variants
// A) Rich preview card with mini slide thumbnail
// B) Inline slide player (browse before opening)
// C) Action card with multiple export targets

function PresA() {
  return (
    <div className="artboard">
      <ChatShell title="Travel BR Q3" meta="Готово">
        <Message from="user" stamp="14:14"><p>Сделай.</p></Message>
        <Message from="assistant" stamp="14:14">
          <p>Готово — собрал <strong>Executive Summary</strong> на 8 слайдах за 27 секунд.</p>
          <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 8, marginTop: 12, overflow: 'hidden' }}>
            {/* Slide hero */}
            <div style={{ background: '#0e0e10', padding: 22, display: 'flex', flexDirection: 'column', gap: 8, borderBottom: '1px solid var(--line)' }}>
              <div className="mono" style={{ fontSize: 9.5, color: 'var(--fg-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>EXECUTIVE SUMMARY · Q3 2026</div>
              <div style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.01em' }}>Travel-расходы выросли на 14%, экономия 3.2M ₽</div>
              <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                <div>
                  <div className="mono" style={{ fontSize: 9, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Объём</div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>184.2M ₽</div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 9, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>vs Q2</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--accent)' }}>+14.1%</div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 9, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Транзакций</div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>34 218</div>
                </div>
              </div>
            </div>
            {/* slide strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 0 }}>
              {[1,2,3,4,5,6,7,8].map(n => (
                <div key={n} style={{ aspectRatio: '16/10', borderRight: n < 8 ? '1px solid var(--line)' : 'none', background: 'var(--bg-2)', padding: 6, position: 'relative' }}>
                  <div style={{ fontSize: 7, fontFamily: 'var(--font-mono)', color: 'var(--fg-3)' }}>{String(n).padStart(2,'0')}</div>
                  <div style={{ height: 2, width: '60%', background: n === 1 ? 'var(--accent)' : 'var(--fg-3)', opacity: 0.6, marginTop: 4 }}></div>
                  <div style={{ height: 2, width: '40%', background: 'var(--fg-3)', opacity: 0.4, marginTop: 2 }}></div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>travel-br-q3-2026.html</div>
                <div className="mono dim" style={{ fontSize: 10.5 }}>Marp · 8 слайдов · 412 KB · 14:14</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn"><Icon name="copy" size={12} color="var(--fg-2)" /></button>
                <button className="btn primary"><Icon name="external" size={12} color="#fff" />Открыть</button>
              </div>
            </div>
          </div>
        </Message>
      </ChatShell>
    </div>
  );
}

function PresB() {
  return (
    <div className="artboard">
      <ChatShell title="Travel BR Q3" meta="Готово · 8 слайдов">
        <Message from="user" stamp="14:14"><p>Сделай.</p></Message>
        <Message from="assistant" stamp="14:14">
          <p>Готово. Полистайте превью или откройте на весь экран.</p>
          <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 8, marginTop: 12, overflow: 'hidden' }}>
            <div style={{ background: '#0e0e10', aspectRatio: '16/9', padding: 22, display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <div className="mono" style={{ fontSize: 9.5, color: 'var(--fg-3)', letterSpacing: '0.08em' }}>03 · ТОП НАПРАВЛЕНИЙ</div>
              <div style={{ fontSize: 17, fontWeight: 600, marginTop: 4, marginBottom: 12 }}>Москва — СПб удерживают 43% объёма</div>
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 3, padding: 8 }}>
                  <FakeBars data={[{l:'MOW',v:78},{l:'LED',v:62},{l:'KZN',v:31},{l:'KRR',v:24},{l:'AER',v:18},{l:'OVB',v:14}]} height={120} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
                  {[
                    {k:'Москва', v:'78.4M', p:42.6},
                    {k:'Санкт-Петербург', v:'62.1M', p:33.7},
                    {k:'Казань', v:'31.0M', p:16.8},
                  ].map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, paddingBottom: 4, borderBottom: '1px solid var(--line)' }}>
                      <span>{r.k}</span>
                      <span className="mono">{r.v}<span className="dim" style={{ marginLeft: 6 }}>{r.p}%</span></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* player controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderTop: '1px solid var(--line)', background: 'var(--bg-2)' }}>
              <button className="btn ghost" style={{ padding: '4px 6px' }}><Icon name="chevron-left" size={12} color="var(--fg-2)" /></button>
              <div style={{ flex: 1, display: 'flex', gap: 3 }}>
                {[0,0,1,0,0,0,0,0].map((s, i) => <div key={i} style={{ flex: 1, height: 3, background: s ? 'var(--accent)' : 'var(--line-2)', borderRadius: 1 }}></div>)}
              </div>
              <span className="mono dim" style={{ fontSize: 10 }}>03 / 08</span>
              <button className="btn ghost" style={{ padding: '4px 6px' }}><Icon name="chevron-right" size={12} color="var(--fg-2)" /></button>
              <div style={{ width: 1, height: 16, background: 'var(--line)' }}></div>
              <button className="btn"><Icon name="external" size={11} color="var(--fg-2)" />Развернуть</button>
            </div>
          </div>
        </Message>
      </ChatShell>
    </div>
  );
}

function PresC() {
  return (
    <div className="artboard">
      <ChatShell title="Travel BR Q3" meta="Готово">
        <Message from="user" stamp="14:14"><p>Сделай.</p></Message>
        <Message from="assistant" stamp="14:14">
          <p>BR собран. <span className="dim">8 слайдов, 412 KB, сгенерировано за 27 сек.</span></p>
          <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 6, marginTop: 12, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--line)' }}>
              <div style={{ width: 38, height: 38, borderRadius: 4, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="slides" size={18} color="#fff" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 2 }}>Executive Summary · Q3 2026</div>
                <div className="mono dim" style={{ fontSize: 10.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  /sessions/14:14/travel-br-q3-2026.html
                </div>
              </div>
              <span className="chip active" style={{ pointerEvents: 'none' }}><Icon name="check" size={10} color="var(--accent)" />Готово</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid var(--line)' }}>
              {[
                { i: 'eye', t: 'Открыть', s: 'Marp HTML', primary: true },
                { i: 'download', t: 'PDF', s: '~ 1.8 MB' },
                { i: 'download', t: 'PPTX', s: 'soon', soon: true },
                { i: 'copy', t: 'Скопировать', s: 'ссылку' },
              ].map((a, i) => (
                <div key={i} style={{
                  padding: '12px 8px', textAlign: 'center', cursor: a.soon ? 'not-allowed' : 'pointer',
                  borderRight: i < 3 ? '1px solid var(--line)' : 'none',
                  background: a.primary ? 'var(--accent-soft)' : 'transparent',
                  opacity: a.soon ? 0.4 : 1,
                }}>
                  <Icon name={a.i} size={14} color={a.primary ? 'var(--accent)' : 'var(--fg-2)'} />
                  <div style={{ fontSize: 12, fontWeight: 600, marginTop: 4 }}>{a.t}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--fg-3)', marginTop: 1 }}>{a.s}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-2)' }}>
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>
                Используется: <span style={{ color: 'var(--fg-2)' }}>5 вопросов</span> · период <span style={{ color: 'var(--fg-2)' }}>Q3 2026</span> · сравнение с Q2
              </span>
              <button className="btn ghost" style={{ padding: '2px 8px', fontSize: 11 }}>Регенерировать</button>
            </div>
          </div>
        </Message>
      </ChatShell>
    </div>
  );
}

Object.assign(window, { PresA, PresB, PresC });
