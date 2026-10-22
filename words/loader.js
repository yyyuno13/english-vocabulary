/* Vocabulary data loader: preserves existing HTML/CSS and pronunciation handler. */
(async function () {
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const stars = n => '★'.repeat(Math.max(1,Math.min(5,Number(n)||1))) + '☆'.repeat(5-Math.max(1,Math.min(5,Number(n)||1)));

  // Grammar labels for all static and dynamically loaded vocabulary cards.
  // C = countable, U = uncountable, T = transitive, I = intransitive.
  const nounU=new Set(("drowsiness compensation chaos remuneration reimbursement fatigue sleepiness somnolence lethargy torpor folklore folk music literature writing fiction documentation literacy malnutrition malpractice infrastructure applause candor eminence prominence prevalence transparency plausibility feasibility significance incorporation speculation conjecture inference pavement paving radiation infrared ultraviolet malnutrition").split(" "));
  const nounCU=new Set(("hiatus pause break recess gap predicament dilemma plight quandary fix mess salary wage pension indemnity reparation expense delegation legacy flock sediment residue ease session circulation circuit secret population community publication bibliography brochure function dysfunction failure breakdown defect glitch corporation corpus signal intrigue intricacy figure feint value triumph prospect assumption rumor guess appearance disappearance literature writing documentation fiction malfunction compensation speculation candidacy presidency presidency equivalent credit applause").split(" "));
  const verbI=new Set(("drowse depend flock to flock together gravitate toward(s) converge on subside recede taper off return to get back to come back to reside preside prevail persist disappear appear pass out go wrong malfunction speculate faint triumph").split(" "));
  const verbTI=new Set(("pause break drowse fatigue dictate compensate thin weaken reduce gather diminish abate ease circle circulate flock rush to pour into lead moderate govern function signal intrigue feint figure dim open clear manifest value merge assimilate integrate incorporate indicate signify imply mean represent symbolize inspect guess conjecture speculate prevail overcome dominate faint appear disappear persuade applaud feign persist reside").split(" "));
  const verbMeaning={
    "prevail":"I：勝利する／（慣習などが）広く行われる。prevail on/upon 人 to do：人を説得して〜させる",
    "faint":"I：気絶する（形容詞：かすかな）",
    "malfunction":"I：故障する（名詞：故障）",
    "preside":"I：preside over ～＝〜を主宰する",
    "subside":"I：（痛み・風・混乱などが）弱まる／収まる",
    "flock":"I：群がる・押し寄せる／T：羊などを群れにする（まれ）",
    "flock to":"I：flock to ～＝〜に大勢押し寄せる",
    "depend":"I：depend on ～＝〜に依存する",
    "speculate":"I：speculate about/on ～＝〜について推測・投機する／T：speculate that ...＝〜と推測する（that節）",
    "compensate":"T：人に補償する／I：compensate for ～＝〜を埋め合わせる",
    "delegate":"T：仕事・権限を委任する／I：代表として派遣する（まれ）",
    "dilute":"T：〜を薄める／I：薄まる（まれ）",
    "incorporate":"T：〜を組み込む／I：法人化する・合体する",
    "signify":"T：〜を意味する・示す／I：重要である（まれ）",
    "function":"I：機能する／名詞：機能・役割",
    "triumph":"I：勝利する／名詞：勝利",
    "persist":"I：続く、persist in ～＝〜を続ける",
    "appear":"I：現れる、〜のように見える",
    "disappear":"I：消える",
    "overcome":"T：困難などを克服する",
    "persuade":"T：人を説得する",
    "indicate":"T：〜を示す、指し示す",
    "inspect":"T：〜を検査する",
    "pave":"T：道を舗装する／pave the way for ～＝〜への道を開く",
    "lead":"T：人・組織を率いる／I：lead to ～＝〜につながる",
    "moderate":"T：会議などを進行する／I：穏やかになる",
    "circulate":"T：資料などを回覧する／I：うわさ・血液などが巡る",
    "gather":"T：情報・人を集める／I：人が集まる",
    "break":"T：〜を壊す／I：壊れる",
    "pause":"T：再生などを一時停止する／I：一時停止する",
    "diminish":"T：〜を減らす／I：減少する",
    "abate":"T：〜を弱める／I：弱まる",
    "ease":"T：〜を和らげる／I：和らぐ",
    "merge":"T：〜を統合する／I：合併する",
    "intrigue":"T：人の興味を引く／I：陰謀を企てる（古風）",
    "faint":"I：気絶する",
    "guess":"T：答えなどを推測する／I：推測する",
    "conjecture":"T：〜と推測する／I：推測する（まれ）"
  };
  const nounMeaning={
    "speculation":"U：憶測・投機／C：個々の推測（speculations）",
    "literature":"U：文学・文献／C：特定分野の文献群を指す用法は通常集合的",
    "compensation":"U：補償・報酬／C：個々の補償（限定的）",
    "malfunction":"C：個々の故障（a malfunction）",
    "faint":"C：気絶（a faint、主に英）",
    "infrared":"U：赤外線（光・放射として）",
    "transparency":"U：透明性",
    "plausibility":"U：もっともらしさ／C：もっともらしい点・説明（まれ）",
    "feasibility":"U：実現可能性",
    "applause":"U：拍手・称賛",
    "advice":"U：助言",
    "information":"U：情報",
    "drowsiness":"U：眠気",
    "predicament":"C：困った状況",
    "hiatus":"C：中断期間",
    "subsidy":"C：補助金",
    "amendment":"C：修正・改正条項",
    "folk":"C：人々（通常 folks）／U：folk music などの修飾用法"
  };
  const grammarLabel=(word,pos)=>{
    const w=String(word||'').trim().toLowerCase(),p=String(pos||'');
    const noun=/名詞/.test(p),verb=/動詞|句動詞/.test(p);
    if(!noun&&!verb)return '';
    const parts=[];
    if(noun)parts.push(nounMeaning[w]||((nounU.has(w)?'U':nounCU.has(w)?'C/U':'C')+'：'+(nounU.has(w)?'不可算':nounCU.has(w)?'可算・不可算（意味により異なる）':'可算')));
    if(verb)parts.push(verbMeaning[w]||((verbI.has(w)?'I':verbTI.has(w)?'T/I':'T')+'：'+(verbI.has(w)?'自動詞':verbTI.has(w)?'他動詞・自動詞（用法による）':'他動詞')));
    return parts.join('｜');
  };
  const grammarHTML=(word,pos)=>{const s=grammarLabel(word,pos);return s?'<span class="pill grammar-pill" title="T=他動詞 I=自動詞 C=可算 U=不可算">文法：'+escapeHTML(s)+'</span>':''};
  function annotateStaticGrammar(){
    // Existing chapters are authored directly in index.html; augment without rewriting their examples.
    const sections=[...document.querySelectorAll('main section.family')];
    sections.forEach(section=>{
      const h=section.querySelector('h2');
      if(!h)return;
      const word=h.textContent.replace(/^\s*\d+\.\s*/,'').trim();
      const meta=section.querySelector('.meta');
      const posText=meta?.textContent||'';
      const pos=(posText.match(/名詞|動詞|句動詞/g)||[]).join('・');
      if(meta&&pos&&!meta.querySelector('.grammar-pill'))meta.insertAdjacentHTML('beforeend',grammarHTML(word,pos));
      section.querySelectorAll('.wordcard').forEach(card=>{
        const h4=card.querySelector('h4');
        if(!h4)return;
        const label=h4.textContent.trim();
        const name=label.split(/\s+\//)[0].trim();
        const cpos=(label.match(/名詞|動詞|句動詞/g)||[]).join('・');
        const cardMeta=card.querySelector('.meta');
        if(cardMeta&&cpos&&!cardMeta.querySelector('.grammar-pill'))cardMeta.insertAdjacentHTML('beforeend',grammarHTML(name,cpos));
      });
    });
  }
  document.addEventListener('DOMContentLoaded',annotateStaticGrammar,{once:true});
  if(document.readyState!=='loading')annotateStaticGrammar();


  // Render nuance comparisons as readable tables across old and new chapters.
  const comparisonTable=(rows)=>{
    if(!rows.length)return '';
    return '<div class="comparison-scroll"><table class="nuance-table"><thead><tr><th scope="col">単語</th><th scope="col">ニュアンス・使い分け</th></tr></thead><tbody>'+
      rows.map(([word,detail])=>'<tr><th scope="row">'+escapeHTML(word)+'</th><td>'+escapeHTML(detail)+'</td></tr>').join('')+'</tbody></table></div>';
  };
  const comparisonRows=text=>String(text||'').split(/[／\n]/).map(s=>s.trim()).filter(Boolean).map(part=>{
    const m=part.match(/^([^＝=:：]+)[＝=:：]\s*(.+)$/);
    return m?[m[1].trim(),m[2].trim()]:['補足',part];
  });
  const comparisonStyles=document.createElement('style');
  comparisonStyles.textContent='.comparison-scroll{overflow-x:auto;margin:10px 0 16px}.nuance-table{width:100%;border-collapse:collapse;min-width:360px;font-size:.92rem;line-height:1.6}.nuance-table th,.nuance-table td{border:1px solid var(--line,#ddd);padding:9px 12px;text-align:left;vertical-align:top}.nuance-table thead th{background:var(--chip,#edf4f5);font-weight:700}.nuance-table tbody th{font-weight:700;white-space:nowrap;width:25%}.nuance-table tbody tr:nth-child(even){background:rgba(127,127,127,.035)}';
  document.head.appendChild(comparisonStyles);
  function annotateStaticComparisons(){
    document.querySelectorAll('main section.family').forEach(section=>{
      if(section.querySelector('.nuance-table'))return;
      const groups=[...section.querySelectorAll('.related')];
      if(!groups.length)return;
      const group=groups[0];
      const headings=[...group.querySelectorAll('h3')];
      const synonymHeading=headings.find(h=>/類義|同義/.test(h.textContent));
      if(!synonymHeading)return;
      const cards=[];
      let node=synonymHeading.nextElementSibling;
      while(node&&node.tagName!=='H3'){
        if(node.matches('.wordcard'))cards.push(node);
        else cards.push(...node.querySelectorAll('.wordcard'));
        node=node.nextElementSibling;
      }
      const rows=cards.map(card=>{
        const title=card.querySelector('h4')?.textContent||'';
        const word=title.split(/\s+\//)[0].trim();
        const note=[...card.querySelectorAll('p')].find(p=>/語源・使い分け/.test(p.textContent));
        const detail=note?.textContent.replace(/^\s*語源・使い分け：\s*/,'').trim()||card.querySelector('.small')?.textContent.trim()||'';
        return [word,detail];
      }).filter(row=>row[0]&&row[1]);
      if(rows.length){
        const wrap=document.createElement('div');
        wrap.innerHTML='<h3>ニュアンス比較</h3>'+comparisonTable(rows);
        group.appendChild(wrap);
      }
    });
  }
  document.addEventListener('DOMContentLoaded',annotateStaticComparisons,{once:true});
  if(document.readyState!=='loading')annotateStaticComparisons();

  const back = id => '<div class="backlinks"><a href="#toc">↑ 目次へ</a><a href="#'+id+'">このテーマへ</a></div>';
  function relatedCard(parent, item) {
    const w=escapeHTML(item.word), id=escapeHTML(parent+'-'+item.word);
    return '<article class="wordcard searchable" data-search="'+escapeHTML([item.word,item.meaning,item.pos,item.note].join(' '))+'" id="'+id+'">'+
      '<h4>'+w+' <span class="small">'+escapeHTML(item.ipa)+'｜'+escapeHTML(item.pos)+'</span></h4>'+
      '<button aria-label="'+w+' の発音を再生" class="pronounce-btn" data-say="'+w+'" lang="en-US" type="button">🔊 発音</button>'+
      '<div>'+escapeHTML(item.meaning)+'</div><div class="meta">'+grammarHTML(item.word,item.pos)+
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
      '<div class="meta"><span class="pill">'+escapeHTML(entry.pos)+'</span>'+grammarHTML(entry.word,entry.pos)+'<span class="pill">発音：'+escapeHTML(entry.ipa)+'</span>'+
      '<span class="pill difficulty">難易度 '+stars(entry.difficulty)+'</span><span class="pill">日常 '+stars(entry.daily)+'</span><span class="pill">ビジネス '+stars(entry.business)+'</span></div>'+
      '<div class="field"><b>意味</b>'+escapeHTML(entry.meaning)+'</div>'+
      '<div class="field"><b>① 語源の分解と解説</b>'+escapeHTML(entry.etymology)+'</div>'+
      '<div class="field"><b>② コアイメージ</b>'+escapeHTML(entry.core)+'</div>'+
      '<div class="field"><b>③ 基本情報と例文</b>'+escapeHTML(entry.usage)+'</div>'+examples+
      '<div class="related"><h3>④ 同語源の単語</h3>'+(entry.related||[]).map(x=>relatedCard(entry.id,x)).join('')+
      '<h3>⑤ 同義語・類義語</h3>'+(entry.synonyms||[]).map(x=>relatedCard(entry.id,x)).join('')+
      '<div class="field"><b>ニュアンス比較</b>'+comparisonTable(comparisonRows(entry.comparison))+'</div></div></section>';
  }
  try {
    const response=await fetch('./words/entries.json',{cache:'no-cache'});
    if(!response.ok) throw new Error('HTTP '+response.status);
    const data=await response.json();
    annotateStaticGrammar();
    annotateStaticComparisons();
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
