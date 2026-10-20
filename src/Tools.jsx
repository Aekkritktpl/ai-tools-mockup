import React from 'react';
import { css, Icon, CloseIcon, UploadIcon, FileIcon, fileSize } from './ui.jsx';

// Tool directory: three columns of tools. Clicking a tool opens a workspace
// with only that tool's upload, models and settings. All results are mock.

const MONO = "'JetBrains Mono', ui-monospace, monospace";
const DISPLAY = "'Familjen Grotesk', 'Segoe UI', sans-serif";
const TEAL = '#0B6E5F', AMBER = '#C9701A', GREY = '#AEB8C0';

const sel = (key, label, options, value) => ({ type: 'select', key, label, options, value });
const rng = (key, label, value, unit = '%', min = 0, max = 100, step = 5) => ({ type: 'range', key, label, value, unit, min, max, step });
const tog = (key, label, value) => ({ type: 'toggle', key, label, value });

export const CATALOG = [
  { name: 'Documents & images', desc: 'Scans, photos, PDFs', tools: [
    { id: 'ocr', name: 'OCR', desc: 'Turn scans and photos of documents into text and fields.', long: 'Read text, key fields and tables from scanned documents, receipts and forms.',
      accepts: 'PDF, PNG, JPG, TIFF', sample: ['invoice_batch_oct.pdf', '12.4 MB'],
      models: [['PaddleOCR v4', 'Fast, strong on Thai and other Asian scripts'], ['Tesseract 5', 'Open source, runs fully offline'], ['TrOCR-large', 'Best for handwriting'], ['Donut', 'Reads forms end to end, no separate OCR step'], ['Claude Vision', 'Understands layout and can answer questions about a page']],
      opts: [sel('lang', 'Document language', ['Auto-detect', 'English', 'Thai', 'English + Thai', 'Japanese'], 'Auto-detect'), sel('out', 'Output', ['Key–value fields', 'Plain text', 'Tables'], 'Key–value fields'), rng('conf', 'Send to review below confidence', 80), tog('hand', 'Contains handwriting', false)],
      result: { kind: 'table', title: 'Extracted fields · invoice 1 of 128', cols: ['FIELD', 'VALUE', 'CONFIDENCE'],
        rows: [['Vendor', 'Green Leaf Market', '99%'], ['Invoice no.', 'INV-2026-10-0412', '98%'], ['Date', '2026-10-03', '98%'], ['Total', '1,326.80', '97%'], ['Tax ID', '01055?4012', '64%', true]],
        metrics: [['Pages read', '128'], ['Fields found', '1,024'], ['Need review', '3', AMBER]] } },
    { id: 'img', name: 'Image classification', desc: 'Sort images into categories you choose.', long: 'Give every image a label, such as product type, defect or not, or scene.',
      accepts: 'ZIP of images, PNG, JPG', sample: ['product_photos.zip', '214 MB'],
      models: [['ViT-B/16', 'Accurate general-purpose classifier'], ['EfficientNet-B3', 'Small and fast, good for mobile'], ['CLIP (zero-shot)', 'No training: type the labels you want'], ['Custom (.onnx)', 'Upload a model you trained yourself']],
      opts: [sel('labels', 'Labels', ["Use the model's labels", 'Custom labels…'], "Use the model's labels"), sel('topk', 'Show per image', ['Top 1 label', 'Top 3 labels', 'Top 5 labels'], 'Top 1 label'), rng('conf', 'Flag below confidence', 60)],
      result: { kind: 'bars', title: 'Images per label', bars: [['Footwear', 42, '506', TEAL], ['Bags', 31, '373', TEAL], ['Apparel', 19, '229', TEAL], ['Accessories', 8, '96', TEAL]],
        metrics: [['Images', '1,204'], ['Labels', '4'], ['Low confidence', '37', AMBER]] } },
    { id: 'det', name: 'Object detection', desc: 'Find and box objects inside images.', long: 'Locate objects in each image and count them, such as products on a shelf, vehicles or people.',
      accepts: 'JPG, PNG, MP4 frames', sample: ['shelf_camera_0930.jpg', '3.1 MB'],
      models: [['YOLOv8-m', 'Real-time, common objects'], ['DETR-ResNet-50', 'Handles crowded scenes well'], ['Grounding DINO', 'Find objects you describe in words']],
      opts: [sel('find', 'Objects to find', ['All objects', 'Products on shelf', 'People', 'Vehicles'], 'Products on shelf'), rng('conf', 'Minimum confidence', 50), tog('draw', 'Draw boxes on output images', true)],
      result: { kind: 'boxes', title: 'Detections · shelf_camera_0930.jpg',
        boxes: [[6, 8, 14, 22, 'bottle 0.94', TEAL], [24, 6, 13, 24, 'bottle 0.91', TEAL], [44, 10, 16, 20, 'box 0.88', TEAL], [8, 42, 18, 23, 'box 0.86', TEAL], [33, 44, 12, 21, 'can 0.72', TEAL], [52, 41, 17, 24, 'box 0.58', AMBER]],
        metrics: [['Objects found', '6'], ['Empty shelf gaps', '2', AMBER], ['Time per image', '41 ms']] } },
  ] },
  { name: 'Text', desc: 'Reviews, emails, reports', tools: [
    { id: 'txt', name: 'Text classification', desc: 'Label messages by sentiment, topic or intent.', long: 'Sort text into labels, such as positive or negative, topic, or spam or not.',
      accepts: 'CSV, TXT, JSONL', sample: ['customer_reviews.csv', '1.6 MB'],
      models: [['XLM-RoBERTa', 'Multilingual, including Thai'], ['DistilBERT SST-2', 'Fast English sentiment'], ['Claude (prompted)', 'Any labels you write, no training']],
      opts: [sel('labels', 'Label set', ['Positive / Neutral / Negative', 'Topic: price, quality, delivery', 'Spam / Not spam', 'Custom labels…'], 'Positive / Neutral / Negative'), sel('col', 'Text column', ['review_text', 'comment', 'body'], 'review_text'), tog('multi', 'Allow more than one label', false)],
      result: { kind: 'bars', title: 'Reviews by sentiment', bars: [['Positive', 64, '1,484', TEAL], ['Neutral', 22, '510', GREY], ['Negative', 14, '324', AMBER]],
        metrics: [['Reviews', '2,318'], ['Top complaint', 'Delivery'], ['Avg. confidence', '91%']] } },
    { id: 'sum', name: 'Summarization', desc: 'Condense long documents into key points.', long: 'Turn long reports, transcripts or threads into a short summary and key points.',
      accepts: 'PDF, DOCX, TXT', sample: ['quarterly_report_q3.pdf', '4.2 MB'],
      models: [['Claude', 'Long documents, any language'], ['BART-large-CNN', 'News-style English summaries'], ['mT5-base', 'Multilingual, runs on your server']],
      opts: [sel('len', 'Length', ['One line', 'Short paragraph', 'Paragraph + 5 key points'], 'Paragraph + 5 key points'), sel('lang', 'Summary language', ['Same as document', 'English', 'Thai'], 'Same as document'), tog('nums', 'Keep key numbers', true)],
      result: { kind: 'text', title: 'Summary · quarterly_report_q3.pdf (42 pages)',
        summary: 'Q3 revenue grew 12% year on year, led by online orders, while store traffic stayed flat. Margins fell slightly because of higher delivery costs. The report recommends renegotiating courier contracts before the holiday season.',
        points: ['Revenue up 12% year on year; online now 38% of sales', 'Delivery cost per order rose from 41 to 49', 'Two new stores opened, both ahead of target', 'Inventory write-offs down 18%', 'Courier contracts to be reviewed in November'],
        metrics: [['Pages', '42'], ['Reduced by', '97%'], ['Reading time', '1 min']] } },
    { id: 'ner', name: 'Entity extraction', desc: 'Pull out names, dates, amounts and places.', long: 'Find people, companies, dates, amounts and places in text and list them.',
      accepts: 'TXT, PDF, DOCX, ZIP', sample: ['contracts_2026.zip', '28 MB'],
      models: [['spaCy en_core_web_trf', 'Accurate standard entity types'], ['GLiNER', 'Define your own entity types'], ['Claude (prompted)', 'Complex or custom fields']],
      opts: [sel('types', 'Entity types', ['People, organizations, places', 'Dates and amounts', 'All types'], 'All types'), rng('conf', 'Minimum confidence', 70), tog('merge', 'Merge duplicates', true)],
      result: { kind: 'table', title: 'Most frequent entities', cols: ['ENTITY', 'TYPE', 'MENTIONS'],
        rows: [['Siam Logistics Co., Ltd.', 'Organization', '84'], ['31 December 2026', 'Date', '41'], ['Bangkok', 'Place', '37'], ['2,400,000 THB', 'Amount', '22'], ['Ms. Napat S.', 'Person', '19']],
        metrics: [['Documents', '56'], ['Entities', '1,912'], ['Types', '5']] } },
  ] },
  { name: 'Numbers & time series', desc: 'Spreadsheets, logs, sensors', tools: [
    { id: 'ts', name: 'Forecast', desc: 'Predict future values from past data.', long: 'Forecast sales, demand, traffic or any value that changes over time.',
      accepts: 'CSV, Parquet, XLSX', sample: ['pos_sales_2024_2026.csv', '3.8 MB'],
      models: [['Prophet', 'Handles seasonality and holidays'], ['TimesFM 2.0', 'Foundation model, no training needed'], ['Chronos-Bolt', 'Fast probabilistic forecasts'], ['ARIMA (auto)', 'Classic statistical baseline'], ['LSTM', 'Neural network for long histories']],
      opts: [sel('date', 'Date column', ['date', 'week_start', 'timestamp'], 'week_start'), sel('target', 'Value to forecast', ['revenue', 'units_sold', 'orders'], 'revenue'), sel('horizon', 'Forecast ahead', ['4 weeks', '8 weeks', '12 weeks', '26 weeks'], '12 weeks'), tog('hol', 'Include public holidays', true)],
      result: { kind: 'chart', title: 'Weekly revenue', metrics: [['Next period', '+18.4%', TEAL], ['Backtest error (MAPE)', '6.2%'], ['Peak week', 'Dec 21']] } },
    { id: 'anom', name: 'Anomaly detection', desc: 'Flag unusual rows, spikes and drops.', long: 'Spot unusual records, such as fraud, faulty sensors or sudden spikes.',
      accepts: 'CSV, Parquet', sample: ['payments_log_oct.parquet', '46 MB'],
      models: [['Isolation Forest', 'Fast, works on any table'], ['Autoencoder', 'Learns complex normal patterns'], ['Matrix Profile', 'Best for a single time series']],
      opts: [sel('cols', 'Columns to check', ['All numeric columns', 'amount', 'latency_ms'], 'All numeric columns'), rng('sens', 'Sensitivity', 90), tog('time', 'Treat as a time series', true)],
      result: { kind: 'table', title: 'Highest anomaly scores', cols: ['TIME', 'AMOUNT', 'SCORE'],
        rows: [['2026-10-12 03:14', '98,500.00', '0.97', true], ['2026-10-08 23:52', '64,200.00', '0.93', true], ['2026-10-15 04:01', '0.01', '0.88', true], ['2026-10-02 12:30', '22,750.00', '0.71'], ['2026-10-11 18:05', '19,900.00', '0.69']],
        metrics: [['Rows scanned', '18,240'], ['Anomalies', '14', AMBER], ['Share flagged', '0.08%']] } },
    { id: 'tab', name: 'Tabular prediction', desc: 'Predict a column from the other columns.', long: 'Train a model on a spreadsheet to predict a yes/no outcome or a number, such as churn or price.',
      accepts: 'CSV, XLSX, Parquet', sample: ['customers_churn.csv', '7.9 MB'],
      models: [['XGBoost', 'Strong default for tables'], ['LightGBM', 'Fast on large data'], ['AutoGluon', 'Tries many models and picks the best']],
      opts: [sel('target', 'Column to predict', ['churned', 'monthly_spend', 'plan_type'], 'churned'), sel('task', 'Task', ['Auto-detect', 'Classification', 'Regression'], 'Auto-detect'), rng('hold', 'Hold out for testing', 20, '%', 10, 40, 5)],
      result: { kind: 'bars', title: 'What drives the prediction', bars: [['months_active', 100, '0.31', TEAL], ['support_tickets', 74, '0.23', TEAL], ['monthly_spend', 52, '0.16', TEAL], ['plan_type', 32, '0.10', TEAL], ['region', 16, '0.05', GREY]],
        metrics: [['Accuracy', '87%', TEAL], ['AUC', '0.91'], ['Training rows', '24,560']] } },
  ] },
];

// Standalone data-prep tool, shown as a banner above the three columns.
export const PREP_TOOL = {
  id: 'prep', name: 'Clean & prepare data', prep: true,
  desc: 'Find and fix problems in a spreadsheet before you use it anywhere else.',
  long: 'Check a file for problems, approve the fixes you want, and save them as a recipe you can reuse on next month’s file.',
  accepts: 'CSV, XLSX, Parquet', sample: ['sales_export_messy.xlsx', '5.2 MB'],
  models: [['Auto', 'Rule checks plus AI suggestions']],
  opts: [sel('fmt', 'Save cleaned file as', ['CSV', 'Excel (.xlsx)', 'Parquet'], 'CSV'), tog('recipe', 'Save fixes as a reusable recipe', true), tog('auto', 'Apply the recipe to future uploads automatically', false)],
  result: { kind: 'recipe', title: 'Cleaned file preview · first 4 rows', cols: ['DATE', 'BRANCH', 'REVENUE'],
    rows: [['2026-10-01', 'Bangkok', '48,210.00'], ['2026-10-01', 'Chiang Mai', '21,905.50'], ['2026-10-02', 'Bangkok', '51,377.25'], ['2026-10-02', 'Phuket', '18,640.00']],
    metrics: [['Rows in', '18,240'], ['Rows out', '18,102'], ['Fixes applied', '5', TEAL]] },
};

// Data checks per tool: [severity, problem, note, fix, before, after, recommended]
// severity 'fix' = should usually be fixed, 'info' = worth knowing.
// Some fixes are NOT recommended on purpose: what counts as "clean" depends on the task.
export const CHECKS = {
  prep: [
    ['fix', 'Dates in 3 different formats', '', 'Convert all dates to YYYY-MM-DD', '03/10/26 · Oct 3, 2026', '2026-10-03', true],
    ['fix', '138 duplicate rows', 'Exact copies of other rows.', 'Remove duplicates', '18,240 rows', '18,102 rows', true],
    ['fix', 'Revenue stored as text in 412 rows', '', 'Convert to numbers', '"1,240.00 THB"', '1240.00', true],
    ['fix', 'Same branch spelled 3 ways', '', 'Merge into one name', 'Bangkok · BKK · bangkok ', 'Bangkok', true],
    ['fix', '2 extra header rows at the top', 'Title rows above the real column names.', 'Skip the first 2 rows', 'Row 1: “Sales export”', 'Row 1: date, branch, …', true],
    ['info', '96 rows have no revenue', 'Could be days a branch was closed.', 'Fill with 0', 'empty', '0', false, 'Filling blanks with 0 could hide missing data. Leave empty unless you know the branch was closed.'],
  ],
  ocr: [
    ['fix', '6 pages are rotated', '', 'Auto-rotate pages', 'page 14: 90°', 'page 14: upright', true],
    ['fix', '11 pages are faint or low-contrast', 'Usually photocopies or phone photos in dim light.', 'Enhance contrast', 'faint scan', 'sharpened', true],
    ['fix', '2 pages are too blurry to read reliably', '', 'Send these pages to manual review', 'pages 41, 87', 'review queue', true],
    ['info', 'Handwriting on 9 pages', 'Printed-text models misread handwriting.', 'Use TrOCR for those pages', 'PaddleOCR', 'TrOCR-large', true],
  ],
  img: [
    ['fix', '18 duplicate images', '', 'Remove duplicates', '1,222 images', '1,204 images', true],
    ['fix', '3 files can’t be opened', 'Corrupt or not really images.', 'Skip these files', 'IMG_0412.jpg …', 'skipped', true],
    ['info', '41 images are smaller than 64 × 64 px', 'Too small to classify well.', 'Skip tiny images', '48 × 48 px', 'skipped', false, 'Optional: keep them if small images are normal for your data.'],
    ['info', 'Classes are unbalanced', '“Accessories” has only 8% of images.', 'Weight classes during training', '8% vs 42%', 'balanced weights', true],
  ],
  det: [
    ['fix', 'Image is 4032 × 3024 px', 'Large images slow detection without improving it.', 'Resize to 1280 px on the longest side', '4032 × 3024', '1280 × 960', true],
    ['info', 'Motion blur in the lower half', '', 'Flag detections in blurred areas', 'no flag', 'flagged', true],
    ['info', 'Glare on the right side', 'Products under glare may be missed.', 'Note it in the results', '', 'noted', true],
  ],
  txt: [
    ['fix', '126 duplicate reviews', '', 'Remove duplicates', '2,482 rows', '2,356 rows', true],
    ['fix', '38 empty rows', '', 'Remove empty rows', '2,356 rows', '2,318 rows', true],
    ['fix', 'HTML tags in 212 rows', '', 'Strip HTML, keep emoji', '<p>Great service!! 😍</p>', 'Great service!! 😍', true],
    ['info', 'Mixed Thai and English', '41% Thai, 59% English.', 'Keep both and use a multilingual model', 'DistilBERT', 'XLM-RoBERTa', true],
  ],
  sum: [
    ['fix', 'Header and page number repeat on every page', '', 'Remove repeated headers and footers', '“Q3 Report · Page 12”', 'removed', true],
    ['fix', '4 pages are scanned images', 'They contain no selectable text.', 'Run OCR on those pages first', 'no text', 'text extracted', true],
    ['info', 'Tables on 6 pages', '', 'Keep tables as structured text', 'layout lost', 'rows kept', true],
  ],
  ner: [
    ['fix', '3 files are password-protected', '', 'Skip them and list them in the results', '56 files', '53 files', true],
    ['fix', 'Thai numerals in 7 files', '', 'Convert to Arabic numerals', '๒,๔๐๐,๐๐๐ บาท', '2,400,000 บาท', true],
    ['fix', 'Same company written 4 ways', '', 'Merge spelling variants', 'Siam Logistic Co. · SIAM LOGISTICS', 'Siam Logistics Co., Ltd.', true],
  ],
  ts: [
    ['fix', 'Dates in 2 different formats', '', 'Convert to YYYY-MM-DD', '03/10/26 · Oct 3 2026', '2026-10-03', true],
    ['fix', '2 weeks appear twice', '', 'Add duplicate weeks together', '2 rows for Jun 8', '1 row', true],
    ['fix', 'Revenue stored as text in 31 rows', '', 'Convert to numbers', '"1,240.00 THB"', '1240.00', true],
    ['info', '4 weeks missing in April 2026', 'Could be a closure or an export problem.', 'Fill gaps with the average', 'gap', '1.02M', false, 'Averages could hide a real closure. The model can handle the gap as it is.'],
  ],
  anom: [
    ['fix', 'Timestamps in two time zones', '', 'Convert all to Asia/Bangkok', '2026-10-12T03:14Z', '2026-10-12 10:14', true],
    ['info', '212 rows missing latency_ms', 'The model can work with gaps.', 'Leave empty', 'empty', 'empty', true],
    ['info', '37 extreme values in amount', '', 'Remove extreme values', '37 rows', 'removed', false, 'These may be exactly the anomalies you want to find.'],
  ],
  tab: [
    ['fix', 'cancel_date reveals the answer', 'It is only filled in for customers who already churned.', 'Exclude this column', 'used', 'excluded', true],
    ['fix', 'customer_id is an ID column', 'IDs let the model memorise rows instead of learning patterns.', 'Exclude this column', 'used', 'excluded', true],
    ['fix', 'Missing values in 3 columns', '', 'Fill numbers with the median, categories with “Unknown”', 'empty', 'median / Unknown', true],
    ['info', 'Only 14% of customers churned', 'Unbalanced classes can make accuracy look better than it is.', 'Balance classes during training', '14% vs 86%', 'weighted', true],
  ],
};

function findTool(id) {
  if (id === PREP_TOOL.id) return { tool: PREP_TOOL, column: 'Data preparation' };
  for (const col of CATALOG) for (const t of col.tools) if (t.id === id) return { tool: t, column: col.name };
  return null;
}

const STATUS = { idle: ['Not run yet', '#EEF1F3', '#5A6670'], ready: ['Ready to run', '#E6E9F5', '#3F4C8A'], running: ['Running', '#FBEBD0', '#8A4F00'], done: ['Done', '#DDEFEA', '#0B6E5F'] };

export default class Tools extends React.Component {
  constructor(props) {
    super(props);
    this.state = { toolId: null, query: '', work: {} };
    this.timers = [];
  }
  componentWillUnmount() { this.timers.forEach((t) => clearTimeout(t)); }

  work(id) {
    if (this.state.work[id]) return this.state.work[id];
    const { tool } = findTool(id);
    const opts = {};
    tool.opts.forEach((o) => { opts[o.key] = o.value; });
    return { file: null, size: '', model: tool.models[0][0], opts, status: 'idle', check: 'none', fixes: {} };
  }
  loadFile(id, file, size) {
    this.setWork(id, { file, size, status: 'ready', check: 'running', fixes: {} });
    this.timers.push(setTimeout(() => {
      const fixes = {};
      (CHECKS[id] || []).forEach((c, i) => { fixes[i] = !!c[6]; });
      this.setWork(id, { check: 'done', fixes });
    }, 1200));
  }
  clearFile(id) { this.setWork(id, { file: null, size: '', status: 'idle', check: 'none', fixes: {} }); }
  toggleFix(id, i) {
    const w = this.work(id);
    this.setWork(id, { fixes: { ...w.fixes, [i]: !w.fixes[i] }, status: w.status === 'done' ? 'ready' : w.status });
  }
  acceptRecommended(id) {
    const fixes = {};
    (CHECKS[id] || []).forEach((c, i) => { fixes[i] = !!c[6]; });
    const w = this.work(id);
    this.setWork(id, { fixes, status: w.status === 'done' ? 'ready' : w.status });
  }
  setWork(id, patch) {
    this.setState((s) => ({ work: { ...s.work, [id]: { ...(s.work[id] || this.work(id)), ...patch } } }));
  }
  setOpt(id, key, val) {
    const cur = this.work(id);
    this.setWork(id, { opts: { ...cur.opts, [key]: val }, status: cur.file && cur.status === 'done' ? 'ready' : cur.status });
  }
  run(id) {
    const w = this.work(id);
    if (!w.file || w.status === 'running' || w.check === 'running') return;
    this.setWork(id, { status: 'running' });
    this.timers.push(setTimeout(() => this.setWork(id, { status: 'done' }), 1500));
  }

  renderCheck(id, w, checks, card, step) {
    const nOn = checks.filter((c, i) => w.fixes[i]).length;
    const muted = css('margin: 0; font-size: 13px; color: #5A6670');
    return (
      <section style={card}>
        {step(2, 'Check data')}
        {!w.file && <p style={muted}>Upload a file and it will be checked for problems before anything runs.</p>}
        {w.check === 'running' && (
          <div style={css('display: flex; flex-direction: column; gap: 8px; padding: 12px; border-radius: 10px; background: #F7F9FA')}>
            <span style={css('font-size: 13px')}>Checking <b>{w.file}</b> for problems…</span>
            <div style={css('height: 6px; border-radius: 3px; background: #DDE2E6; overflow: hidden')}><div className="bar-run" style={css('width: 40%; height: 100%; border-radius: 3px; background: #0B6E5F')} /></div>
          </div>
        )}
        {w.check === 'done' && checks.length === 0 && <p style={muted}>No problems found.</p>}
        {w.check === 'done' && checks.length > 0 && (
          <>
            <div style={css('display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 6px 12px')}>
              <span style={css('font-size: 13.5px')}><b>{checks.length} things found</b> · {nOn} {nOn === 1 ? 'fix' : 'fixes'} selected</span>
              <button onClick={() => this.acceptRecommended(id)} style={css('border: 0; background: transparent; color: #0B6E5F; font-weight: 600; padding: 4px 0; min-height: 32px; text-decoration: underline')}>Use recommended</button>
            </div>
            <ul style={css('list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px')}>
              {checks.map(([sev, title, note, fix, before, after, rec, why], i) => {
                const on = !!w.fixes[i];
                return (
                  <li key={title} style={css(`display: flex; flex-direction: column; gap: 6px; padding: 10px 12px; border: 1px solid ${on ? '#B8DDD4' : '#E3E7EB'}; border-radius: 10px; background: ${on ? '#F6FBFA' : '#FFFFFF'}`)}>
                    <div style={css('display: flex; align-items: flex-start; gap: 8px')}>
                      <span title={sev === 'fix' ? 'Problem' : 'Worth knowing'} style={css(`flex: none; margin-top: 6px; width: 8px; height: 8px; border-radius: 50%; background: ${sev === 'fix' ? AMBER : '#3F4C8A'}`)} />
                      <span style={css('display: flex; flex-direction: column; min-width: 0')}>
                        <span style={css('font-weight: 600; font-size: 13.5px')}>{title}</span>
                        {note && <span style={css('font-size: 12.5px; color: #5A6670')}>{note}</span>}
                      </span>
                    </div>
                    {(before || after) && (
                      <div style={css(`display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px; margin-left: 16px; padding: 6px 8px; border-radius: 6px; background: #F4F6F8; font-family: ${MONO}; font-size: 11.5px; overflow-wrap: anywhere`)}>
                        <span style={css('color: #5A6670')}>{before || '—'}</span>
                        <Icon d="M5 12h14M13 6l6 6-6 6" size={13} color="#8C979F" />
                        <span style={css('color: #142019; font-weight: 500')}>{after || '—'}</span>
                      </div>
                    )}
                    <button role="checkbox" aria-checked={on} onClick={() => this.toggleFix(id, i)}
                      style={css(`display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-left: 16px; border: 0; background: transparent; padding: 2px 0; min-height: 34px; text-align: left; font-weight: 600; font-size: 13px; color: ${on ? '#0B6E5F' : '#3E4A53'}`)}>
                      <span style={css(`flex: none; width: 18px; height: 18px; border-radius: 4px; border: 2px solid ${on ? '#0B6E5F' : '#9AA4AC'}; background: ${on ? '#0B6E5F' : '#FFFFFF'}; display: grid; place-items: center`)}>
                        {on && <Icon d="M5 12l5 5 9-10" size={12} color="#FFFFFF" width={3} />}
                      </span>
                      <span style={css('flex: 1 1 140px; min-width: 0')}>{fix}</span>
                      {!rec && <span style={css('flex: none; padding: 1px 8px; border-radius: 999px; background: #FBEBD0; color: #8A4F00; font-size: 11px; font-weight: 600')}>Not recommended</span>}
                    </button>
                    {!rec && why && <span style={css('margin-left: 16px; font-size: 12px; color: #8A4F00')}>{why}</span>}
                  </li>
                );
              })}
            </ul>
            <span style={css('font-size: 12px; color: #5A6670')}>Your original file is kept. Accepted fixes are saved as a recipe you can reuse.</span>
          </>
        )}
      </section>
    );
  }

  renderHome() {
    const q = this.state.query.trim().toLowerCase();
    return (
      <main style={css('max-width: 1240px; margin: 0 auto; padding: 32px 24px 56px; display: flex; flex-direction: column; gap: 24px')}>
        <div style={css('display: flex; flex-wrap: wrap; align-items: flex-end; gap: 16px 24px')}>
          <div style={css('flex: 1 1 420px; min-width: 0')}>
            <h1 style={css(`margin: 0; font-family: ${DISPLAY}; font-weight: 700; font-size: 34px; line-height: 1.1; letter-spacing: -0.02em; text-wrap: balance`)}>What do you want to do with your data?</h1>
            <p style={css('margin: 8px 0 0; color: #5A6670; font-size: 15px')}>Pick a tool. Each one opens with only the upload, models and settings it needs.</p>
          </div>
          <label style={css('flex: 0 1 320px; display: flex; align-items: center; gap: 8px; padding: 0 12px; min-height: 44px; border: 1px solid #D9DEE3; border-radius: 10px; background: #FFFFFF')}>
            <Icon d="M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14M20 20l-4-4" size={16} color="#5A6670" />
            <input type="search" value={this.state.query} onChange={(e) => this.setState({ query: e.target.value })} placeholder="Search tools" aria-label="Search tools"
              style={css('flex: 1 1 auto; min-width: 0; border: 0; background: transparent; min-height: 40px; outline: none')} />
          </label>
        </div>

        {(!q || (PREP_TOOL.name + ' ' + PREP_TOOL.desc + ' clean').toLowerCase().includes(q)) && (
          <button className="tool-card" onClick={() => this.setState({ toolId: PREP_TOOL.id })}
            style={css('display: flex; flex-wrap: wrap; align-items: center; gap: 14px 18px; text-align: left; padding: 18px 20px; border: 1px solid #D9DEE3; border-radius: 16px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(20, 32, 25, 0.04); transition: border-color 0.12s, box-shadow 0.12s')}>
            <span style={css('flex: none; width: 48px; height: 48px; border-radius: 12px; background: #142019; color: #FFFFFF; display: grid; place-items: center')}><Icon name="prep" size={24} /></span>
            <span style={css('flex: 1 1 320px; min-width: 0; display: flex; flex-direction: column; gap: 2px')}>
              <span style={css(`font-family: ${MONO}; font-size: 10.5px; letter-spacing: 0.1em; color: #0B6E5F`)}>START HERE IF YOUR DATA IS MESSY</span>
              <span style={css(`font-family: ${DISPLAY}; font-weight: 700; font-size: 19px`)}>{PREP_TOOL.name}</span>
              <span style={css('font-size: 13.5px; color: #5A6670')}>{PREP_TOOL.desc} Every tool below also checks your data automatically.</span>
            </span>
            <span style={css('flex: none; display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; min-height: 40px; border-radius: 8px; background: #0B6E5F; color: #FFFFFF; font-weight: 600')}>Open<Icon d="M9 6l6 6-6 6" size={16} /></span>
          </button>
        )}

        <div className="cols" style={css('display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; align-items: start')}>
          {CATALOG.map((col) => {
            const tools = col.tools.filter((t) => !q || (t.name + ' ' + t.desc).toLowerCase().includes(q));
            return (
              <section key={col.name} aria-label={col.name} style={css('display: flex; flex-direction: column; gap: 10px; min-width: 0; padding: 16px; background: #EBEEF1; border-radius: 16px')}>
                <div style={css('display: flex; align-items: baseline; justify-content: space-between; gap: 8px; padding: 2px 4px 6px')}>
                  <div style={css('min-width: 0')}>
                    <h2 style={css(`margin: 0; font-family: ${DISPLAY}; font-weight: 700; font-size: 18px`)}>{col.name}</h2>
                    <div style={css('font-size: 12.5px; color: #5A6670')}>{col.desc}</div>
                  </div>
                  <span style={css(`flex: none; font-family: ${MONO}; font-size: 11px; color: #5A6670`)}>{tools.length} {tools.length === 1 ? 'tool' : 'tools'}</span>
                </div>
                {tools.map((t) => (
                  <button key={t.id} className="tool-card" onClick={() => this.setState({ toolId: t.id })}
                    style={css('display: grid; grid-template-columns: 44px minmax(0, 1fr) 20px; gap: 12px; align-items: start; text-align: left; padding: 14px; border: 1px solid #D9DEE3; border-radius: 12px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(20, 32, 25, 0.04); transition: border-color 0.12s, box-shadow 0.12s')}>
                    <span style={css('width: 44px; height: 44px; border-radius: 11px; background: #DDEFEA; color: #0B6E5F; display: grid; place-items: center')}><Icon name={t.id} size={22} /></span>
                    <span style={css('display: flex; flex-direction: column; gap: 3px; min-width: 0')}>
                      <span style={css('font-weight: 600; font-size: 15px')}>{t.name}</span>
                      <span style={css('font-size: 13px; color: #5A6670; line-height: 1.4')}>{t.desc}</span>
                      <span style={css(`margin-top: 4px; font-family: ${MONO}; font-size: 11px; color: #5A6670`)}>{t.accepts}</span>
                    </span>
                    <Icon d="M9 6l6 6-6 6" color="#8C979F" style={{ marginTop: 12 }} />
                  </button>
                ))}
                {tools.length === 0 && <p style={css('margin: 0; padding: 14px; border: 1px dashed #C3CBD2; border-radius: 12px; color: #5A6670; font-size: 13px')}>No tools here match your search.</p>}
              </section>
            );
          })}
        </div>
      </main>
    );
  }

  renderTool() {
    const { tool: t, column } = findTool(this.state.toolId);
    const id = t.id, w = this.work(id), r = t.result;
    const st = STATUS[w.status] || STATUS.idle;
    const done = w.status === 'done';
    const checks = CHECKS[id] || [];
    const applied = checks.filter((c, i) => w.fixes[i]);
    const cantRun = !w.file || w.status === 'running' || w.check === 'running';
    const runLabel = w.check === 'running' ? 'Checking data…'
      : w.status === 'running' ? (t.prep ? 'Applying…' : 'Running…')
      : done ? (t.prep ? 'Apply again' : 'Run again')
      : t.prep ? `Apply ${applied.length} fixes` : 'Run ' + t.name;
    const card = css('background: #FFFFFF; border: 1px solid #D9DEE3; border-radius: 14px; padding: 18px; display: flex; flex-direction: column; gap: 12px');
    const control = css('border: 1px solid #D9DEE3; border-radius: 8px; padding: 8px 10px; min-height: 42px; font-weight: 400; font-size: 14px; background: #FFFFFF');
    const field = css('display: flex; flex-direction: column; gap: 6px; font-weight: 600; font-size: 13px');
    const step = (n, text) => (
      <h2 style={css(`margin: 0; display: flex; align-items: center; gap: 10px; font-family: ${DISPLAY}; font-weight: 700; font-size: 17px`)}>
        <span style={css(`width: 24px; height: 24px; border-radius: 50%; background: #142019; color: #FFFFFF; display: grid; place-items: center; font-family: ${MONO}; font-size: 12px; font-weight: 500`)}>{n}</span>{text}
      </h2>
    );
    const outline = css('border: 1px solid #D9DEE3; border-radius: 8px; background: #FFFFFF; padding: 8px 14px; min-height: 40px; font-weight: 600');

    return (
      <main style={css('max-width: 1240px; margin: 0 auto; padding: 20px 24px 56px; display: flex; flex-direction: column; gap: 20px')}>
        <nav aria-label="Breadcrumb" style={css('display: flex; flex-wrap: wrap; align-items: center; gap: 6px; font-size: 13px; color: #5A6670')}>
          <button onClick={() => this.setState({ toolId: null })} style={css('display: inline-flex; align-items: center; gap: 4px; border: 0; background: transparent; padding: 6px 4px; min-height: 36px; color: #0B6E5F; font-weight: 600')}>
            <Icon d="M15 6l-6 6 6 6" size={16} />All tools
          </button>
          <span aria-hidden="true">/</span><span>{column}</span><span aria-hidden="true">/</span><span style={css('color: #142019; font-weight: 600')}>{t.name}</span>
        </nav>

        <div style={css('display: flex; align-items: center; gap: 14px; min-width: 0')}>
          <span style={css('flex: none; width: 52px; height: 52px; border-radius: 13px; background: #DDEFEA; color: #0B6E5F; display: grid; place-items: center')}><Icon name={id} size={26} /></span>
          <div style={css('min-width: 0')}>
            <h1 style={css(`margin: 0; font-family: ${DISPLAY}; font-weight: 700; font-size: 30px; line-height: 1.1; letter-spacing: -0.02em`)}>{t.name}</h1>
            <p style={css('margin: 4px 0 0; color: #5A6670; font-size: 15px')}>{t.long}</p>
          </div>
        </div>

        <div style={css('display: flex; flex-wrap: wrap; align-items: flex-start; gap: 20px')}>
          {/* Setup */}
          <div style={css('flex: 1 1 360px; max-width: 460px; min-width: 0; display: flex; flex-direction: column; gap: 16px')}>
            <section style={card}>
              {step(1, 'Upload data')}
              {!w.file ? (
                <>
                  <label style={css('position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; text-align: center; padding: 26px 16px; border: 2px dashed #BCC5CD; border-radius: 12px; background: #F7F9FA; cursor: pointer')}>
                    <input type="file" onChange={(e) => { const f = e.target.files?.[0]; if (f) this.loadFile(id, f.name, fileSize(f.size)); }}
                      aria-label="Upload data file" style={css('position: absolute; width: 1px; height: 1px; opacity: 0')} />
                    <UploadIcon />
                    <span style={css('font-weight: 600')}>Drop a file or <span style={css('color: #0B6E5F; text-decoration: underline')}>browse</span></span>
                    <span style={css(`font-family: ${MONO}; font-size: 11.5px; color: #5A6670`)}>{t.accepts}</span>
                  </label>
                  <button onClick={() => this.loadFile(id, t.sample[0], t.sample[1] + ' · sample')}
                    style={css('align-self: flex-start; border: 0; background: transparent; color: #0B6E5F; font-weight: 600; padding: 4px 0; min-height: 32px; text-decoration: underline')}>Use sample file: {t.sample[0]}</button>
                </>
              ) : (
                <div style={css('display: flex; align-items: center; gap: 10px; padding: 12px; border: 1px solid #D9DEE3; border-radius: 10px; background: #F7F9FA; min-width: 0')}>
                  <FileIcon size={20} />
                  <span style={css('display: flex; flex-direction: column; min-width: 0; flex: 1 1 auto')}>
                    <span style={css(`font-family: ${MONO}; font-size: 12.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap`)}>{w.file}</span>
                    <span style={css('font-size: 12px; color: #5A6670')}>{w.size}</span>
                  </span>
                  <button onClick={() => this.clearFile(id)} aria-label="Remove file"
                    style={css('flex: none; width: 36px; height: 36px; border: 0; border-radius: 8px; background: transparent; color: #5A6670; display: grid; place-items: center; padding: 0')}><CloseIcon /></button>
                </div>
              )}
            </section>

            {this.renderCheck(id, w, checks, card, step)}

            {!t.prep && (
            <section style={{ ...card, gap: 10 }}>
              {step(3, 'Choose a model')}
              {t.models.map(([name, note]) => {
                const on = w.model === name;
                return (
                  <button key={name} onClick={() => this.setWork(id, { model: name, status: w.file ? 'ready' : 'idle' })} aria-pressed={on}
                    style={css(`display: grid; grid-template-columns: 20px minmax(0, 1fr); gap: 10px; align-items: start; text-align: left; padding: 10px 12px; border: 1.5px solid ${on ? '#0B6E5F' : '#E3E7EB'}; border-radius: 10px; background: ${on ? '#F1F8F6' : '#FFFFFF'}`)}>
                    <span style={css(`margin-top: 2px; width: 18px; height: 18px; border-radius: 50%; border: 2px solid ${on ? '#0B6E5F' : '#9AA4AC'}; display: grid; place-items: center`)}>
                      {on && <span style={css('width: 8px; height: 8px; border-radius: 50%; background: #0B6E5F')} />}
                    </span>
                    <span style={css('display: flex; flex-direction: column; min-width: 0')}>
                      <span style={css('font-weight: 600')}>{name}</span>
                      <span style={css('font-size: 12.5px; color: #5A6670')}>{note}</span>
                    </span>
                  </button>
                );
              })}
              <span style={css('font-size: 12px; color: #5A6670')}>Or add your own: a Hugging Face model ID or an .onnx file.</span>
            </section>
            )}

            <section style={{ ...card, gap: 14 }}>
              {step(t.prep ? 3 : 4, t.prep ? 'Output' : t.name + ' settings')}
              {t.opts.map((o) => {
                const v = w.opts[o.key];
                if (o.type === 'select') return (
                  <label key={o.key} style={field}>{o.label}
                    <select value={v} onChange={(e) => this.setOpt(id, o.key, e.target.value)} style={control}>{o.options.map((x) => <option key={x} value={x}>{x}</option>)}</select>
                  </label>
                );
                if (o.type === 'range') return (
                  <label key={o.key} style={field}>
                    <span style={css('display: flex; justify-content: space-between; gap: 8px')}><span>{o.label}</span><span style={css(`font-family: ${MONO}; font-weight: 500`)}>{v}{o.unit}</span></span>
                    <input type="range" min={o.min} max={o.max} step={o.step} value={v} onChange={(e) => this.setOpt(id, o.key, Number(e.target.value))} style={css('accent-color: #0B6E5F; min-height: 32px')} />
                  </label>
                );
                return (
                  <button key={o.key} role="switch" aria-checked={!!v} onClick={() => this.setOpt(id, o.key, !v)}
                    style={css('display: flex; align-items: center; justify-content: space-between; gap: 12px; border: 0; background: transparent; padding: 4px 0; min-height: 40px; text-align: left; font-weight: 600; font-size: 13px')}>
                    <span>{o.label}</span>
                    <span style={css(`flex: none; width: 40px; height: 24px; border-radius: 12px; background: ${v ? '#0B6E5F' : '#C3CBD2'}; position: relative`)}>
                      <span style={css(`position: absolute; top: 3px; left: ${v ? 19 : 3}px; width: 18px; height: 18px; border-radius: 50%; background: #FFFFFF; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2); transition: left 0.12s`)} />
                    </span>
                  </button>
                );
              })}
            </section>

            <button onClick={() => this.run(id)} disabled={cantRun}
              style={css(`border: 0; border-radius: 10px; background: #0B6E5F; color: #FFFFFF; padding: 12px 18px; min-height: 48px; font-weight: 600; font-size: 15px; opacity: ${cantRun ? 0.5 : 1}`)}>
              {runLabel}
            </button>
          </div>

          {/* Results */}
          <section aria-label="Results" style={css('flex: 999 1 480px; min-width: 0; background: #FFFFFF; border: 1px solid #D9DEE3; border-radius: 14px; padding: 20px; display: flex; flex-direction: column; gap: 16px')}>
            <div style={css('display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px')}>
              <h2 style={css(`margin: 0; margin-right: auto; font-family: ${DISPLAY}; font-weight: 700; font-size: 19px`)}>Results</h2>
              <span style={css(`display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; background: ${st[1]}; color: ${st[2]}`)}>
                <span style={css(`width: 7px; height: 7px; border-radius: 50%; background: ${st[2]}`)} />{st[0]}
              </span>
            </div>

            {(w.status === 'idle' || w.status === 'ready') && (
              <div style={css('display: grid; place-items: center; text-align: center; min-height: 300px; border: 1px dashed #C3CBD2; border-radius: 12px; padding: 24px; color: #5A6670')}>
                <div style={css('display: flex; flex-direction: column; align-items: center; gap: 8px; max-width: 340px')}>
                  <Icon name={id} size={32} color="#9AA4AC" width={1.8} />
                  <span style={css('font-weight: 600; color: #142019')}>{!w.file ? 'No results yet' : w.check === 'running' ? 'Checking your data…' : 'Ready when you are'}</span>
                  <span style={css('font-size: 13px')}>{!w.file ? (t.prep ? 'Upload a file or use the sample file to see what needs fixing.' : `Upload a file or use the sample file, then run ${t.name}.`)
                    : w.check === 'running' ? 'Looking for problems before anything runs.'
                    : t.prep ? 'Choose which fixes to keep, then press Apply.' : 'Review the data check, model and settings, then press Run.'}</span>
                </div>
              </div>
            )}

            {w.status === 'running' && (
              <div style={css('display: flex; flex-direction: column; gap: 10px; justify-content: center; min-height: 300px; padding: 24px; border-radius: 12px; background: #F7F9FA')}>
                <span>{t.prep ? 'Applying fixes to ' : <>Running <b>{w.model}</b> on </>}{w.file}…</span>
                <div style={css('height: 6px; border-radius: 3px; background: #DDE2E6; overflow: hidden')}><div className="bar-run" style={css('width: 40%; height: 100%; border-radius: 3px; background: #0B6E5F')} /></div>
              </div>
            )}

            {done && (
              <>
                <div style={css('display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px')}>
                  {r.metrics.map(([label, value, color]) => (
                    <div key={label} style={css('padding: 12px 14px; border-radius: 10px; background: #F7F9FA; border: 1px solid #EDF0F2')}>
                      <div style={css('font-size: 12px; color: #5A6670')}>{label}</div>
                      <div style={css(`font-family: ${DISPLAY}; font-weight: 700; font-size: 22px; font-variant-numeric: tabular-nums; color: ${color || '#142019'}`)}>{value}</div>
                    </div>
                  ))}
                </div>
                {t.prep ? <Recipe applied={applied} /> : applied.length > 0 && (
                  <div style={css('display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 8px; background: #F1F8F6; color: #0B6E5F; font-size: 13px; font-weight: 600')}>
                    <Icon d="M5 12l5 5 9-10" size={16} />Data check: {applied.length} {applied.length === 1 ? 'fix' : 'fixes'} applied before running
                  </div>
                )}
                <span style={css('font-weight: 600')}>{r.title}</span>
                <Result r={r} />
                <div style={css('display: flex; flex-wrap: wrap; gap: 8px; padding-top: 14px; border-top: 1px solid #EDF0F2')}>
                  <button style={outline}>{t.prep ? 'Download cleaned file' : 'Export CSV'}</button>
                  <button style={outline}>{t.prep ? 'Download recipe' : 'Export JSON'}</button>
                  <a href="#/" style={css('display: inline-flex; align-items: center; padding: 8px 14px; min-height: 40px; border-radius: 8px; background: #142019; color: #FFFFFF; text-decoration: none; font-weight: 600')}>Add to whiteboard</a>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    );
  }

  render() {
    return (
      <div style={css('min-height: 100vh; background: #F4F6F8')}>
        <header style={css('display: flex; flex-wrap: wrap; align-items: center; gap: 10px 16px; padding: 12px 24px; background: #FFFFFF; border-bottom: 1px solid #D9DEE3')}>
          <button onClick={() => this.setState({ toolId: null })} aria-label="All tools" style={css('display: flex; align-items: center; gap: 10px; border: 0; background: transparent; padding: 0; margin-right: auto; text-align: left')}>
            <span style={css('width: 32px; height: 32px; border-radius: 8px; background: #142019; display: grid; place-items: center; flex: none')}><Icon name="grid" color="#F4F6F8" /></span>
            <span style={css('display: flex; flex-direction: column')}>
              <span style={css(`font-family: ${DISPLAY}; font-weight: 700; font-size: 18px; line-height: 1.1`)}>AI Tools</span>
              <span style={css(`font-family: ${MONO}; font-size: 10.5px; color: #5A6670; letter-spacing: 0.04em`)}>MOCKUP · SAMPLE DATA</span>
            </span>
          </button>
          <a href="#/" style={css('display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; min-height: 40px; border: 1px solid #D9DEE3; border-radius: 8px; background: #FFFFFF; color: #142019; text-decoration: none; font-weight: 600')}>
            <Icon name="board" size={15} />Open whiteboard
          </a>
        </header>
        {this.state.toolId ? this.renderTool() : this.renderHome()}
      </div>
    );
  }
}

function Recipe({ applied }) {
  return (
    <div style={css('display: flex; flex-direction: column; gap: 6px; padding: 14px 16px; border-radius: 12px; background: #F7F9FA; border: 1px solid #EDF0F2')}>
      <span style={css('font-weight: 600')}>Recipe · {applied.length} {applied.length === 1 ? 'step' : 'steps'}, in order</span>
      {applied.length === 0 ? <span style={css('font-size: 13px; color: #5A6670')}>No fixes selected. The file was saved unchanged.</span> : (
        <ol style={css('margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 3px; font-size: 13.5px')}>
          {applied.map((c) => <li key={c[1]}>{c[3]} <span style={css('color: #5A6670')}>· {c[1].toLowerCase()}</span></li>)}
        </ol>
      )}
    </div>
  );
}

function Result({ r }) {
  if (r.kind === 'bars') return (
    <div style={css('display: flex; flex-direction: column; gap: 10px; font-variant-numeric: tabular-nums')}>
      {r.bars.map(([label, pct, text, color]) => (
        <div key={label} style={css('display: grid; grid-template-columns: minmax(90px, 160px) minmax(0, 1fr) 52px; gap: 12px; align-items: center')}>
          <span style={css('overflow: hidden; text-overflow: ellipsis; white-space: nowrap')}>{label}</span>
          <div style={css('height: 12px; background: #EDF0F2; border-radius: 6px')}><div style={css(`width: ${pct}%; height: 100%; background: ${color}; border-radius: 6px`)} /></div>
          <span style={css('text-align: right')}>{text}</span>
        </div>
      ))}
    </div>
  );

  if (r.kind === 'table' || r.kind === 'recipe') {
    const th = css('padding: 0 12px 8px 0; font-weight: 500');
    return (
      <div style={css('overflow-x: auto')}>
        <table style={css('width: 100%; border-collapse: collapse; font-size: 13.5px; font-variant-numeric: tabular-nums')}>
          <thead><tr style={css(`text-align: left; font-family: ${MONO}; font-size: 10.5px; letter-spacing: 0.06em; color: #5A6670`)}>
            <th style={th}>{r.cols[0]}</th><th style={th}>{r.cols[1]}</th><th style={{ ...th, textAlign: 'right', paddingRight: 0 }}>{r.cols[2]}</th>
          </tr></thead>
          <tbody>
            {r.rows.map(([a, b, c, flag]) => (
              <tr key={a} style={css(`border-top: 1px solid #EDF0F2; background: ${flag ? '#FBEBD0' : 'transparent'}`)}>
                <td style={css('padding: 9px 12px 9px 6px')}>{a}</td><td style={css('padding: 9px 12px 9px 0')}>{b}</td>
                <td style={css(`padding: 9px 6px 9px 0; text-align: right; color: ${flag ? '#8A4F00' : '#142019'}; font-weight: ${flag ? 600 : 400}`)}>{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (r.kind === 'text') return (
    <div style={css('padding: 16px 18px; border-radius: 12px; background: #F7F9FA; border: 1px solid #EDF0F2; display: flex; flex-direction: column; gap: 10px; max-width: 68ch')}>
      <p style={css('margin: 0; font-size: 15px; line-height: 1.6')}>{r.summary}</p>
      <ul style={css('margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 4px')}>{r.points.map((p) => <li key={p}>{p}</li>)}</ul>
    </div>
  );

  if (r.kind === 'boxes') return (
    <div role="img" aria-label="Shelf photo with detected products outlined" style={css('position: relative; width: 100%; aspect-ratio: 16 / 9; border-radius: 12px; overflow: hidden; background: #E3E8EC')}>
      <div style={css('position: absolute; left: 0; right: 0; top: 33%; height: 3%; background: #C9D1D8')} />
      <div style={css('position: absolute; left: 0; right: 0; top: 68%; height: 3%; background: #C9D1D8')} />
      {r.boxes.map(([l, t, w, h, label, color]) => (
        <div key={label + l} style={css(`position: absolute; left: ${l}%; top: ${t}%; width: ${w}%; height: ${h}%; background: ${color === AMBER ? 'rgba(201, 112, 26, 0.12)' : 'rgba(11, 110, 95, 0.10)'}; border: 2px solid ${color}; border-radius: 4px`)}>
          <span style={css(`position: absolute; left: -2px; top: -22px; padding: 1px 6px; border-radius: 4px 4px 4px 0; background: ${color}; color: #FFFFFF; font-family: ${MONO}; font-size: 10.5px; white-space: nowrap`)}>{label}</span>
        </div>
      ))}
    </div>
  );

  // Forecast chart
  return (
    <svg viewBox="0 0 640 250" width="100%" role="img" aria-label="Weekly revenue over the past year with a forecast and confidence band" style={{ display: 'block' }}>
      <g stroke="#EDF0F2" strokeWidth="1"><line x1="48" y1="30" x2="630" y2="30" /><line x1="48" y1="90" x2="630" y2="90" /><line x1="48" y1="150" x2="630" y2="150" /><line x1="48" y1="210" x2="630" y2="210" /></g>
      <g fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#5A6670">
        <text x="40" y="34" textAnchor="end">1.6M</text><text x="40" y="94" textAnchor="end">1.2M</text><text x="40" y="154" textAnchor="end">0.8M</text><text x="40" y="214" textAnchor="end">0.4M</text>
        <text x="48" y="232">Oct '25</text><text x="250" y="232" textAnchor="middle">Mar '26</text><text x="452" y="232" textAnchor="middle">Today</text><text x="630" y="232" textAnchor="end">Jan '27</text>
      </g>
      <polygon points="452,112 482,100 512,84 542,70 572,58 602,50 630,44 630,126 602,128 572,132 542,138 512,146 482,152 452,124" fill="#DDEFEA" />
      <line x1="452" y1="22" x2="452" y2="212" stroke="#9AA4AC" strokeDasharray="3 3" />
      <polyline points="48,132 80,138 112,126 144,146 176,152 208,140 240,134 272,128 304,138 336,124 368,120 400,130 430,124 452,118" fill="none" stroke="#142019" strokeWidth="2.2" strokeLinejoin="round" />
      <polyline points="452,118 482,126 512,115 542,104 572,95 602,89 630,85" fill="none" stroke="#0B6E5F" strokeWidth="2.8" strokeDasharray="7 5" strokeLinejoin="round" />
      <g fontFamily="Schibsted Grotesk, sans-serif" fontSize="12" fill="#5A6670">
        <line x1="48" y1="244" x2="66" y2="244" stroke="#142019" strokeWidth="2" /><text x="72" y="248">Actual</text>
        <line x1="130" y1="244" x2="148" y2="244" stroke="#0B6E5F" strokeWidth="2.8" strokeDasharray="6 4" /><text x="154" y="248">Forecast</text>
        <rect x="222" y="238" width="18" height="12" fill="#DDEFEA" /><text x="246" y="248">90% interval</text>
      </g>
    </svg>
  );
}

