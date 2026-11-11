// Data normalization and grouping. No DOM logic in this module.
export const normalizeText = value => String(value ?? '').normalize('NFKC').toLocaleLowerCase('en').trim();
export const stars = value => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 1 && n <= 5 ? '★'.repeat(n) + '☆'.repeat(5 - n) : '未評価';
};
export function parseVocabulary(raw) {
  if (!raw || !Array.isArray(raw.entries)) throw new Error('entries.json に entries 配列がありません');
  const entries = [], warnings = [], seen = new Set();
  for (const [i, source] of raw.entries.entries()) {
    try {
      if (!source || typeof source !== 'object' || typeof source.id !== 'string' ||
          typeof source.word !== 'string' || !source.id.trim() || !source.word.trim()) {
        throw new Error('id または word が不正です');
      }
      const key = normalizeText(source.id);
      if (seen.has(key)) throw new Error('ID が重複しています: ' + source.id);
      seen.add(key);
      entries.push({
        ...source,
        number: i + 1,
        id: source.id,
        word: source.word.trim(),
        pos: String(source.pos ?? ''),
        ipa: String(source.ipa ?? ''),
        meaning: String(source.meaning ?? ''),
        etymology: String(source.etymology ?? ''),
        core: String(source.core ?? ''),
        usage: String(source.usage ?? ''),
        examples: Array.isArray(source.examples) ? source.examples.filter(x => Array.isArray(x) && x.length >= 2) : [],
        related: Array.isArray(source.related) ? source.related.filter(x => x && typeof x.word === 'string' && x.word.trim()) : [],
        synonyms: Array.isArray(source.synonyms) ? source.synonyms.filter(x => x && typeof x.word === 'string' && x.word.trim()) : [],
        reference: Array.isArray(source.reference) ? source.reference.filter(x => x && typeof x.word === 'string' && x.word.trim()) : [],
      });
    } catch (error) { warnings.push('登録 ' + (i + 1) + ': ' + error.message); }
  }
  return { entries, warnings };
}
export function parseRoots(raw) {
  const map = raw && typeof raw.roots === 'object' && !Array.isArray(raw.roots) ? raw.roots : {};
  return map;
}
export function parseIdioms(raw) {
  if (!raw || !Array.isArray(raw.items)) return [];
  return raw.items.filter(x => Array.isArray(x) && x.length >= 7).map(([verb, verbCore, phrase, meaning, core, example, translation]) => ({
    verb: String(verb), verbCore: String(verbCore), phrase: String(phrase), meaning: String(meaning),
    core: String(core), example: String(example), translation: String(translation)
  }));
}
export function buildRootGroups(entries, rootMap) {
  const groups = new Map();
  const put = (root, origin, item) => {
    if (!groups.has(root)) groups.set(root, { root, origin, members: new Map() });
    const group = groups.get(root), key = normalizeText(item.word);
    if (!key) return;
    const current = group.members.get(key);
    // A direct headword link takes precedence over a link to a related word.
    if (!current || (current.focus && !item.focus)) group.members.set(key, item);
  };
  for (const entry of entries) {
    const pair = rootMap[entry.id];
    const root = Array.isArray(pair) && typeof pair[0] === 'string' && pair[0] ? pair[0] : 'その他';
    const origin = Array.isArray(pair) && typeof pair[1] === 'string' ? pair[1] : '語源の分類を要確認';
    put(root, origin, { word: entry.word, meaning: entry.meaning, entryId: entry.id, focus: '' });
    for (const related of entry.related) {
      // These are the source's etymological/derivative words, not the synonyms list.
      if (related.relationship === 'synonym' || related.relationship === 'reference') continue;
      put(root, origin, { word: related.word, meaning: String(related.meaning ?? ''), entryId: entry.id, focus: related.word });
    }
  }
  return [...groups.values()].map(group => ({
    root: group.root, origin: group.origin,
    members: [...group.members.values()].sort((a,b) => a.word.localeCompare(b.word, 'en'))
  })).sort((a,b) => a.root === 'その他' ? 1 : b.root === 'その他' ? -1 : a.root.localeCompare(b.root, 'en', {sensitivity:'base'}));
}
export function buildIdiomGroups(entries, seed) {
  const groups = new Map();
  const put = item => {
    const verb = normalizeText(item.verb);
    if (!groups.has(verb)) groups.set(verb, {verb, core:item.verbCore, items:new Map()});
    const map = groups.get(verb).items;
    const phrase = normalizeText(item.phrase);
    if (!map.has(phrase) || item.entryId) map.set(phrase,item);
  };
  for (const x of seed) put(x);
  for (const entry of entries) {
    if (!entry.word.includes(' ') && !/句動詞|イディオム|慣用/.test(entry.pos)) continue;
    const verb = entry.word.split(/\s+/)[0];
    put({verb, verbCore: '', phrase: entry.word, meaning: entry.meaning, core: entry.core,
      example: entry.examples[0]?.[0] ?? '', translation: entry.examples[0]?.[1] ?? '', entryId:entry.id});
  }
  return [...groups.values()].sort((a,b) => a.verb.localeCompare(b.verb,'en')).map(g => ({
    verb:g.verb, core:g.core, items:[...g.items.values()].sort((a,b) => a.phrase.localeCompare(b.phrase,'en'))
  }));
}
export function matches(entry, query) {
  if (!query) return true;
  const related = [...entry.related, ...entry.synonyms, ...entry.reference];
  const hay = [entry.word,entry.meaning,entry.pos,entry.ipa,entry.etymology,entry.core,entry.usage,
    ...entry.examples.flat(), ...related.flatMap(x => [x.word,x.meaning,x.note])].join(' ');
  return normalizeText(hay).includes(query);
}
