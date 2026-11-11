import {normalizeText, parseVocabulary, parseRoots, parseIdioms, buildRootGroups, buildIdiomGroups, matches} from './model.js';
import {renderEntry, renderRoot, renderIdiom, renderToc, showError} from './render.js';

const $ = id => document.getElementById(id);
const state = {entries:[], roots:[], idioms:[], rootMap:{}, warnings:[], mode:'keyword', ready:false};
const modeButton=$('mode'), menu=$('mode-menu'), results=$('results'), toc=$('toc'), search=$('search');
const modeLabels={keyword:'キーワード別',root:'語源別',idiom:'イディオム'};
if(window.matchMedia('(max-width:760px)').matches) $('toc-details').open=false;

async function loadJSON(path){
  const response=await fetch(path,{cache:'no-cache'});
  if(!response.ok) throw new Error(path+' の取得失敗 (HTTP '+response.status+')');
  try{return await response.json();}catch(e){throw new Error(path+' のJSON形式が不正です');}
}
function currentRoute(){
  const params=new URLSearchParams(location.hash.replace(/^#/,''));
  if(params.has('word'))return {mode:'keyword',id:params.get('word'),focus:params.get('focus')};
  if(params.has('root'))return {mode:'root',id:params.get('root')};
  if(params.has('idiom'))return {mode:'idiom',id:params.get('idiom')};
  if(location.hash==='#roots')return {mode:'root'};
  if(location.hash==='#idioms')return {mode:'idiom'};
  return {mode:'keyword'};
}
function updateModeMenu(){
  menu.querySelectorAll('button[data-mode]').forEach(b=>b.setAttribute('aria-current',String(b.dataset.mode===state.mode)));
}
function closeMenu(){menu.hidden=true;modeButton.setAttribute('aria-expanded','false');}
function updateMode(mode){
  state.mode=modeLabels[mode]?mode:'keyword';
  $('toc-heading').textContent=modeLabels[state.mode]+'の目次';
  search.placeholder=state.mode==='keyword'?'例：bounce、回復、ラテン語':state.mode==='root'?'語根・語源・関連単語を検索':'動詞・イディオム・意味を検索';
  updateModeMenu();closeMenu();
}
function go(hash){
  if(location.hash!==hash)history.pushState(null,'',hash);
  applyRoute();
}
function applyRoute(){
  if(!state.ready)return;
  const route=currentRoute();
  updateMode(route.mode);
  if(route.id)search.value='';
  render();
  if(route.id){
    const key=route.mode==='keyword'?'word-':route.mode==='root'?'root-':'idiom-';
    let target=document.getElementById(key+encodeURIComponent(route.id));
    if(target&&route.focus){
      const sub=document.getElementById('related-'+encodeURIComponent(route.id)+'-'+encodeURIComponent(route.focus));
      if(sub){
        for(let p=sub.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;
        target=sub;
      }
    }
    requestAnimationFrame(()=>target?.scrollIntoView({block:'start'}));
  } else if(location.hash==='#keywords'||location.hash==='#roots'||location.hash==='#idioms'){
    window.scrollTo({top:0,behavior:'instant'});
  }
}
function render(){
  const q=normalizeText(search.value);
  results.replaceChildren();
  let items=[],shown=0;
  if(state.mode==='keyword'){
    items=state.entries.filter(e=>matches(e,q));
    renderToc(toc,'keyword',items,state.entries);
    for(const entry of items){
      try{results.append(renderEntry(entry,state.rootMap[entry.id],q));shown++;}
      catch(e){
        state.warnings.push('表示エラー: '+entry.id+' ('+e.message+')');
        const err=document.createElement('p');
        err.textContent=entry.word+' の表示で問題が発生しました。他の単語は閲覧できます。';
        results.append(err);
        console.error('Entry render error',entry.id,e);
      }
    }
    $('status').textContent=shown+' / '+state.entries.length+' 見出し語'+(state.warnings.length?' · 注意事項 '+state.warnings.length+'件':'');
  } else if(state.mode==='root'){
    const visible=[];
    for(const group of state.roots){
      const same=normalizeText(group.root+' '+group.origin).includes(q);
      const members=same?group.members:group.members.filter(w=>normalizeText(w.word+' '+w.meaning).includes(q));
      if(!members.length)continue;
      visible.push(group);results.append(renderRoot(group,members));
    }
    renderToc(toc,'root',visible,[]);
    $('status').textContent=visible.length+' / '+state.roots.length+' 語源グループ'+(state.warnings.length?' · 注意事項 '+state.warnings.length+'件':'');
  } else {
    const visible=[];
    let total=0;
    for(const group of state.idioms){
      const same=normalizeText(group.verb+' '+group.core).includes(q);
      const items=same?group.items:group.items.filter(w=>normalizeText(w.phrase+' '+w.meaning+' '+w.core).includes(q));
      if(!items.length)continue;
      visible.push(group);total+=items.length;results.append(renderIdiom(group,items));
    }
    renderToc(toc,'idiom',visible,[]);
    $('status').textContent=total+' イディオム · '+visible.length+' 動詞グループ';
  }
  if(!results.childElementCount){
    const p=document.createElement('p');p.className='notice';
    p.textContent='該当する語がありません。検索条件を変えてください。';results.append(p);
  }
}
async function startup(){
  try{
    const response=await Promise.allSettled([
      loadJSON('./data/entries.json'),
      loadJSON('./roots-map.json'),
      loadJSON('./idioms.json')
    ]);
    if(response[0].status!=='fulfilled')throw response[0].reason;
    const parsed=parseVocabulary(response[0].value);
    state.entries=parsed.entries;state.warnings.push(...parsed.warnings);
    if(!state.entries.length)throw new Error('有効な単語データがありません');
    if(response[1].status==='fulfilled')state.rootMap=parseRoots(response[1].value);
    else state.warnings.push('語源マップを取得できません。暫定的に「その他」として表示します。');
    const idiomSeed=response[2].status==='fulfilled'?parseIdioms(response[2].value):[];
    if(response[2].status!=='fulfilled')state.warnings.push('旧イディオムデータの取得に失敗しました。');
    state.roots=buildRootGroups(state.entries,state.rootMap);
    state.idioms=buildIdiomGroups(state.entries,idiomSeed);
    state.ready=true;
    if(state.warnings.length)console.warn('Vocabulary v2 data warnings:',state.warnings);
    applyRoute();
  }catch(error){
    console.error('Vocabulary v2 startup failure:',error);
    $('status').textContent='データを読み込めませんでした';
    showError(results,'単語データを取得できません。ネットワークとJSON形式を確認してください。 '+error.message);
  }
}
search.addEventListener('input',()=>{if(state.ready)render();});
modeButton.addEventListener('click',()=>{
  menu.hidden=!menu.hidden;modeButton.setAttribute('aria-expanded',String(!menu.hidden));
});
menu.addEventListener('click',event=>{
  const button=event.target.closest('button[data-mode]');
  if(!button)return;
  search.value='';
  const hash=button.dataset.mode==='root'?'#roots':button.dataset.mode==='idiom'?'#idioms':'#keywords';
  go(hash);
});
document.addEventListener('click',event=>{
  if(!event.target.closest('.float-actions'))closeMenu();
  const button=event.target.closest('button[data-speak]');
  if(button){
    const phrase=button.dataset.speak;
    if(!('speechSynthesis' in window)){$('status').textContent='このブラウザでは音声読み上げを利用できません。';return;}
    try{
      window.speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(phrase);u.lang='en-US';u.rate=.86;
      const voices=window.speechSynthesis.getVoices();
      u.voice=voices.find(x=>x.lang.toLowerCase()==='en-us')||voices.find(x=>x.lang.toLowerCase().startsWith('en'))||null;
      window.speechSynthesis.speak(u);
    }catch(e){console.warn('Pronunciation failed',e);$('status').textContent='発音を再生できませんでした。';}
    return;
  }
  const anchor=event.target.closest('a[href^="#"]');
  if(!anchor)return;
  const hash=anchor.getAttribute('href');
  if(hash==='#toc-heading'){
    event.preventDefault();$('toc-heading').scrollIntoView({behavior:'smooth',block:'start'});
  }else if(/^#(?:word|root|idiom)=/.test(hash)||['#roots','#keywords','#idioms'].includes(hash)){
    event.preventDefault();go(hash);
  }
});
window.addEventListener('popstate',applyRoute);
window.addEventListener('hashchange',applyRoute);
startup();
