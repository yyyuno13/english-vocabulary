import {stars} from './model.js';

// All user-facing text is inserted as text nodes. Data never becomes executable HTML.
const el = (tag, className, value) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (value !== undefined && value !== null) node.textContent = String(value);
  return node;
};
const add = (parent, ...children) => {for (const child of children) if (child) parent.append(child);return parent;};
const link = (label, hash) => {const a=el('a','',label);a.href=hash;return a;};
const heading = (title) => el('h3','',title);
const pill = value => el('span','pill',value);
const pronounce = word => {
  const btn = el('button','pronounce','🔊 発音');
  btn.type='button';btn.dataset.speak=word;btn.setAttribute('aria-label',word+' の発音');
  return btn;
};
const examples = entries => {
  const wrapper=el('div','examples');
  entries.forEach(pair=>{
    const block=el('div','example');
    add(block,el('p','',pair[0]),el('p','translation',pair[1]));wrapper.append(block);
  });return wrapper;
};
const ratings = object => {
  const m=el('div','meta');
  add(m,
    pill('品詞：'+(object.pos||'未登録')),
    pill('発音：'+(object.ipa||'未登録')),
    pill('難易度 '+stars(object.difficulty)),
    pill('日常 '+stars(object.daily)),
    pill('ビジネス '+stars(object.business)));
  return m;
};
const detail = (label, count, initiallyOpen=false) => {
  const d=el('details','section-fold');
  d.open=initiallyOpen;
  d.append(el('summary','',label+'（'+count+'）'));return d;
};
const relation = (item, entryId, key) => {
  const card=el('article','related-card');
  card.id='related-'+encodeURIComponent(entryId)+'-'+encodeURIComponent(item.word);
  const title=el('h4','',item.word);
  add(card,title,pronounce(item.word));
  add(card,ratings(item));
  if(item.meaning)card.append(el('p','',item.meaning));
  if(item.note)card.append(el('p','minor',item.note));
  if(item.example)card.append(examples([[item.example,item.translation||'']]));
  return card;
};
const listRelations = (items,entryId,key) => {
  const box=el('div','related-list');
  items.forEach(item=>box.append(relation(item,entryId,key)));
  return box;
};
export function renderEntry(entry, rootPair) {
  const article=el('article','entry');
  article.id='word-'+encodeURIComponent(entry.id);
  const title=el('h2');
  add(title,el('span','number',String(entry.number).padStart(2,'0')),document.createTextNode(entry.word));
  add(article,title,pronounce(entry.word),ratings(entry));
  add(article,heading('意味'),el('p','meaning',entry.meaning||'未登録'));
  add(article,heading('① 語源と成り立ち'));
  article.append(el('p','',entry.etymology||'語源解説は未登録です。'));
  const root=Array.isArray(rootPair)?rootPair[0]:null;
  if(root&&root!=='その他'){
    const p=el('p','minor');
    p.append(link('対応する語源グループへ：'+root,'#root='+encodeURIComponent(root)));
    article.append(p);
  }
  add(article,heading('② コアイメージ'),el('p','core',entry.core||'未登録'));
  if(entry.usage){
    add(article,heading('③ 用法・コロケーション'),el('p','',entry.usage));
  }
  if(entry.examples.length) add(article,heading('英日対訳の例文'),examples(entry.examples));
  if(entry.related.length){
    const d=detail('④ 同語源語・派生語・関連表現',entry.related.length);
    d.append(listRelations(entry.related,entry.id,'related'));article.append(d);
  }
  if(entry.synonyms.length){
    const d=detail('⑤ 類義語・ニュアンス比較',entry.synonyms.length);
    d.append(listRelations(entry.synonyms,entry.id,'synonym'));
    if(entry.comparison){
      const cmp=el('div','comparison');
      add(cmp,el('h4','', '使い分けのまとめ'),el('p','',entry.comparison));d.append(cmp);
    }
    if(Array.isArray(entry.comparisonRows)&&entry.comparisonRows.length){
      const tbl=el('table','nuance-table');
      const head=el('tr');add(head,el('th','','単語'),el('th','','ニュアンス'));tbl.append(head);
      entry.comparisonRows.forEach(row=>{
        if(!row) return;
        const tr=el('tr');
        const term=Array.isArray(row)?row[0]:row.word;
        const detail=Array.isArray(row)?row[1]:row.nuance||row.detail;
        add(tr,el('th','',term??''),el('td','',detail??''));tbl.append(tr);
      });
      d.append(tbl);
    }
    article.append(d);
  }
  if(entry.reference.length){
    const d=detail('参考語',entry.reference.length);
    d.append(listRelations(entry.reference,entry.id,'reference'));article.append(d);
  }
  const p=el('p','back-link');p.append(link('↑ 目次','#toc-heading'));article.append(p);
  return article;
}
export function renderRoot(group, visibleMembers) {
  const article=el('article','root-card');
  article.id='root-'+encodeURIComponent(group.root);
  add(article,el('h2','',group.root),el('p','minor',group.origin||'由来は確認中です'));
  for (const item of visibleMembers){
    const row=el('div','root-item');
    const href='#word='+encodeURIComponent(item.entryId)+(item.focus?'&focus='+encodeURIComponent(item.focus):'');
    add(row,link(item.word,href),el('div','minor',item.meaning));
    article.append(row);
  }
  return article;
}
export function renderIdiom(group,items) {
  const article=el('article','root-card');
  article.id='idiom-'+encodeURIComponent(group.verb);
  add(article,el('h2','',group.verb));
  if(group.core) article.append(el('p','minor','動詞の基本イメージ：'+group.core));
  for(const item of items){
    const row=el('section','idiom-item');
    const h=el('h3','',item.phrase);
    add(row,h,pronounce(item.phrase),el('p','',item.meaning),el('p','core',item.core));
    if(item.example)add(row,examples([[item.example,item.translation||'']]));
    if(item.entryId){
      const p=el('p','minor');
      p.append(link('詳細解説を見る','#word='+encodeURIComponent(item.entryId)));row.append(p);
    }
    article.append(row);
  }
  return article;
}
export function renderToc(container,kind,items,entries) {
  container.replaceChildren();
  for(const item of items){
    let label,hash;
    if(kind==='keyword'){
      label=item.number+'. '+item.word;hash='#word='+encodeURIComponent(item.id);
    }else if(kind==='root'){
      label=item.root;hash='#root='+encodeURIComponent(item.root);
    }else{
      label=item.verb;hash='#idiom='+encodeURIComponent(item.verb);
    }
    container.append(link(label,hash));
  }
  if(kind==='keyword'){
    const byWord=new Map();
    for(const e of entries){
      for(const related of [...e.related,...e.synonyms,...e.reference]){
        const key=related.word.toLocaleLowerCase('en');
        if(!byWord.has(key)){
          byWord.set(key,{word:related.word,id:e.id,focus:related.word});
        }
      }
    }
    const wordList=[...byWord.values()].sort((a,b)=>a.word.localeCompare(b.word,'en'));
    const details=el('details','word-index');
    details.append(el('summary','','関連語インデックス（'+wordList.length+'語）'));
    const box=el('div','index-links');
    for(const item of wordList){
      box.append(link(item.word,'#word='+encodeURIComponent(item.id)+'&focus='+encodeURIComponent(item.focus)));
    }
    details.append(box);container.append(details);
  }
}
export function showError(container, message){
  const notice=el('div','notice');
  add(notice,el('h2','','読み込みエラー'),el('p','',message));
  container.replaceChildren(notice);
}
