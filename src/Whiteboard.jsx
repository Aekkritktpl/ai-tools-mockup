import React from 'react';
import { css, Icon, CloseIcon, UploadIcon, FileIcon, fileSize } from './ui.jsx';

// Freeform whiteboard: AI widgets, sticky notes and labels placed anywhere,
// joined by arrows. All data and results are mock.

const TYPES = {
  ts: { ai: true, label: 'Time series forecast', short: 'Time series', tag: 'TIME SERIES', w: 420, accept: 'CSV, Parquet, XLSX', title: 'New forecast',
    models: ['Prophet', 'TimesFM 2.0', 'Chronos-Bolt', 'ARIMA (auto)', 'LSTM (2-layer)'], p: { target: 'revenue', horizon: '12 weeks' } },
  ocr: { ai: true, label: 'OCR / document reader', short: 'OCR', tag: 'OCR', w: 340, accept: 'PDF, PNG, JPG, TIFF', title: 'New document reader',
    models: ['PaddleOCR v4', 'Tesseract 5', 'TrOCR-large', 'Donut (document VQA)', 'Claude Vision'], p: { lang: 'English', conf: 80 } },
  img: { ai: true, label: 'Image classification', short: 'Image class.', tag: 'IMAGE CLASSIFICATION', w: 340, accept: 'ZIP of images, PNG, JPG', title: 'New image classifier',
    models: ['ViT-B/16', 'ResNet-50', 'EfficientNet-B3', 'CLIP (zero-shot)', 'Custom (.onnx)'], p: { conf: 60, topk: 'Top 4 classes' } },
  txt: { ai: true, label: 'Text classification', short: 'Text class.', tag: 'TEXT CLASSIFICATION', w: 420, accept: 'CSV, TXT, JSONL', title: 'New text classifier',
    models: ['XLM-RoBERTa (multilingual)', 'DistilBERT SST-2', 'BERT (fine-tuned)', 'Claude (prompted)'], p: { labels: 'Positive / Neutral / Negative' } },
  anom: { ai: true, label: 'Anomaly detection', short: 'Anomaly', tag: 'ANOMALY DETECTION', w: 380, accept: 'CSV, Parquet', title: 'New anomaly detector',
    models: ['Isolation Forest', 'Autoencoder', 'Matrix Profile (STUMPY)'], p: { conf: 90 } },
  prep: { ai: true, label: 'Clean & prepare data', short: 'Clean data', tag: 'DATA PREP', w: 340, accept: 'CSV, XLSX, Parquet', title: 'Clean data',
    models: ['Auto (checks + AI suggestions)'], p: { fmt: 'CSV' } },
  note: { ai: false, label: 'Sticky note', short: 'Sticky', tag: 'STICKY NOTE', w: 260 },
  label: { ai: false, label: 'Text', short: 'Text', tag: 'TEXT', w: 520 },
};
const NOTES = { yellow: ['Yellow', '#FFE58A'], blue: ['Blue', '#CFE3FF'], green: ['Green', '#CDEFD8'], pink: ['Pink', '#FFD3DF'] };
const STATUS = {
  empty: ['Needs data', '#EEF1F3', '#5A6670'],
  ready: ['Ready', '#E6E9F5', '#3F4C8A'],
  running: ['Running', '#FBEBD0', '#8A4F00'],
  done: ['Done', '#DDEFEA', '#0B6E5F'],
};
const PORT = 30;
const WORLD_W = 2400, WORLD_H = 1600;
const MONO = "'JetBrains Mono', ui-monospace, monospace";
const DISPLAY = "'Familjen Grotesk', 'Segoe UI', sans-serif";

export default class Whiteboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: 'edit', selected: 'c4', pending: null, zoom: 0.85, nextId: 10,
      items: [
        { id: 'l1', type: 'label', x: 60, y: 36, w: 640, text: 'Q4 store operations' },
        { id: 'n1', type: 'note', x: 60, y: 128, w: 280, color: 'yellow', text: 'Goal: forecast holiday demand and catch receipt errors before month-end close.' },
        { id: 'c1', type: 'ocr', x: 60, y: 360, w: 340, title: 'Receipt reader', file: 'receipts_oct_2026.pdf', size: '12.4 MB', model: 'PaddleOCR v4', status: 'done', p: { lang: 'English + Thai', conf: 80 } },
        { id: 'c2', type: 'ts', x: 480, y: 128, w: 420, title: 'Weekly sales forecast', file: 'pos_sales_2024_2026.csv', size: '3.8 MB', model: 'Prophet', status: 'done', p: { target: 'revenue', horizon: '12 weeks' } },
        { id: 'c3', type: 'img', x: 980, y: 128, w: 340, title: 'Product photo tagging', file: 'product_photos.zip', size: '214 MB', model: 'ViT-B/16', status: 'done', p: { conf: 60, topk: 'Top 4 classes' } },
        { id: 'c4', type: 'txt', x: 480, y: 600, w: 420, title: 'Review sentiment', file: null, size: '', model: 'XLM-RoBERTa (multilingual)', status: 'empty', p: { labels: 'Positive / Neutral / Negative' } },
        { id: 'n2', type: 'note', x: 980, y: 560, w: 260, color: 'pink', text: 'Reviews mix Thai and English. Try a multilingual model first.' },
      ],
      edges: [{ id: 'e1', from: 'c1', to: 'c2', label: 'daily totals' }],
    };
    this.timers = [];
    this.dragCard = null;
    this.dragNew = null;
    this.scroller = null;
  }

  componentWillUnmount() { this.timers.forEach((t) => clearTimeout(t)); }

  update(id, patch) {
    this.setState((s) => ({ items: s.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) }));
  }
  setP(id, key, val) {
    this.setState((s) => ({ items: s.items.map((it) => (it.id === id ? { ...it, p: { ...it.p, [key]: val } } : it)) }));
  }
  run(id) {
    const it = this.state.items.find((x) => x.id === id);
    if (!it || !it.file || it.status === 'running') return;
    this.update(id, { status: 'running' });
    this.timers.push(setTimeout(() => this.update(id, { status: 'done' }), 1400 + Math.random() * 800));
  }
  upload(id, e) {
    const f = e?.target?.files?.[0];
    if (!f) return;
    this.update(id, { file: f.name, size: fileSize(f.size), status: 'ready' });
  }
  center() {
    const z = this.state.zoom, sc = this.scroller;
    const n = this.state.items.length % 5;
    if (!sc) return { x: 200 + n * 24, y: 200 + n * 24 };
    return { x: (sc.scrollLeft + sc.clientWidth / 2) / z - 160 + n * 24, y: (sc.scrollTop + sc.clientHeight / 2) / z - 140 + n * 24 };
  }
  add(type, pos) {
    const T = TYPES[type];
    const at = pos || this.center();
    const id = 'i' + this.state.nextId;
    const snap = (v) => Math.max(0, Math.round(v / 8) * 8);
    const it = { id, type, x: snap(at.x), y: snap(at.y), w: T.w };
    if (type === 'note') { it.color = 'yellow'; it.text = 'New idea'; }
    else if (type === 'label') { it.text = 'Section title'; }
    else { Object.assign(it, { title: T.title, file: null, size: '', model: T.models[0], status: 'empty', p: { ...T.p } }); }
    this.setState((s) => ({ items: s.items.concat([it]), selected: id, nextId: s.nextId + 1 }));
  }
  duplicate(id) {
    const src = this.state.items.find((x) => x.id === id);
    if (!src) return;
    const nid = 'i' + this.state.nextId;
    const copy = { ...src, id: nid, x: src.x + 32, y: src.y + 32 };
    if (src.p) copy.p = { ...src.p };
    if (copy.title) copy.title = src.title + ' (copy)';
    this.setState((s) => ({ items: s.items.concat([copy]), selected: nid, nextId: s.nextId + 1 }));
  }
  remove(id) {
    this.setState((s) => ({
      items: s.items.filter((x) => x.id !== id),
      edges: s.edges.filter((e) => e.from !== id && e.to !== id),
      selected: s.selected === id ? null : s.selected,
      pending: s.pending === id ? null : s.pending,
    }));
  }
  connect(from, to) {
    if (!from || !to || from === to) { this.setState({ pending: null }); return; }
    this.setState((s) => {
      if (s.edges.some((e) => e.from === from && e.to === to)) return { pending: null };
      return { edges: s.edges.concat([{ id: 'e' + s.nextId, from, to, label: '' }]), nextId: s.nextId + 1, pending: null };
    });
  }
  setZoom(z) { this.setState({ zoom: Math.min(1.5, Math.max(0.4, Math.round(z * 100) / 100)) }); }

  params(it) {
    const sel = (label, key, options) => ({ kind: 'select', label, key, value: it.p[key], options, onChange: (e) => this.setP(it.id, key, e.target.value) });
    const rng = (label, key) => ({ kind: 'range', label, key, value: it.p[key], onChange: (e) => this.setP(it.id, key, Number(e.target.value)) });
    if (it.type === 'prep') return [sel('Save cleaned file as', 'fmt', ['CSV', 'Excel (.xlsx)', 'Parquet'])];
    if (it.type === 'ts') return [sel('Target column', 'target', ['revenue', 'units_sold', 'orders', 'site_visits']), sel('Forecast horizon', 'horizon', ['4 weeks', '8 weeks', '12 weeks', '26 weeks'])];
    if (it.type === 'ocr') return [sel('Document language', 'lang', ['English', 'Thai', 'English + Thai', 'Auto-detect']), rng('Review below confidence', 'conf')];
    if (it.type === 'img') return [rng('Flag below confidence', 'conf'), sel('Show', 'topk', ['Top 1 class', 'Top 3 classes', 'Top 4 classes'])];
    if (it.type === 'txt') return [sel('Label set', 'labels', ['Positive / Neutral / Negative', 'Topic: price, quality, delivery', 'Spam / Not spam', 'Custom labels…'])];
    return [rng('Sensitivity', 'conf')];
  }

  // ---------- event handlers for one item ----------
  handlers(it) {
    const isEdit = this.state.mode === 'edit';
    return {
      select: () => { if (isEdit && this.state.selected !== it.id) this.setState({ selected: it.id }); },
      down: (e) => {
        if (!isEdit || (e.button !== undefined && e.button !== 0)) return;
        try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
        this.dragCard = { id: it.id, sx: e.clientX, sy: e.clientY, ox: it.x, oy: it.y };
      },
      move: (e) => {
        const d = this.dragCard;
        if (!d || d.id !== it.id) return;
        const z = this.state.zoom;
        const nx = Math.max(0, Math.round((d.ox + (e.clientX - d.sx) / z) / 8) * 8);
        const ny = Math.max(0, Math.round((d.oy + (e.clientY - d.sy) / z) / 8) * 8);
        const cur = this.state.items.find((x) => x.id === it.id);
        if (cur && (cur.x !== nx || cur.y !== ny)) this.update(it.id, { x: nx, y: ny });
      },
      up: () => { this.dragCard = null; },
      remove: (e) => { e?.stopPropagation(); this.remove(it.id); },
      run: (e) => { e?.stopPropagation(); this.run(it.id); },
      upload: (e) => this.upload(it.id, e),
      setText: (e) => this.update(it.id, { text: e.target.value }),
      portOut: (e) => { e.stopPropagation(); this.setState({ pending: this.state.pending === it.id ? null : it.id, selected: it.id }); },
      portIn: (e) => { e.stopPropagation(); const p = this.state.pending; if (p && p !== it.id) this.connect(p, it.id); },
    };
  }

  // ---------- board-level handlers ----------
  boardDown = (e) => { if (e.target === e.currentTarget && (this.state.selected || this.state.pending)) this.setState({ selected: null, pending: null }); };
  boardOver = (e) => { if (this.dragNew) { e.preventDefault(); if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'; } };
  boardDrop = (e) => {
    const k = this.dragNew; this.dragNew = null;
    if (!k) return;
    e.preventDefault();
    const r = e.currentTarget.getBoundingClientRect();
    const z = this.state.zoom;
    this.add(k, { x: (e.clientX - r.left) / z - 40, y: (e.clientY - r.top) / z - 24 });
  };
  runAll = () => { this.state.items.forEach((x) => { if (TYPES[x.type].ai && x.file) this.run(x.id); }); };
  stop = (e) => e.stopPropagation();

  // ---------- rendering ----------
  renderWidget(it, h, selected) {
    const t = TYPES[it.type];
    const isEdit = this.state.mode === 'edit';
    const st = STATUS[it.status] || STATUS.empty;
    const done = it.status === 'done';
    const pend = this.state.pending;
    const canTarget = isEdit && pend && pend !== it.id;
    const p = it.p || {};
    return (
      <section aria-label={it.title} style={css(`position: relative; display: flex; flex-direction: column; background: #FFFFFF; border: 1px solid ${selected ? '#0B6E5F' : '#D9DEE3'}; border-radius: 14px; box-shadow: ${selected ? '0 0 0 3px #DDEFEA, 0 10px 24px rgba(20, 32, 25, 0.10)' : '0 1px 2px rgba(20, 32, 25, 0.05), 0 6px 16px rgba(20, 32, 25, 0.06)'}`)}>
        {isEdit && (
          <>
            <button onClick={h.portIn} aria-label={`Connect into ${it.title}`} title="Input"
              style={css(`position: absolute; left: -9px; top: 21px; width: 18px; height: 18px; padding: 0; border-radius: 50%; border: 2px solid ${canTarget ? '#0B6E5F' : '#9AA4AC'}; background: ${canTarget ? '#DDEFEA' : '#FFFFFF'}; z-index: 2`)} />
            <button onClick={h.portOut} aria-label={`Connect from ${it.title}`} title="Output: click, then click another widget's input"
              style={css(`position: absolute; right: -9px; top: 21px; width: 18px; height: 18px; padding: 0; border-radius: 50%; border: 2px solid ${pend === it.id ? '#0B6E5F' : '#9AA4AC'}; background: ${pend === it.id ? '#0B6E5F' : '#FFFFFF'}; z-index: 2`)} />
          </>
        )}

        <div onPointerDown={h.down} onPointerMove={h.move} onPointerUp={h.up} onPointerCancel={h.up}
          style={css(`display: flex; align-items: center; gap: 10px; padding: 12px 12px 10px 16px; border-bottom: 1px solid #EDF0F2; cursor: ${isEdit ? 'grab' : 'default'}; touch-action: none; min-width: 0`)}>
          <span style={css('flex: none; width: 34px; height: 34px; border-radius: 9px; background: #DDEFEA; color: #0B6E5F; display: grid; place-items: center')}><Icon name={it.type} /></span>
          <div style={css('display: flex; flex-direction: column; min-width: 0; flex: 1 1 auto')}>
            <span style={css(`font-family: ${MONO}; font-size: 10.5px; letter-spacing: 0.08em; color: #0B6E5F`)}>{t.tag}</span>
            <h2 style={css(`margin: 0; font-family: ${DISPLAY}; font-weight: 700; font-size: 17px; line-height: 1.25; overflow-wrap: anywhere`)}>{it.title}</h2>
          </div>
          <span style={css(`flex: none; display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; background: ${st[1]}; color: ${st[2]}`)}>
            <span style={css(`width: 7px; height: 7px; border-radius: 50%; background: ${st[2]}`)} />{st[0]}
          </span>
          {isEdit && (
            <button onPointerDown={this.stop} onClick={h.remove} aria-label="Delete widget" style={css('flex: none; width: 32px; height: 32px; border: 0; border-radius: 8px; background: transparent; color: #5A6670; display: grid; place-items: center; padding: 0')}><CloseIcon /></button>
          )}
        </div>

        <div style={css('padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 12px; min-width: 0')}>
          {it.status === 'empty' && (
            <label style={css('position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; text-align: center; padding: 28px 16px; border: 2px dashed #BCC5CD; border-radius: 12px; background: #F7F9FA; cursor: pointer')}>
              <input type="file" onChange={h.upload} aria-label="Upload data file" style={css('position: absolute; width: 1px; height: 1px; opacity: 0')} />
              <UploadIcon />
              <span style={css('font-weight: 600')}>Drop a file or <span style={css('color: #0B6E5F; text-decoration: underline')}>browse</span></span>
              <span style={css(`font-family: ${MONO}; font-size: 11.5px; color: #5A6670`)}>Accepts {t.accept}</span>
            </label>
          )}
          {it.status === 'ready' && (
            <div style={css('display: flex; flex-wrap: wrap; align-items: center; gap: 10px; padding: 16px; border-radius: 12px; background: #F7F9FA; border: 1px solid #E3E7EB')}>
              <span style={css('flex: 1 1 160px')}>Data loaded. Run the model to see results.</span>
              <button onPointerDown={this.stop} onClick={h.run} style={css('border: 0; border-radius: 8px; background: #0B6E5F; color: #FFFFFF; padding: 10px 16px; min-height: 44px; font-weight: 600')}>Run model</button>
            </div>
          )}
          {it.status === 'running' && (
            <div style={css('display: flex; flex-direction: column; gap: 10px; padding: 16px; border-radius: 12px; background: #F7F9FA; border: 1px solid #E3E7EB')}>
              <span>Running <b>{it.model}</b>…</span>
              <div style={css('height: 6px; border-radius: 3px; background: #DDE2E6; overflow: hidden')}><div className="bar-run" style={css('width: 40%; height: 100%; border-radius: 3px; background: #0B6E5F')} /></div>
            </div>
          )}

          {done && it.type === 'ts' && <TsResult horizon={p.horizon} target={p.target} />}
          {done && it.type === 'ocr' && <OcrResult lang={p.lang} conf={p.conf} />}
          {done && it.type === 'img' && <ImgResult topk={p.topk} conf={p.conf} />}
          {done && it.type === 'txt' && <TxtResult labels={p.labels} />}
          {done && it.type === 'anom' && <AnomResult />}
          {done && it.type === 'prep' && <PrepResult fmt={p.fmt} />}

          {it.file && (
            <div style={css('display: flex; flex-wrap: wrap; align-items: center; gap: 6px 8px; padding-top: 10px; border-top: 1px solid #EDF0F2; font-size: 12px; color: #5A6670; min-width: 0')}>
              <span style={css(`display: inline-flex; align-items: center; gap: 5px; min-width: 0; max-width: 100%; font-family: ${MONO}`)}>
                <FileIcon size={13} color="currentColor" />
                <span style={css('overflow: hidden; text-overflow: ellipsis; white-space: nowrap')}>{it.file}</span>
              </span>
              <span style={css('margin-left: auto; display: inline-flex; align-items: center; gap: 5px; padding: 2px 8px; border-radius: 6px; background: #F1F3F5; color: #3E4A53')}>
                <Icon d="M4 4h16v16H4zM9 9h6v6H9z" size={12} />{it.model}
              </span>
            </div>
          )}
        </div>
      </section>
    );
  }

  renderItem(it, i) {
    const s = this.state;
    const isEdit = s.mode === 'edit';
    const t = TYPES[it.type];
    const selected = isEdit && s.selected === it.id;
    const h = this.handlers(it);
    const ring = selected ? '#0B6E5F' : 'transparent';
    const tilt = [-1.2, 0.8, -0.6, 1.1][i % 4];
    return (
      <div key={it.id} onPointerDown={h.select} style={css(`position: absolute; left: ${it.x}px; top: ${it.y}px; width: ${it.w}px; z-index: ${selected ? 6 : t.ai ? 3 : 2}`)}>
        {it.type === 'label' && (
          <div style={css(`display: flex; align-items: center; gap: 6px; padding: 4px; border-radius: 10px; border: 2px solid ${ring}`)}>
            {isEdit && (
              <span onPointerDown={h.down} onPointerMove={h.move} onPointerUp={h.up} onPointerCancel={h.up} title="Drag to move" style={css('flex: none; width: 24px; height: 40px; display: grid; place-items: center; color: #8C979F; cursor: grab; touch-action: none')}><DotsIcon /></span>
            )}
            <input type="text" value={it.text} onChange={h.setText} aria-label="Board label" readOnly={!isEdit}
              style={css(`flex: 1 1 auto; min-width: 0; border: 0; background: transparent; font-family: ${DISPLAY}; font-weight: 700; font-size: 40px; line-height: 1.1; letter-spacing: -0.02em; padding: 0 4px`)} />
          </div>
        )}

        {it.type === 'note' && (
          <div style={css(`background: ${NOTES[it.color]?.[1] || '#FFE58A'}; border-radius: 4px; box-shadow: 0 1px 2px rgba(20, 32, 25, 0.08), 0 8px 18px rgba(20, 32, 25, 0.10); outline: 2px solid ${ring}; outline-offset: 3px; transform: rotate(${tilt}deg)`)}>
            <div onPointerDown={h.down} onPointerMove={h.move} onPointerUp={h.up} onPointerCancel={h.up} style={css(`height: 22px; cursor: ${isEdit ? 'grab' : 'default'}; touch-action: none; display: flex; justify-content: flex-end; padding: 2px 4px 0`)}>
              {isEdit && (
                <button onPointerDown={this.stop} onClick={h.remove} aria-label="Delete note" style={css('width: 22px; height: 22px; border: 0; border-radius: 4px; background: transparent; color: #3E4A53; display: grid; place-items: center; padding: 0; opacity: 0.6')}><CloseIcon size={12} width={2.5} /></button>
              )}
            </div>
            <textarea value={it.text} onChange={h.setText} aria-label="Sticky note" readOnly={!isEdit}
              style={css("display: block; width: 100%; min-height: 130px; border: 0; background: transparent; resize: none; padding: 0 16px 16px; font-family: 'Schibsted Grotesk', 'Segoe UI', sans-serif; font-size: 16px; line-height: 1.45; color: #1C2328")} />
          </div>
        )}

        {t.ai && this.renderWidget(it, h, selected)}
      </div>
    );
  }

  renderEdges() {
    const s = this.state;
    const isEdit = s.mode === 'edit';
    const byId = Object.fromEntries(s.items.map((it) => [it.id, it]));
    const edges = s.edges.map((e) => {
      const a = byId[e.from], b = byId[e.to];
      if (!a || !b) return null;
      const x1 = a.x + a.w + 9, y1 = a.y + PORT, x2 = b.x - 9, y2 = b.y + PORT;
      const dx = Math.max(60, Math.abs(x2 - x1) / 2);
      return {
        ...e,
        d: `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2 - 2} ${y2}`,
        arrow: `${x2 + 1},${y2} ${x2 - 10},${y2 - 6} ${x2 - 10},${y2 + 6}`,
        mx: (x1 + x2) / 2, my: (y1 + y2) / 2,
      };
    }).filter(Boolean);
    return (
      <>
        <svg width={WORLD_W} height={WORLD_H} viewBox={`0 0 ${WORLD_W} ${WORLD_H}`} aria-hidden="true" style={css('position: absolute; left: 0; top: 0; pointer-events: none; overflow: visible')}>
          {edges.map((e) => (
            <g key={e.id}>
              <path d={e.d} fill="none" stroke="#6E7A84" strokeWidth="2.5" strokeLinecap="round" />
              <polygon points={e.arrow} fill="#6E7A84" />
            </g>
          ))}
        </svg>
        {edges.map((e) => (
          <div key={e.id} style={css(`position: absolute; left: ${e.mx}px; top: ${e.my}px; transform: translate(-50%, -50%); display: flex; align-items: center; gap: 4px; z-index: 3`)}>
            {e.label && <span style={css(`padding: 3px 10px; border-radius: 999px; background: #FFFFFF; border: 1px solid #D9DEE3; font-family: ${MONO}; font-size: 11.5px; color: #3E4A53; white-space: nowrap`)}>{e.label}</span>}
            {isEdit && (
              <button onClick={() => this.setState((st) => ({ edges: st.edges.filter((x) => x.id !== e.id) }))} aria-label="Remove connection"
                style={css('width: 24px; height: 24px; border-radius: 50%; border: 1px solid #D9DEE3; background: #FFFFFF; color: #5A6670; display: grid; place-items: center; padding: 0')}><CloseIcon size={10} width={3} /></button>
            )}
          </div>
        ))}
      </>
    );
  }

  renderDock() {
    const keys = ['note', 'label', '|', 'prep', 'ts', 'ocr', 'img', 'txt', 'anom'];
    return (
      <div className="wb-dock" aria-label="Add to board" style={css('position: absolute; left: 50%; bottom: 16px; transform: translateX(-50%); display: flex; align-items: stretch; justify-content: center; gap: 4px; padding: 6px; background: #FFFFFF; border: 1px solid #D9DEE3; border-radius: 14px; box-shadow: 0 8px 24px rgba(20, 32, 25, 0.12); z-index: 10')}>
        {keys.map((k, i) => {
          if (k === '|') return <span key={'div' + i} aria-hidden="true" style={css('flex: none; width: 1px; margin: 6px 4px; background: #E3E7EB')} />;
          const t = TYPES[k];
          return (
            <button key={k} draggable onDragStart={(e) => { this.dragNew = k; e.dataTransfer.effectAllowed = 'copy'; e.dataTransfer.setData('text/plain', k); }}
              onDragEnd={() => { this.dragNew = null; }} onClick={() => this.add(k)} title={'Drag onto the board, or click to add: ' + t.label}
              style={css('flex: none; width: 82px; min-height: 64px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; border: 0; border-radius: 10px; background: transparent; cursor: grab; padding: 6px 4px')}>
              <span style={css(`width: 32px; height: 32px; border-radius: 8px; display: grid; place-items: center; background: ${k === 'note' ? '#FFE58A' : k === 'label' ? '#EEF1F3' : '#DDEFEA'}; color: ${t.ai ? '#0B6E5F' : '#142019'}`)}><Icon name={k} size={17} /></span>
              <span style={css('font-size: 11.5px; font-weight: 600; line-height: 1.2; text-align: center')}>{t.short}</span>
            </button>
          );
        })}
      </div>
    );
  }

  renderInspector() {
    const s = this.state;
    const it = s.mode === 'edit' ? s.items.find((x) => x.id === s.selected) : null;
    if (!it) return null;
    const t = TYPES[it.type];
    const nameOf = (id) => { const x = s.items.find((y) => y.id === id); return x ? x.title || x.text : ''; };
    const ins = s.edges.filter((e) => e.to === it.id).map((e) => nameOf(e.from)).filter(Boolean);
    const outs = s.edges.filter((e) => e.from === it.id).map((e) => nameOf(e.to)).filter(Boolean);
    const running = it.status === 'running';
    const cantRun = !it.file || running;
    const field = css('display: flex; flex-direction: column; gap: 6px; font-weight: 600; font-size: 13px');
    const control = css('border: 1px solid #D9DEE3; border-radius: 8px; padding: 8px 10px; min-height: 40px; font-weight: 400; font-size: 14px; background: #FFFFFF');
    const eyebrow = css(`font-family: ${MONO}; font-size: 10.5px; letter-spacing: 0.1em; color: #5A6670`);
    const btn = css('flex: 1 1 auto; border: 1px solid #D9DEE3; border-radius: 8px; background: #FFFFFF; padding: 8px 12px; min-height: 40px; font-weight: 600');

    return (
      <aside className="wb-insp" aria-label="Settings" style={css('position: absolute; right: 16px; top: 16px; width: 300px; max-height: calc(100% - 120px); overflow-y: auto; background: #FFFFFF; border: 1px solid #D9DEE3; border-radius: 14px; box-shadow: 0 8px 24px rgba(20, 32, 25, 0.12); padding: 16px; display: flex; flex-direction: column; gap: 14px; z-index: 10')}>
        <div style={css('display: flex; align-items: flex-start; gap: 8px')}>
          <div style={css('display: flex; flex-direction: column; gap: 2px; flex: 1 1 auto; min-width: 0')}>
            <span style={css(`font-family: ${MONO}; font-size: 10.5px; letter-spacing: 0.1em; color: #0B6E5F`)}>{t.tag}</span>
            <span style={css(`font-family: ${DISPLAY}; font-weight: 700; font-size: 18px`)}>{t.ai ? 'Widget settings' : it.type === 'note' ? 'Sticky note' : 'Text'}</span>
          </div>
          <button onClick={() => this.setState({ selected: null, pending: null })} aria-label="Close settings" style={css('flex: none; width: 32px; height: 32px; border: 0; border-radius: 8px; background: transparent; color: #5A6670; display: grid; place-items: center; padding: 0')}><CloseIcon /></button>
        </div>

        {it.type === 'note' && (
          <div style={css('display: flex; flex-direction: column; gap: 8px')}>
            <span style={css('font-weight: 600; font-size: 13px')}>Color</span>
            <div style={css('display: flex; gap: 8px')}>
              {Object.keys(NOTES).map((k) => (
                <button key={k} onClick={() => this.update(it.id, { color: k })} aria-label={NOTES[k][0]} aria-pressed={it.color === k}
                  style={css(`width: 36px; height: 36px; border-radius: 8px; background: ${NOTES[k][1]}; border: 2px solid ${it.color === k ? '#142019' : 'transparent'}; padding: 0`)} />
              ))}
            </div>
          </div>
        )}

        {it.type === 'label' && <p style={css('margin: 0; color: #5A6670; font-size: 13px')}>Click the text on the board to edit it. Drag the handle to move it.</p>}

        {t.ai && (
          <>
            <label style={field}>Name
              <input type="text" value={it.title} onChange={(e) => this.update(it.id, { title: e.target.value })} style={control} />
            </label>

            <div style={css('display: flex; flex-direction: column; gap: 6px')}>
              <span style={css('font-weight: 600; font-size: 13px')}>Data</span>
              {it.file && (
                <div style={css('display: flex; align-items: center; gap: 8px; padding: 10px; border: 1px solid #D9DEE3; border-radius: 8px; background: #F7F9FA; min-width: 0')}>
                  <FileIcon />
                  <span style={css('display: flex; flex-direction: column; min-width: 0; flex: 1 1 auto')}>
                    <span style={css(`font-family: ${MONO}; font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap`)}>{it.file}</span>
                    <span style={css('font-size: 12px; color: #5A6670')}>{it.size}</span>
                  </span>
                </div>
              )}
              <label style={css('position: relative; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px; min-height: 44px; border: 1px dashed #BCC5CD; border-radius: 8px; cursor: pointer; font-weight: 600; color: #0B6E5F')}>
                <input type="file" onChange={(e) => this.upload(it.id, e)} aria-label="Upload data file" style={css('position: absolute; width: 1px; height: 1px; opacity: 0')} />
                <UploadIcon size={16} color="currentColor" />{it.file ? 'Replace file' : 'Upload data'}
              </label>
              <span style={css(`font-family: ${MONO}; font-size: 11px; color: #5A6670`)}>Accepts {t.accept}</span>
            </div>

            <label style={field}>Model
              <select value={it.model} onChange={(e) => this.update(it.id, { model: e.target.value, status: it.file ? 'ready' : it.status })} style={control}>
                {t.models.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <span style={css('font-weight: 400; font-size: 12px; color: #5A6670')}>Hosted model, a Hugging Face ID, or your own .onnx file</span>
            </label>

            <div style={css('display: flex; flex-direction: column; gap: 12px; padding-top: 12px; border-top: 1px solid #EDF0F2')}>
              <span style={eyebrow}>PARAMETERS</span>
              {this.params(it).map((p) => p.kind === 'select' ? (
                <label key={p.key} style={field}>{p.label}
                  <select value={p.value} onChange={p.onChange} style={control}>{p.options.map((o) => <option key={o} value={o}>{o}</option>)}</select>
                </label>
              ) : (
                <label key={p.key} style={field}>
                  <span style={css('display: flex; justify-content: space-between')}><span>{p.label}</span><span style={css(`font-family: ${MONO}; font-weight: 500`)}>{p.value}%</span></span>
                  <input type="range" min="0" max="100" step="5" value={p.value} onChange={p.onChange} style={css('accent-color: #0B6E5F; min-height: 32px')} />
                </label>
              ))}
            </div>

            <div style={css('display: flex; flex-direction: column; gap: 6px; padding-top: 12px; border-top: 1px solid #EDF0F2')}>
              <span style={eyebrow}>CONNECTIONS</span>
              <span style={css('font-size: 13px')}><span style={css('color: #5A6670')}>Input from:</span> {ins.length ? ins.join(', ') : 'none'}</span>
              <span style={css('font-size: 13px')}><span style={css('color: #5A6670')}>Sends to:</span> {outs.length ? outs.join(', ') : 'none'}</span>
              <button onClick={() => this.setState({ pending: it.id })} style={css('align-self: flex-start; border: 1px solid #D9DEE3; border-radius: 8px; background: #FFFFFF; padding: 6px 12px; min-height: 36px; font-weight: 600')}>Connect to…</button>
            </div>

            <button onClick={() => this.run(it.id)} disabled={cantRun} style={css(`border: 0; border-radius: 8px; background: #0B6E5F; color: #FFFFFF; padding: 10px 16px; min-height: 44px; font-weight: 600; opacity: ${cantRun ? 0.5 : 1}`)}>
              {running ? 'Running…' : it.status === 'done' ? 'Re-run model' : 'Run model'}
            </button>
          </>
        )}

        <div style={css('display: flex; gap: 8px; padding-top: 12px; border-top: 1px solid #EDF0F2')}>
          <button onClick={() => this.duplicate(it.id)} style={btn}>Duplicate</button>
          <button onClick={() => this.remove(it.id)} style={{ ...btn, color: '#B3261E' }}>Delete</button>
        </div>
      </aside>
    );
  }

  render() {
    const s = this.state;
    const isEdit = s.mode === 'edit';
    const widgets = s.items.filter((x) => TYPES[x.type].ai);
    const nDone = widgets.filter((x) => x.status === 'done').length;
    const label = s.items.find((x) => x.type === 'label');
    const pendingItem = s.items.find((x) => x.id === s.pending);
    const seg = (on) => css(`border: 0; border-radius: 999px; padding: 6px 16px; min-height: 36px; font-weight: 600; background: ${on ? '#142019' : 'transparent'}; color: ${on ? '#FFFFFF' : '#5A6670'}`);
    const zoomBtn = css('width: 36px; height: 36px; border: 0; border-radius: 7px; background: transparent; display: grid; place-items: center; padding: 0');

    return (
      <div style={css('height: 100vh; display: flex; flex-direction: column; background: #F4F6F8')}>
        <header style={css('flex: none; display: flex; flex-wrap: wrap; align-items: center; gap: 10px 14px; padding: 10px 20px; background: #FFFFFF; border-bottom: 1px solid #D9DEE3')}>
          <div style={css('display: flex; align-items: center; gap: 10px; margin-right: auto; min-width: 0')}>
            <div style={css('width: 32px; height: 32px; border-radius: 8px; background: #142019; display: grid; place-items: center; flex: none')}><Icon name="board" color="#F4F6F8" /></div>
            <div style={css('min-width: 0')}>
              <div style={css('font-size: 12px; color: #5A6670')}>Boards / <span style={css('color: #142019; font-weight: 600')}>{label ? label.text : 'Untitled board'}</span></div>
              <div style={css(`font-family: ${MONO}; font-size: 10.5px; color: #5A6670; letter-spacing: 0.04em`)}>MOCKUP · SAMPLE DATA · {widgets.length} AI WIDGETS · {nDone} DONE</div>
            </div>
          </div>
          <a href="#/tools" style={css('display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; min-height: 40px; border: 1px solid #D9DEE3; border-radius: 8px; background: #FFFFFF; color: #142019; text-decoration: none; font-weight: 600')}>
            <Icon name="grid" size={15} />Tool directory
          </a>
          <div role="group" aria-label="Mode" style={css('display: inline-flex; padding: 3px; border: 1px solid #D9DEE3; border-radius: 999px; background: #F4F6F8')}>
            <button onClick={() => this.setState({ mode: 'edit' })} aria-pressed={isEdit} style={seg(isEdit)}>Edit</button>
            <button onClick={() => this.setState({ mode: 'view', pending: null })} aria-pressed={!isEdit} style={seg(!isEdit)}>Present</button>
          </div>
          <button onClick={this.runAll} style={css('border: 1px solid #D9DEE3; background: #FFFFFF; border-radius: 8px; padding: 8px 14px; min-height: 40px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#0B6E5F" aria-hidden="true"><path d="M7 4l13 8-13 8z" /></svg>Run all
          </button>
          <button style={css('border: 1px solid #0B6E5F; background: #0B6E5F; color: #FFFFFF; border-radius: 8px; padding: 8px 14px; min-height: 40px; font-weight: 600')}>Share</button>
        </header>

        <div style={css('flex: 1 1 auto; min-height: 0; position: relative; overflow: hidden')}>
          <div ref={(el) => { this.scroller = el; }} style={css('position: absolute; inset: 0; overflow: auto; background: #F4F6F8')}>
            <div style={css(`position: relative; width: ${Math.round(WORLD_W * s.zoom)}px; height: ${Math.round(WORLD_H * s.zoom)}px`)}>
              <div onPointerDown={this.boardDown} onDragOver={this.boardOver} onDrop={this.boardDrop}
                style={css(`position: absolute; left: 0; top: 0; width: ${WORLD_W}px; height: ${WORLD_H}px; transform: scale(${s.zoom}); transform-origin: 0 0; background-color: #F4F6F8; background-image: radial-gradient(#CDD3DA 1.2px, transparent 1.4px); background-size: 24px 24px`)}>
                {this.renderEdges()}
                {s.items.map((it, i) => this.renderItem(it, i))}
              </div>
            </div>
          </div>

          <div className="wb-zoom" style={css('position: absolute; left: 16px; bottom: 16px; display: flex; align-items: center; gap: 2px; padding: 4px; background: #FFFFFF; border: 1px solid #D9DEE3; border-radius: 10px; box-shadow: 0 4px 14px rgba(20, 32, 25, 0.08); z-index: 10')}>
            <button onClick={() => this.setZoom(s.zoom - 0.1)} aria-label="Zoom out" style={zoomBtn}><Icon d="M5 12h14" size={16} /></button>
            <button onClick={() => this.setZoom(1)} aria-label="Reset zoom" style={css(`min-width: 54px; height: 36px; border: 0; border-radius: 7px; background: transparent; font-family: ${MONO}; font-size: 12.5px; padding: 0 6px`)}>{Math.round(s.zoom * 100)}%</button>
            <button onClick={() => this.setZoom(s.zoom + 0.1)} aria-label="Zoom in" style={zoomBtn}><Icon d="M5 12h14M12 5v14" size={16} /></button>
          </div>

          {isEdit && pendingItem && (
            <div role="status" style={css('position: absolute; left: 50%; top: 16px; transform: translateX(-50%); display: flex; align-items: center; gap: 10px; padding: 6px 6px 6px 14px; background: #142019; color: #FFFFFF; border-radius: 10px; z-index: 11; white-space: nowrap; max-width: calc(100% - 32px)')}>
              <span style={css('overflow: hidden; text-overflow: ellipsis')}>Connecting from <b>{pendingItem.title}</b>. Click another widget's left port.</span>
              <button onClick={() => this.setState({ pending: null })} style={css('border: 0; border-radius: 7px; background: #34413A; color: #FFFFFF; padding: 6px 12px; min-height: 32px; font-weight: 600')}>Cancel</button>
            </div>
          )}

          {isEdit && this.renderDock()}
          {this.renderInspector()}
        </div>
      </div>
    );
  }
}

// ---------- small pieces ----------

function DotsIcon() {
  return (
    <svg width="12" height="18" viewBox="0 0 14 20" fill="currentColor" aria-hidden="true">
      {[4, 10, 16].map((y) => [4, 10].map((x) => <circle key={x + '-' + y} cx={x} cy={y} r="1.6" />))}
    </svg>
  );
}

function Bars({ rows }) {
  return (
    <div style={css('display: flex; flex-direction: column; gap: 8px; font-variant-numeric: tabular-nums')}>
      {rows.map(([name, pct]) => (
        <div key={name} style={css('display: grid; grid-template-columns: 92px minmax(0, 1fr) 38px; gap: 10px; align-items: center')}>
          <span>{name}</span>
          <div style={css('height: 10px; background: #EDF0F2; border-radius: 5px')}><div style={css(`width: ${pct}%; height: 100%; background: #0B6E5F; border-radius: 5px`)} /></div>
          <span style={css('text-align: right')}>{pct}%</span>
        </div>
      ))}
    </div>
  );
}

const muted = css('font-size: 12px; color: #5A6670');
const warn = css('color: #8A4F00; font-weight: 600');

function TsResult({ horizon, target }) {
  const metric = (label, value, mono) => (
    <div><div style={css('font-size: 12px; color: #5A6670')}>{label}</div>
      <div style={mono ? css(`font-family: ${MONO}; font-size: 15px; padding-top: 4px`) : css(`font-family: ${DISPLAY}; font-weight: 700; font-size: 22px; font-variant-numeric: tabular-nums`)}>{value}</div></div>
  );
  return (
    <>
      <div style={css('display: flex; flex-wrap: wrap; gap: 6px 22px')}>{metric('Next ' + horizon, '+18.4%')}{metric('Backtest MAPE', '6.2%')}{metric('Target', target, true)}</div>
      <svg viewBox="0 0 380 150" width="100%" role="img" aria-label="Weekly values for the past year with a forecast and confidence band" style={{ display: 'block' }}>
        <g stroke="#EDF0F2" strokeWidth="1"><line x1="30" y1="20" x2="370" y2="20" /><line x1="30" y1="60" x2="370" y2="60" /><line x1="30" y1="100" x2="370" y2="100" /></g>
        <g fontFamily="JetBrains Mono, monospace" fontSize="9.5" fill="#5A6670">
          <text x="24" y="23" textAnchor="end">1.5M</text><text x="24" y="63" textAnchor="end">1.0M</text><text x="24" y="103" textAnchor="end">0.5M</text>
          <text x="30" y="128">Oct '25</text><text x="150" y="128" textAnchor="middle">Mar '26</text><text x="268" y="128" textAnchor="middle">Today</text><text x="370" y="128" textAnchor="end">Jan '27</text>
        </g>
        <polygon points="268,66 288,58 308,46 328,38 348,30 368,26 368,72 348,72 328,76 308,82 288,86 268,80" fill="#DDEFEA" />
        <line x1="268" y1="14" x2="268" y2="112" stroke="#9AA4AC" strokeDasharray="3 3" />
        <polyline points="30,74 50,78 70,70 90,82 110,86 130,80 150,76 170,72 190,78 210,70 230,68 250,74 268,72" fill="none" stroke="#142019" strokeWidth="2" strokeLinejoin="round" />
        <polyline points="268,72 288,70 308,62 328,56 348,50 368,48" fill="none" stroke="#0B6E5F" strokeWidth="2.5" strokeDasharray="6 4" strokeLinejoin="round" />
        <g fontFamily="Schibsted Grotesk, sans-serif" fontSize="10.5" fill="#5A6670">
          <line x1="30" y1="143" x2="46" y2="143" stroke="#142019" strokeWidth="2" /><text x="51" y="147">Actual</text>
          <line x1="100" y1="143" x2="116" y2="143" stroke="#0B6E5F" strokeWidth="2.5" strokeDasharray="5 3" /><text x="121" y="147">Forecast</text>
          <rect x="178" y="137" width="16" height="11" fill="#DDEFEA" /><text x="199" y="147">90% interval</text>
        </g>
      </svg>
    </>
  );
}

function OcrResult({ lang, conf }) {
  const rows = [['Vendor', 'Green Leaf Market', '99%'], ['Date', '2026-10-03', '98%'], ['Total', '1,326.80', '97%'], ['Tax ID', '01055?4012', '64%', true]];
  const th = css('padding: 0 8px 6px 0; font-weight: 500');
  return (
    <>
      <div style={css('font-size: 12.5px; color: #5A6670')}>128 documents read · <span style={warn}>3 need review</span></div>
      <table style={css('width: 100%; border-collapse: collapse; font-size: 13px; font-variant-numeric: tabular-nums')}>
        <thead><tr style={css(`text-align: left; font-family: ${MONO}; font-size: 10.5px; letter-spacing: 0.06em; color: #5A6670`)}><th style={th}>FIELD</th><th style={th}>VALUE</th><th style={{ ...th, textAlign: 'right', paddingRight: 0 }}>CONF.</th></tr></thead>
        <tbody>
          {rows.map(([f, v, c, flag]) => (
            <tr key={f} style={css(`border-top: 1px solid #EDF0F2; background: ${flag ? '#FBEBD0' : 'transparent'}`)}>
              <td style={css('padding: 6px 8px 6px 6px')}>{f}</td><td style={css('padding: 6px 8px 6px 0')}>{v}</td>
              <td style={css(`padding: 6px 6px 6px 0; text-align: right; ${flag ? 'color: #8A4F00; font-weight: 600' : ''}`)}>{c}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={muted}>{lang} · review below {conf}%</div>
    </>
  );
}

function ImgResult({ topk, conf }) {
  return (
    <>
      <div style={css('font-size: 12.5px; color: #5A6670')}>1,204 images labeled · <span style={warn}>37 low confidence</span></div>
      <Bars rows={[['Footwear', 42], ['Bags', 31], ['Apparel', 19], ['Accessories', 8]]} />
      <div style={muted}>{topk} · flag below {conf}%</div>
    </>
  );
}

function TxtResult({ labels }) {
  const chip = css('padding: 3px 10px; border-radius: 999px; background: #F1F3F5; font-size: 12.5px');
  return (
    <>
      <div style={css('display: flex; height: 14px; border-radius: 7px; overflow: hidden')}>
        <div style={css('width: 64%; background: #0B6E5F')} /><div style={css('width: 22%; background: #AEB8C0')} /><div style={css('width: 14%; background: #C9701A')} />
      </div>
      <div style={css('display: flex; flex-wrap: wrap; gap: 6px 16px; font-size: 13px; font-variant-numeric: tabular-nums')}>
        <span><b style={{ color: '#0B6E5F' }}>64%</b> Positive</span><span><b style={{ color: '#5A6670' }}>22%</b> Neutral</span><span><b style={{ color: '#9A4F0B' }}>14%</b> Negative</span>
      </div>
      <div style={css('display: flex; flex-wrap: wrap; gap: 6px')}>
        <span style={chip}>delivery time · 41</span><span style={chip}>price · 28</span><span style={chip}>packaging · 12</span>
      </div>
      <div style={muted}>2,318 reviews · labels: {labels}</div>
    </>
  );
}

function PrepResult({ fmt }) {
  const fixes = ['Dates converted to YYYY-MM-DD', '138 duplicate rows removed', 'Revenue text converted to numbers', 'Branch names merged (Bangkok · BKK)', '2 extra header rows skipped'];
  return (
    <>
      <div style={css('font-size: 12.5px; color: #5A6670')}>18,240 rows in · 18,102 rows out · <span style={{ color: '#0B6E5F', fontWeight: 600 }}>5 fixes applied</span></div>
      <ul style={css('list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 5px; font-size: 13px')}>
        {fixes.map((f) => (
          <li key={f} style={css('display: flex; align-items: flex-start; gap: 7px')}>
            <span style={css('flex: none; margin-top: 2px; color: #0B6E5F')}><Icon d="M5 12l5 5 9-10" size={14} width={2.5} /></span>{f}
          </li>
        ))}
      </ul>
      <div style={muted}>Saved as {fmt} · recipe saved for next upload</div>
    </>
  );
}

function AnomResult() {
  return (
    <>
      <div style={css('font-size: 12.5px; color: #5A6670')}>18,240 rows scanned · <span style={warn}>14 anomalies</span></div>
      <svg viewBox="0 0 380 80" width="100%" role="img" aria-label="Anomaly score over time with three points above the threshold" style={{ display: 'block' }}>
        <line x1="0" y1="26" x2="380" y2="26" stroke="#C9701A" strokeDasharray="4 4" />
        <polyline points="0,62 24,58 48,64 72,56 96,60 120,16 144,58 168,62 192,54 216,60 240,22 264,58 288,62 312,56 336,10 360,58 380,60" fill="none" stroke="#142019" strokeWidth="2" />
        <circle cx="120" cy="16" r="5" fill="#C9701A" /><circle cx="240" cy="22" r="5" fill="#C9701A" /><circle cx="336" cy="10" r="5" fill="#C9701A" />
      </svg>
    </>
  );
}

