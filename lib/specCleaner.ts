/**
 * specCleaner.ts
 * Robust converter for messy phone specification tables
 * (the kind of data you get when scraping WhatMobile, GSMArena-style tables,
 *  or when users copy-paste table rows with columns like General / Features / FIELD3...)
 */

export interface CleanSpecs {
  // releaseDate removed from specs.
  // It is automatically extracted to the top-level phone.releaseDate field during upload.
  sim?: string;
  weight?: string;
  os?: string;

  display?: {
    size?: string;
    type?: string;
    resolution?: string;
    refreshRate?: string;
    protection?: string;
  };

  memory?: {
    ram?: string;
    storage?: string;
    cardSlot?: string;
  };

  performance?: {
    processor?: string;
    gpu?: string;
  };

  battery?: {
    capacity?: string;
    charging?: string;
  };

  camera?: {
    rear?: string | any;
    front?: string | any;
  };

  connectivity?: {
    [key: string]: boolean | string;
  };

  body?: {
    dimensions?: string;
    build?: string;
  };

  mainCamera?: {
    features?: string;
    video?: string;
  };

  selfieCamera?: {
    features?: string;
    video?: string;
  };

  sound?: {
    loudspeaker?: string;
    jack?: string;
  };

  comms?: {
    wlan?: string;
    bluetooth?: string;
    gps?: string;
    nfc?: string;
    radio?: string;
    usb?: string;
  };

  features?: {
    sensors?: string;
  };

  misc?: {
    colors?: string;
    models?: string;
  };

  other?: Record<string, any>;
}

/**
 * Extract release date from raw rows (before or after parseSpecsInput).
 * Supports both combined format {General: "Release Date", Features: "02 Feb 2026"}
 * and legacy 2-row format (label row followed by value row).
 * Used by add form and API so the top-level phone.releaseDate is populated
 * even though we no longer store releaseDate inside specs.
 */
export function extractReleaseDate(rows: any[]): string | undefined {
  if (!Array.isArray(rows)) return undefined;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] || {};
    const vals = Object.values(row).map((v: any) => String(v || '').trim());
    const lowerVals = vals.map(v => v.toLowerCase());
    if (lowerVals.some(v => v.includes('release') || v.includes('date'))) {
      // Prefer same-row value (current raw parser + form defaults produce this)
      if (vals.length > 1) {
        const nonLabel = vals.filter((v, idx) => {
          const l = lowerVals[idx];
          return !(l.includes('release') || l.includes('date') || l.includes('general') || l.includes('features'));
        });
        if (nonLabel.length) {
          let d = nonLabel.join(' ').trim();
          d = d.replace(/\b(general|features|release|date)\b/gi, '').trim();
          if (d && /\d/.test(d)) return d;
        }
      }
      // Fallback: next row (legacy label-then-value rows)
      if (i + 1 < rows.length) {
        const nextRow = rows[i + 1] || {};
        const nextVals = Object.values(nextRow).map((v: any) => String(v || '').trim()).filter(Boolean);
        if (nextVals.length) {
          let d = nextVals.join(' ').trim();
          d = d.replace(/\b(general|features|release|date)\b/gi, '').trim();
          if (d && /\d/.test(d)) return d;
        }
      }
    }
  }
  return undefined;
}

/** Normalize a string */
function norm(str: any): string {
  return String(str ?? '').trim();
}

/** Case-insensitive includes helper */
function has(text: string, ...needles: string[]): boolean {
  const t = text.toLowerCase();
  return needles.some(n => t.includes(n.toLowerCase()));
}

/** Extract first number + optional unit (useful for RAM, storage, camera MP, weight) */
function extractNumberWithUnit(text: string): string | null {
  const match = text.match(/(\d+(?:\.\d+)?)\s*(GB|MB|inch|inches|"|g|kg|MP|mAh|Hz)?/i);
  if (!match) return null;
  const num = match[1];
  const unit = match[2] ? ' ' + match[2] : '';
  return num + unit;
}

/** Turn "6.83\"" + "144Hz" + "AMOLED" into proper fields */
function parseDisplayValue(rowValues: string[]): Partial<CleanSpecs['display']> {
  const result: any = {};
  const joined = rowValues.join(' ').toLowerCase();

  for (const v of rowValues) {
    const clean = norm(v);
    if (!clean) continue;

    if (/\d/.test(clean) && (clean.includes('"') || clean.includes('inch') || /6\.\d/.test(clean))) {
      result.size = clean.replace(/"/g, ' inches').replace(/\s+/g, ' ').trim();
    }
    if (has(clean, 'amoled', 'oled', 'lcd', 'ips', 'tft', 'super amoled', 'dynamic amoled')) {
      result.type = clean;
    }
    if (/\d+\s*[x×]\s*\d+/.test(clean)) {
      result.resolution = clean.replace(/[×]/g, 'x').trim();
    }
    if (/\d+\s*hz/i.test(clean)) {
      result.refreshRate = clean;
    }
    if (has(clean, 'gorilla', 'glass', 'protection', 'corning')) {
      result.protection = clean;
    }
  }

  // Fallback: sometimes all info is smashed in one cell
  if (!result.size && joined.match(/(\d+\.?\d*)\s*inch/i)) {
    result.size = joined.match(/(\d+\.?\d*\s*inch)/i)?.[0] || '';
  }

  return result;
}

/** Main converter */
export function cleanMobileSpecs(messyArray: Array<Record<string, any>>): CleanSpecs {
  if (!Array.isArray(messyArray)) return {};

  const specs: CleanSpecs = {
    display: {},
    memory: {},
    performance: {},
    battery: {},
    camera: {},
    connectivity: {},
    body: {},
    mainCamera: {},
    selfieCamera: {},
    sound: {},
    comms: {},
    features: {},
    misc: {},
    other: {},
  };

  const flat: Record<string, string> = {}; // temporary flat storage for heuristics

  // Normalize rows to handle BOTH formats reliably:
  // - Combined: { General: "Internal Memory", Features: "512 GB" }
  // - 2-row style (common in form defaults): label row then value row
  function normalizeToPairs(rows: any[]): Array<[string, string]> {
    const pairs: Array<[string, string]> = [];
    let pendingLabel: string | null = null;
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i] || {};
      const vals = Object.values(r).map(norm).filter(Boolean);
      if (vals.length === 0) continue;
      const first = vals[0];
      const second = vals[1] || '';
      const firstL = first.toLowerCase();

      const isLikelySection = /^(general|display|screen|memory|performance|battery|camera|connectivity|sound|body|misc|features|other)$/i.test(first);
      const looksPureValue = /\d/.test(first) ||
        has(first, 'yes', 'no', 'n/a', 'android', 'snapdragon', 'gb', 'mp', 'mah', 'mm', 'hz', 'inch', 'g', 'ultra', 'elite') ||
        first.length > 6;

      if (pendingLabel && looksPureValue && !isLikelySection) {
        pairs.push([pendingLabel, vals.join(' ')]);
        pendingLabel = null;
        continue;
      }

      if (second) {
        pairs.push([first, second]);
        pendingLabel = null;
      } else if (!isLikelySection) {
        pendingLabel = first;
      } else {
        pendingLabel = null;
      }
    }
    return pairs;
  }

  const pairs = normalizeToPairs(messyArray);

  // First pass: build a rich flat map + detect sections
  let lastLabelRow: string[] = [];

  for (let i = 0; i < messyArray.length; i++) {
    const row = messyArray[i] || {};
    const values = Object.values(row)
      .map(norm)
      .filter(Boolean);

    if (values.length === 0) continue;

    const joined = values.join(' | ');
    const lowerJoined = joined.toLowerCase();

    // === Detect label/header rows (e.g. "Release | Date", "Screen | Size") ===
    const looksLikeLabelRow =
      values.length >= 2 &&
      values.every(v => v.length < 25) &&
      !/\d{2,}/.test(values[0]); // first cell usually not a big number

    if (looksLikeLabelRow) {
      lastLabelRow = values;
      continue;
    }

    // === Value row (often follows a label row) ===
    // Try to pair with previous labels when possible
    const labelContext = lastLabelRow.length > 0 ? lastLabelRow.join(' ').toLowerCase() : lowerJoined;

    // --- SIM ---
    if (has(labelContext, 'sim', 'dual sim')) {
      const simVal = values.find(v => has(v, 'dual', 'single', 'sim')) ||
                     values.filter(v => !has(v, 'sim', 'support', 'general')).join(' ');
      if (simVal) specs.sim = simVal.replace(/support/gi, '').trim();
    }

    // --- Weight ---
    if (has(labelContext, 'weight', 'gram')) {
      const w = values.find(v => /\d+\s*g/i.test(v)) || values.find(v => /\d/.test(v));
      if (w) specs.weight = w;
    }

    // --- Operating System ---
    if (has(labelContext, 'operating', 'system', 'os ', 'hyperos', 'android', 'ios')) {
      const osVal = values
        .filter(v => !has(v, 'operating', 'system', 'general'))
        .join(' ')
        .trim();
      if (osVal) specs.os = osVal;
    }

    // --- DISPLAY / SCREEN section ---
    if (has(labelContext, 'display', 'screen')) {
      const displayInfo = parseDisplayValue(values);
      if (specs.display) {
        Object.assign(specs.display, displayInfo);
      }

      // Also try to pick up protection / refresh from nearby rows
      for (let k = i; k < Math.min(i + 3, messyArray.length); k++) {
        const extra = parseDisplayValue(
          Object.values(messyArray[k] || {}).map(norm).filter(Boolean)
        );
        if (specs.display) {
          Object.assign(specs.display, extra);
        }
      }
    }

    // --- MEMORY / STORAGE ---
    if (has(labelContext, 'memory', 'ram', 'internal', 'storage', 'rom')) {
      for (const v of values) {
        const lower = v.toLowerCase();
        if (specs.memory) {
          if (/\d+\s*gb/i.test(v) && (lower.includes('ram') || has(labelContext, 'ram'))) {
            specs.memory.ram = v.replace(/ram/i, '').trim();
          } else if (/\d+\s*gb/i.test(v) && !specs.memory.storage) {
            specs.memory.storage = v;
          }
          if (has(v, 'card', 'slot', 'microsd', 'n/a')) {
            specs.memory.cardSlot = v;
          }
        }
      }
    }

    // --- PERFORMANCE (Processor / GPU) ---
    if (has(labelContext, 'performance', 'processor', 'chipset', 'cpu', 'gpu')) {
      for (const v of values) {
        if (specs.performance) {
          if (!specs.performance.processor && !has(v, 'gpu', 'mali', 'adreno')) {
            if (has(v, 'mediatek', 'snapdragon', 'dimensity', 'exynos', 'tensor', 'helio', 'unisoc')) {
              specs.performance.processor = v;
            }
          }
          if (has(v, 'mali', 'adreno', 'gpu')) {
            specs.performance.gpu = v;
          }
        }
      }
      // Sometimes processor name is just sitting in a value cell
      if (specs.performance && !specs.performance.processor) {
        const proc = values.find(v =>
          has(v, 'mediatek', 'snapdragon', 'dimensity', 'exynos', 'tensor', 'helio')
        );
        if (proc) specs.performance.processor = proc;
      }
    }

    // --- BATTERY ---
    if (has(labelContext, 'battery')) {
      if (specs.battery) {
        const cap = values.find(v => /\d+\s*mAh/i.test(v)) ||
                    values.find(v => /\d+\s*mAh/i.test(v.toLowerCase()));
        if (cap) {
          specs.battery.capacity = cap;
        } else {
          const maybeCap = values.find(v => /\d{3,5}/.test(v) && !has(v, 'mp', 'inch'));
          if (maybeCap) specs.battery.capacity = maybeCap + ' mAh';
        }

        // Charging
        const charging = values.find(v => /\d+W|wired|fast|turbo|super|charging/i.test(v) && !has(v, 'battery', 'mah'));
        if (charging) specs.battery.charging = charging;
      }
    }

    // --- BODY / DIMENSIONS / BUILD ---
    if (has(labelContext, 'dimensions', 'body', 'build')) {
      const dim = values.find(v => /\d+\s*[x×]\s*\d+.*mm/i.test(v) || /mm/i.test(v));
      if (dim) specs.body!.dimensions = dim;

      const build = values.find(v => has(v, 'glass', 'plastic', 'aluminum', 'metal', 'front', 'back'));
      if (build) specs.body!.build = build;
    }

    // --- MAIN / REAR CAMERA features and video ---
    if (has(labelContext, 'rear', 'back', 'main camera', 'primary')) {
      if (!specs.mainCamera) specs.mainCamera = {};
      const features = values.find(v => has(v, 'features', 'hdr', 'ois', 'panorama', 'portrait'));
      if (features) specs.mainCamera.features = features;

      const video = values.find(v => has(v, 'video', '4k', '1080p', 'recording'));
      if (video) specs.mainCamera.video = video;
    }

    // --- SELFIE / FRONT CAMERA ---
    if (has(labelContext, 'front', 'selfie', 'secondary')) {
      if (!specs.selfieCamera) specs.selfieCamera = {};
      const features = values.find(v => has(v, 'features', 'hdr', 'portrait'));
      if (features) specs.selfieCamera.features = features;

      const video = values.find(v => has(v, 'video', 'recording'));
      if (video) specs.selfieCamera.video = video;
    }

    // --- SOUND / Loudspeaker / Jack ---
    if (has(labelContext, 'sound', 'loudspeaker', 'speaker', '3.5mm', 'jack')) {
      if (!specs.sound) specs.sound = {};
      if (has(joined, 'loudspeaker', 'speaker')) {
        specs.sound.loudspeaker = values.find(v => has(v, 'yes', 'stereo', 'loud')) || 'Yes';
      }
      if (has(joined, '3.5mm', 'jack')) {
        specs.sound.jack = values.find(v => has(v, 'yes', 'no', 'n/a')) || values[values.length-1];
      }
    }

    // --- COMMS / Connectivity details ---
    if (has(labelContext, 'wlan', 'wifi', 'bluetooth', 'gps', 'positioning', 'nfc', 'radio', 'usb')) {
      if (!specs.comms) specs.comms = {};
      const commKey = has(labelContext, 'wlan', 'wifi') ? 'wlan' :
                      has(labelContext, 'bluetooth') ? 'bluetooth' :
                      has(labelContext, 'gps', 'position') ? 'gps' :
                      has(labelContext, 'nfc') ? 'nfc' :
                      has(labelContext, 'radio') ? 'radio' : 'usb';
      const val = values.filter(v => !has(v, 'wlan','wifi','bluetooth','gps','nfc','radio','usb')).join(' ') || values[values.length-1];
      if (val) (specs.comms as any)[commKey] = val;
    }

    // --- FEATURES / Sensors ---
    if (has(labelContext, 'sensors', 'features')) {
      if (!specs.features) specs.features = {};
      const sensors = values.filter(v => !has(v, 'sensors', 'features')).join(', ');
      if (sensors) specs.features.sensors = sensors;
    }

    // --- MISC / Colors / Models ---
    if (has(labelContext, 'colors', 'colour', 'models', 'model')) {
      if (!specs.misc) specs.misc = {};
      if (has(labelContext, 'colors', 'colour')) {
        specs.misc.colors = values.filter(v => !has(v, 'colors', 'colour')).join(', ');
      }
      if (has(labelContext, 'models')) {
        specs.misc.models = values.filter(v => !has(v, 'models')).join(', ');
      }
    }

    // --- CAMERA ---
    if (has(labelContext, 'camera', 'rear', 'front', 'main camera')) {
      for (const v of values) {
        const lower = v.toLowerCase();
        if (has(lower, 'rear', 'back', 'main')) {
          const mp = extractNumberWithUnit(v) || v;
          specs.camera!.rear = mp.replace(/rear|back|camera/gi, '').trim();
        }
        if (has(lower, 'front', 'selfie')) {
          const mp = extractNumberWithUnit(v) || v;
          specs.camera!.front = mp.replace(/front|selfie|camera/gi, '').trim();
        }
        // Fallback: first MP-looking value for rear
        if (!specs.camera!.rear && /\d+\s*mp/i.test(v)) {
          specs.camera!.rear = extractNumberWithUnit(v) || v;
        }
      }
    }

    // --- CONNECTIVITY (5G / WiFi / Bluetooth / NFC etc) ---
    const connKeys = ['5g', '4g', '3g', 'wifi', 'bluetooth', 'nfc', 'radio', 'usb', 'infrared'];
    for (const key of connKeys) {
      if (has(joined, key)) {
        const hasYes = values.some(v => /^yes$/i.test(v) || has(v, 'yes'));
        const hasNo = values.some(v => /^no$|^n\/a$/i.test(v));
        if (hasYes) (specs.connectivity as any)[key] = true;
        else if (hasNo) (specs.connectivity as any)[key] = false;
        else {
          // Sometimes the value itself is the tech name
          if (!hasYes && !hasNo && values.length > 1) {
            (specs.connectivity as any)[key] = true;
          }
        }
      }
    }

    // --- GENERAL CATCH-ALL into other for full detail ---
    // This ensures almost everything from the messy table ends up somewhere
    const label = values[0];
    const val = values.slice(1).join(' ').trim() || values[0];
    if (label && val && label.length < 60) {
      const lkey = label.toLowerCase().replace(/\s+/g, '_');
      // Avoid overwriting structured fields
      const alreadyMapped = ['release', 'date', 'sim', 'weight', 'os', 'display', 'screen', 'memory', 'ram', 'storage', 'processor', 'gpu', 'battery', 'camera', 'rear', 'front', 'connectivity', '5g', 'wifi', 'bluetooth', 'nfc', 'phone dimensions', 'internal memory'];
      if (!alreadyMapped.some(m => has(label, m))) {
        (specs.other as any)[label] = val;
      }
    }

    // Specific parsers for the user's exact table format (label on one row, value on next)
    const firstLower = values[0].toLowerCase();

    // Phone Dimensions
    if (firstLower.includes('phone dimension') || firstLower.includes('dimensions')) {
      const dimVal = values[1] || val;
      if (dimVal) specs.body!.dimensions = dimVal;
    }

    // SIM Support
    if (firstLower.includes('sim support')) {
      const simVal = values[1] || val;
      if (simVal) specs.sim = simVal;
    }

    // Phone Weight (separate from general weight)
    if (firstLower.includes('phone weight')) {
      const w = values[1] || val;
      if (w) specs.weight = w;
    }

    // Operating System (more explicit)
    if (firstLower.includes('operating system')) {
      const osVal = values[1] || val;
      if (osVal) specs.os = osVal;
    }

    // Screen fields (Display section)
    if (firstLower.includes('screen size')) {
      const s = values[1] || val;
      if (s) specs.display!.size = s;
    }
    if (firstLower.includes('screen resolution')) {
      const r = values[1] || val;
      if (r) specs.display!.resolution = r;
    }
    if (firstLower.includes('screen type')) {
      const t = values[1] || val;
      if (t) specs.display!.type = t;
    }
    if (firstLower.includes('screen protection')) {
      const p = values[1] || val;
      if (p) specs.display!.protection = p;
    }

    // Memory
    if (firstLower.includes('internal memory')) {
      const mem = values[1] || val;
      if (mem) specs.memory!.storage = mem;
    }
    if (firstLower === 'ram' || firstLower.includes('ram')) {
      const ram = values[1] || val;
      if (ram) specs.memory!.ram = ram;
    }
    if (firstLower.includes('card slot')) {
      const cs = values[1] || val;
      if (cs) specs.memory!.cardSlot = cs;
    }

    // Performance
    if (firstLower.includes('processor')) {
      const proc = values[1] || val;
      if (proc) specs.performance!.processor = proc;
    }
    if (firstLower.includes('gpu')) {
      const g = values[1] || val;
      if (g) specs.performance!.gpu = g;
    }

    // Battery
    if (firstLower.includes('type') && has(labelContext, 'battery')) {
      const b = values[1] || val;
      if (b) specs.battery!.capacity = b;
    }

    // Camera - Front / Back
    if (firstLower.includes('front camera')) {
      const f = values[1] || val;
      if (f) specs.camera!.front = f;
    }
    if (firstLower.includes('back camera')) {
      const b = values[1] || val;
      if (b) specs.camera!.rear = b;
    }
    if (firstLower.includes('front video')) {
      const fv = values[1] || val;
      if (fv) specs.selfieCamera!.video = fv;
    }
    if (firstLower.includes('back video')) {
      const bv = values[1] || val;
      if (bv) specs.mainCamera!.video = bv;
    }
    if (firstLower.includes('front flash')) {
      // can go to other or ignore for now
      (specs.other as any)['Front Flash Light'] = values[1] || val;
    }
    if (firstLower.includes('back flash')) {
      (specs.other as any)['Back Flash Light'] = values[1] || val;
    }

    // Connectivity booleans
    const connMap: Record<string, string> = {
      'bluetooth': 'bluetooth',
      '3g': '3g',
      '4g/lte': '4g',
      '5g': '5g',
      'radio': 'radio',
      'wifi': 'wifi',
      'nfc': 'nfc'
    };
    for (const [labelKey, connKey] of Object.entries(connMap)) {
      if (firstLower.includes(labelKey)) {
        const yes = (values[1] || val || '').toLowerCase().includes('yes');
        (specs.connectivity as any)[connKey] = yes || (values[1] || val);
      }
    }

    // Also keep the old flat for debugging if needed
    if (values.length) {
      const key = values[0].slice(0, 40);
      if (!flat[key]) flat[key] = values.slice(1).join(' | ');
    }
  }

  // === Apply normalized pairs (handles 2-row + combined row formats used by add form and raw pastes) ===
  // This ensures Memory, Performance, Display, Battery, Camera, etc. populate even for the exact table style the user pastes.
  for (const [lab, val] of pairs) {
    const fl = lab.toLowerCase();
    let v = (val || '').trim();
    if (!v) continue;

    // Display / Screen
    if (fl.includes('screen size')) specs.display!.size = v;
    if (fl.includes('screen resolution')) specs.display!.resolution = v;
    if (fl.includes('screen type')) specs.display!.type = v;
    if (fl.includes('screen protection')) specs.display!.protection = v;

    // Body / General
    if (fl.includes('phone dimension') || fl.includes('dimensions')) specs.body!.dimensions = v;
    if (fl.includes('sim support') || (fl === 'sim' && !specs.sim)) specs.sim = v;
    if (fl.includes('phone weight')) specs.weight = v;
    if (fl.includes('operating system')) specs.os = v;

    // Memory
    if (fl.includes('internal memory')) specs.memory!.storage = v;
    if (fl === 'ram' || (fl.includes('ram') && fl.length < 12)) specs.memory!.ram = v;
    if (fl.includes('card slot')) specs.memory!.cardSlot = v;

    // Performance
    if (fl.includes('processor') || fl.includes('chipset')) specs.performance!.processor = v;
    if (fl.includes('gpu')) specs.performance!.gpu = v;

    // Battery (handles "Type" label that follows Battery section)
    if ((fl === 'type' || fl.includes('battery type')) && /\d.*(mah|mAh)/i.test(v)) {
      specs.battery!.capacity = v;
    }

    // Cameras (values + video)
    if (fl.includes('front camera')) specs.camera!.front = v;
    if (fl.includes('back camera') || fl.includes('rear camera')) specs.camera!.rear = v;
    if (fl.includes('front video') || fl.includes('front video recording')) specs.selfieCamera!.video = v;
    if (fl.includes('back video') || fl.includes('back video recording')) specs.mainCamera!.video = v;
    if (fl.includes('front flash')) (specs.other as any)['Front Flash Light'] = v;
    if (fl.includes('back flash')) (specs.other as any)['Back Flash Light'] = v;

    // Sound (loudspeaker / 3.5mm jack) - support common labels
    if (fl.includes('loudspeaker') || fl.includes('speaker')) specs.sound!.loudspeaker = v;
    if (fl.includes('3.5mm') || fl.includes('jack') || fl.includes('headphone')) specs.sound!.jack = v;

    // Connectivity booleans / flags (from pairs too) — populate both connectivity (quick view) and comms (for Detailed Comms section)
    const connMap: Record<string, string> = {
      'bluetooth': 'bluetooth',
      '3g': '3g',
      '4g/lte': '4g',
      '4g': '4g',
      '5g': '5g',
      'radio': 'radio',
      'wifi': 'wifi',
      'nfc': 'nfc'
    };
    for (const [lk, ck] of Object.entries(connMap)) {
      if (fl.includes(lk)) {
        (specs.connectivity as any)[ck] = v;
        // Also feed the structured comms so the "Comms & Features" detailed section shows individual rows (WLAN/WiFi, Bluetooth, NFC, Radio...)
        if (ck === 'wifi') (specs.comms as any).wlan = v;
        else (specs.comms as any)[ck] = v;
      }
    }
  }

  // === Post-processing / cleanup ===

  // Normalize units for readability (add spacing, handle case, avoid doubles)
  if (specs.display) {
    const d = specs.display;
    if (d.size) {
      const sl = d.size.toLowerCase();
      if (!sl.includes('inch')) {
        d.size = d.size + ' inches';
      } else {
        d.size = d.size.replace(/\s*inch(es)?/i, ' inches').trim();
      }
    }
  }

  if (specs.memory) {
    const m = specs.memory;
    if (m.ram) m.ram = m.ram.replace(/(\d)\s*(GB|MB)/i, '$1 $2');
    if (m.storage) m.storage = m.storage.replace(/(\d)\s*(GB|MB)/i, '$1 $2');
  }

  if (specs.battery?.capacity) {
    let c = specs.battery.capacity;
    c = c.replace(/(\d)\s*(mAh|mah)/i, '$1 mAh');
    if (!/mAh/i.test(c) && /\d/.test(c)) c = c + ' mAh';
    specs.battery.capacity = c;
  }

  if (specs.weight) {
    specs.weight = specs.weight.replace(/(\d)\s*(g|G)(?!\w)/, '$1 g');
  }

  // Clean memory units (skip N/A, No, already has unit, or non-numeric) - append only when needed
  if (specs.memory) {
    const m = specs.memory;
    const shouldSkipUnit = (s: string) => !s || /GB|MB|N\/A|No|none/i.test(s) || !/\d/.test(s);
    if (m.ram && !shouldSkipUnit(m.ram)) m.ram = m.ram + ' GB';
    if (m.storage && !shouldSkipUnit(m.storage)) m.storage = m.storage + ' GB';
  }

  // Make sure camera has something reasonable (skip N/A etc)
  if (specs.camera) {
    const camSkip = (s: string) => !s || /MP|N\/A|No|none/i.test(s) || !/\d/.test(s);
    if (specs.camera.rear && !camSkip(specs.camera.rear)) {
      specs.camera.rear = specs.camera.rear + ' MP';
    }
    if (specs.camera.front && !camSkip(specs.camera.front)) {
      specs.camera.front = specs.camera.front + ' MP';
    }
  }

  // Remove empty top-level objects
  (Object.keys(specs) as (keyof CleanSpecs)[]).forEach(k => {
    const val = specs[k];
    if (val && typeof val === 'object' && Object.keys(val).length === 0) {
      delete specs[k];
    }
  });

  // If we still have almost nothing, dump whatever we can into other
  if (Object.keys(specs).filter(k => k !== 'other').length <= 1) {
    specs.other = { ...flat };
  }

  return specs;
}

// ===================================================================
// EXAMPLE USAGE + MONGODB SAVE
// ===================================================================

/*
import connectDB from './mongodb';
import Phone from '../models/Phone';
import { cleanMobileSpecs } from './specCleaner';

async function importPhone(rawTableData: any[], phoneInfo: { name: string; brand: string; slug: string; price: number }) {
  await connectDB();

  const cleanSpecs = cleanMobileSpecs(rawTableData);

  const phoneDoc = new Phone({
    ...phoneInfo,
    specs: cleanSpecs,
    // variants, colors, isFeatured etc. can be added here
  });

  await phoneDoc.save();
  console.log('Saved phone with clean specs:', phoneDoc.slug);
  return phoneDoc;
}

// Example messy data (exactly the kind you described)
const exampleMessy = [
  { General: "Release", Features: "Date", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "02", Features: "Jun", FIELD3: "2026", FIELD4: "", FIELD5: "" },
  { General: "SIM", Features: "Support", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "Dual", Features: "Sim", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "Phone", Features: "Weight", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "219g", Features: "", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "Operating", Features: "System", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "Xiaomi", Features: "HyperOS", FIELD3: "3", FIELD4: "", FIELD5: "" },
  { General: "Screen", Features: "Size", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: '6.83"', Features: "144Hz", FIELD3: "eye-care", FIELD4: "AMOLED", FIELD5: "display" },
  { General: "Screen", Features: "Resolution", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "2772", Features: "x", FIELD3: "1280", FIELD4: "", FIELD5: "" },
  { General: "Screen", Features: "Type", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "AMOLED", Features: "", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "Screen", Features: "Protection", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "Corning", Features: "Gorilla", FIELD3: "Glass", FIELD4: "7i", FIELD5: "" },
  { General: "Internal", Features: "Memory", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "512GB", Features: "", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "RAM", Features: "", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "12GB", Features: "", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "Card", Features: "Slot", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "N/A", Features: "", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "Processor", Features: "", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "MediaTek", Features: "Dimensity", FIELD3: "9500", FIELD4: "", FIELD5: "" },
  { General: "GPU", Features: "", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "Mali", Features: "G1-Ultra", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "Battery", Features: "", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "Type", Features: "", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "7000mAh", Features: "", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "Rear", Features: "Camera", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "50MP", Features: "", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "Front", Features: "Camera", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "32", Features: "MP", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "5G", Features: "", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "Yes", Features: "", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "WiFi", Features: "", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "Yes", Features: "", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "Bluetooth", Features: "", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "Yes", Features: "", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "NFC", Features: "", FIELD3: "", FIELD4: "", FIELD5: "" },
  { General: "Yes", Features: "", FIELD3: "", FIELD4: "", FIELD5: "" },
];

async function exampleUsage() {
  const clean = cleanMobileSpecs(exampleMessy);
  console.log('Converted specs:', JSON.stringify(clean, null, 2));

  // Example save (you would import connectDB + Phone in a real script)
  // await connectDB();
  // const phone = new Phone({
  //   name: "Xiaomi Redmi Note 15 Pro",
  //   brand: "Xiaomi",
  //   slug: "xiaomi-redmi-note-15-pro",
  //   price: 89999,
  //   specs: clean,
  // });
  // await phone.save();
}
*/

// Convenience re-export of the main function
export { cleanMobileSpecs as default };