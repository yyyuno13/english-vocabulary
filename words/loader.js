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
    // Chapter numbers come from existing numbered headings, not the count of
    // sections (which includes the unnumbered quick-reference section).
    const existingNumbers=[...main.querySelectorAll('section.family h2')].map(h=>{
      const match=h.textContent.trim().match(/^(\d+)\./);
      return match?Number(match[1]):0;
    });
    let next=Math.max(0,...existingNumbers)+1;
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
    // Collapsible vocabulary index; retain the existing links and styles.
    if(index && !index.closest('details')) {
      const details=document.createElement('details');
      details.className='vocab-index-fold';
      details.open=false;
      const summary=document.createElement('summary');
      summary.textContent='単語インデックスを開く';
      summary.setAttribute('aria-label','単語インデックスを開閉');
      const heading=index.previousElementSibling;
      if(heading && heading.tagName==='H2') heading.hidden=true;
      index.parentNode.insertBefore(details,index);
      details.appendChild(summary);
      details.appendChild(index);
      details.addEventListener('toggle',()=>{
        summary.textContent=details.open?'単語インデックスを閉じる':'単語インデックスを開く';
      });
      const foldStyle=document.createElement('style');
      foldStyle.textContent='.vocab-index-fold{margin-top:18px;border:1px solid var(--line,#ddd);border-radius:10px;padding:8px 10px}.vocab-index-fold>summary{cursor:pointer;font-weight:700;padding:5px 2px;color:var(--accent,inherit);list-style-position:inside}.vocab-index-fold>#word-index{margin-top:10px}';
      document.head.appendChild(foldStyle);
      // Reveal the index when navigating directly to a word inside it.
      if(location.hash==='#word-index')details.open=true;
    }
    // Repair the original chapter 13 without changing the source HTML.
    const condescending=document.getElementById('condescendingly');
    if(condescending) {
      const heading=condescending.querySelector('h2');
      if(heading)heading.textContent='13. condescendingly';
      if(!toc.querySelector('a[href="#condescendingly"]')) {
        const link=document.createElement('a');
        link.href='#condescendingly';link.textContent='13. condescendingly';
        const subsidy=toc.querySelector('a[href="#subsidy"]');
        if(subsidy)toc.insertBefore(link,subsidy);else toc.appendChild(link);
      }
    }
    // Move the persistent TOC shortcut away from Netlify's bottom-right UI.
    const uiStyle=document.createElement('style');
    uiStyle.textContent='.toc-fab{top:calc(12px + env(safe-area-inset-top, 0px)) !important;bottom:auto !important;right:12px !important;z-index:100 !important} .toolbar{position:relative} .vocab-suggestions{position:absolute;top:100%;left:0;right:0;z-index:110;max-height:45vh;overflow-y:auto;background:var(--paper,#fff);border:1px solid var(--line,#ccc);border-radius:12px;box-shadow:0 8px 24px #0002;padding:5px} .vocab-suggestions[hidden]{display:none!important} .vocab-suggestions button{display:block;width:100%;text-align:left;padding:10px 12px;border:0;border-radius:7px;background:transparent;color:inherit;font:inherit;cursor:pointer} .vocab-suggestions button:hover,.vocab-suggestions button:focus{background:var(--accent-soft,#e8eef9)}';
    document.head.appendChild(uiStyle);
    // Clickable autocomplete for both the original index and loaded words.
    const autocompleteInput=document.getElementById('search');
    if(autocompleteInput) {
      autocompleteInput.setAttribute('autocomplete','off');
      const panel=document.createElement('div');
      panel.className='vocab-suggestions';panel.hidden=true;
      panel.setAttribute('role','listbox');
      autocompleteInput.parentElement.appendChild(panel);
      const normalize=text=>String(text||'').trim().toLocaleLowerCase();
      const getOptions=()=>{
        const seen=new Set();
        return [...index.querySelectorAll('a[href^="#"]')].map(a=>{
          const label=a.textContent.trim(),href=a.getAttribute('href');
          return {label,href};
        }).filter(item=>{
          const key=normalize(item.label);
          if(!key||seen.has(key)||!document.getElementById(item.href.slice(1)))return false;
          seen.add(key);return true;
        });
      };
      const hide=()=>{panel.hidden=true;panel.replaceChildren();};
      const render=()=>{
        const q=normalize(autocompleteInput.value);
        panel.replaceChildren();
        if(!q){hide();return;}
        const options=getOptions().filter(item=>normalize(item.label).includes(q)).sort((a,b)=>{
          const aStart=normalize(a.label).startsWith(q)?0:1;
          const bStart=normalize(b.label).startsWith(q)?0:1;
          return aStart-bStart||a.label.localeCompare(b.label);
        }).slice(0,9);
        if(!options.length){hide();return;}
        options.forEach(item=>{
          const button=document.createElement('button');
          button.type='button';button.setAttribute('role','option');
          button.textContent=item.label;
          button.addEventListener('click',()=>{
            autocompleteInput.value='';
            autocompleteInput.dispatchEvent(new Event('input',{bubbles:true}));
            hide();
            const target=document.getElementById(item.href.slice(1));
            if(target){target.scrollIntoView({behavior:'smooth',block:'start'});history.replaceState(null,'',item.href);}
          });
          panel.appendChild(button);
        });
        panel.hidden=false;
      };
      autocompleteInput.addEventListener('input',render);
      autocompleteInput.addEventListener('focus',render);
      autocompleteInput.addEventListener('keydown',event=>{
        if(event.key==='Escape')hide();
        if(event.key==='Enter'&&!panel.hidden) {
          const first=panel.querySelector('button');
          if(first){event.preventDefault();first.click();}
        }
      });
      document.addEventListener('click',event=>{
        if(!panel.contains(event.target)&&event.target!==autocompleteInput)hide();
      });
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
