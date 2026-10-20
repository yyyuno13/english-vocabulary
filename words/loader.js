/* Vocabulary data loader: preserves existing HTML/CSS and pronunciation handler. */
(async function () {
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const stars = n => '★'.repeat(Math.max(1,Math.min(5,Number(n)||1))) + '☆'.repeat(5-Math.max(1,Math.min(5,Number(n)||1)));
  const back = id => '<div class="backlinks"><a href="#toc">↑ 目次へ</a><a href="#'+id+'">このテーマへ</a></div>';
  function relatedCard(parent, item) {
    const w=escapeHTML(item.word), id=escapeHTML(parent+'-'+item.word);
    return '<article class="wordcard searchable" data-search="'+escapeHTML([item.word,item.meaning,item.pos,item.note].join(' '))+'" id="'+id+'">'+
      '<h4>'+w+' <span class="small">'+escapeHTML(item.ipa)+'｜'+escapeHTML(item.pos)+'</span></h4>'+
      '<button aria-label="'+w+' の発音を再生" class="pronounce-btn" data-say="'+w+'" lang="en-US" type="button">🔊 発音</button>'+
      '<div>'+escapeHTML(item.meaning)+'</div><div class="meta">'+
      '<span class="pill difficulty">難易度 '+stars(item.difficulty)+'</span><span class="pill">日常 '+stars(item.daily)+'</span><span class="pill">ビジネス '+stars(item.business)+'</span></div>'+
      '<p><b>例：</b>'+escapeHTML(item.example)+'<br><b>訳：</b>'+escapeHTML(item.translation)+'</p>'+
      '<p class="small"><b>語源・使い分け：</b>'+escapeHTML(item.note)+'</p>'+back(parent)+'</article>';
  }
  function family(entry, number) {
    const id=escapeHTML(entry.id), w=escapeHTML(entry.word);
    const examples=(entry.examples||[]).map(pair=>'<div class="example"><b>例：</b>'+escapeHTML(pair[0])+'<br><b>訳：</b>'+escapeHTML(pair[1])+'</div>').join('');
    return '<section class="family searchable" id="'+id+'" data-search="'+escapeHTML([entry.word,entry.meaning,...(entry.related||[]).map(x=>x.word),...(entry.synonyms||[]).map(x=>x.word)].join(' '))+'">'+
      '<h2>'+number+'. '+w+'</h2><button aria-label="'+w+' の発音を再生" class="pronounce-btn" data-say="'+w+'" lang="en-US" type="button">🔊 発音</button>'+
      '<div class="backlinks"><a href="#toc">↑ 目次へ</a><a href="#word-index">単語インデックスへ</a></div>'+
      '<div class="meta"><span class="pill">'+escapeHTML(entry.pos)+'</span><span class="pill">発音：'+escapeHTML(entry.ipa)+'</span>'+
      '<span class="pill difficulty">難易度 '+stars(entry.difficulty)+'</span><span class="pill">日常 '+stars(entry.daily)+'</span><span class="pill">ビジネス '+stars(entry.business)+'</span></div>'+
      '<div class="field"><b>意味</b>'+escapeHTML(entry.meaning)+'</div>'+
      '<div class="field"><b>① 語源の分解と解説</b>'+escapeHTML(entry.etymology)+'</div>'+
      '<div class="field"><b>② コアイメージ</b>'+escapeHTML(entry.core)+'</div>'+
      '<div class="field"><b>③ 基本情報と例文</b>'+escapeHTML(entry.usage)+'</div>'+examples+
      '<div class="related"><h3>④ 同語源の単語</h3>'+(entry.related||[]).map(x=>relatedCard(entry.id,x)).join('')+
      '<h3>⑤ 同義語・類義語</h3>'+(entry.synonyms||[]).map(x=>relatedCard(entry.id,x)).join('')+
      '<div class="field"><b>ニュアンス比較</b>'+escapeHTML(entry.comparison)+'</div></div></section>';
  }
  try {
    const response=await fetch('/words/entries.json',{cache:'no-cache'});
    if(!response.ok) throw new Error('HTTP '+response.status);
    const data=await response.json();
    const main=document.querySelector('main'), toc=document.getElementById('toc'), index=document.getElementById('word-index');
    if(!main||!toc||!index) throw new Error('Vocabulary HTML structure not found');
    let next=[...main.querySelectorAll('section.family')].length+1;
    const added=[];
    for(const entry of data.entries||[]) {
      if(!/^[a-z0-9-]+$/i.test(entry.id)||document.getElementById(entry.id))continue;
      main.insertAdjacentHTML('beforeend',family(entry,next));
      toc.insertAdjacentHTML('beforeend','<a href="#'+entry.id+'">'+next+'. '+escapeHTML(entry.word)+'</a>');
      index.insertAdjacentHTML('beforeend','<a href="#'+entry.id+'">'+escapeHTML(entry.word)+'</a>');
      for(const item of [...(entry.related||[]),...(entry.synonyms||[])]) {
        index.insertAdjacentHTML('beforeend','<a href="#'+entry.id+'-'+escapeHTML(item.word)+'">'+escapeHTML(item.word)+'</a>');
      }
      added.push(document.getElementById(entry.id));next++;
    }
    // Search all sections together, including dynamically added entries.
    // Capture-phase listener runs before the original HTML's search handler.
    const search=document.getElementById('search');
    if(search) {
      const updateSearch=()=>{
        const q=search.value.trim().toLowerCase();
        document.querySelectorAll('section.family.searchable').forEach(section=>{
          const cards=[...section.querySelectorAll('.wordcard.searchable')];
          const sectionMatch=(section.dataset.search||'').toLowerCase().includes(q);
          const cardMatches=cards.map(card=>(card.dataset.search||card.textContent||'').toLowerCase().includes(q));
          section.style.display=(!q||sectionMatch||cardMatches.some(Boolean))?'':'none';
          cards.forEach((card,i)=>{card.style.display=(!q||sectionMatch||cardMatches[i])?'':'none';});
        });
      };
      search.addEventListener('input',event=>{event.stopImmediatePropagation();updateSearch();},true);
      updateSearch();
    }
    // If a URL points to a related word, make sure the target is visible.
    if(location.hash) {
      const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if(target&&added.some(section=>section.contains(target)))target.scrollIntoView();
    }
  } catch(error) { console.error('Vocabulary data could not be loaded:',error); }
})();
