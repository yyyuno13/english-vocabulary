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
  // Legacy parser is retained for historical notes only. New entries use comparisonRows objects.
  const comparisonRows=text=>String(text||'').split(/[／\n]/).map(s=>s.trim()).filter(Boolean).map(part=>{
    const m=part.match(/^([^＝=:：]+)[＝=:：]\s*(.+)$/);
    return m?[m[1].trim(),m[2].trim()]:['補足',part];
  });
  const comparisonStyles=document.createElement('style');
  comparisonStyles.textContent='.comparison-scroll{overflow-x:auto;margin:10px 0 16px}.nuance-table{width:100%;border-collapse:collapse;min-width:0;table-layout:fixed;font-size:.92rem;line-height:1.6}.nuance-table th,.nuance-table td{border:1px solid var(--line,#ddd);padding:9px 12px;text-align:left;vertical-align:top;overflow-wrap:anywhere}.nuance-table thead th{background:var(--chip,#edf4f5);font-weight:700}.nuance-table tbody th{font-weight:700;overflow-wrap:anywhere;width:30%}.nuance-table tbody tr:nth-child(even){background:rgba(127,127,127,.035)}';
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
  // Lightweight inline SVG core-image diagrams for selected words.
  // All labels and paths are fixed author-controlled markup (not JSON HTML).
  const coreDiagrams = {
    clue: '<path d="M30 32 H112 V64 H60 V110 H144 V84 H206 V128 H292" fill="none" stroke="#94a3b8" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/><path d="M30 32 H112 V64 H60 V110 H144 V84 H206 V128 H292" fill="none" stroke="#f8fafc" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M30 32 H112 V64 H60 V110 H144 V84 H206 V128 H292" fill="none" stroke="#2563eb" stroke-width="3" stroke-dasharray="5 4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="30" cy="32" r="10" fill="#f59e0b"/><circle cx="292" cy="128" r="12" fill="#16a34a"/><text x="47" y="16">糸玉</text><text x="262" y="109">出口</text><text x="166" y="54">糸をたどる</text>',
    divert: '<path d="M20 90 H320" stroke="currentColor" stroke-opacity=".22" stroke-width="3" stroke-dasharray="7 7"/><path d="M20 90 H145 Q170 90 190 64 L268 18" stroke="#2563eb" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M252 20 L271 16 L265 34" stroke="#2563eb" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="145" cy="90" r="6" fill="#ea580c"/><text x="64" y="75">元の進路</text><text x="267" y="48">別の行き先</text><text x="268" y="111">本来の行き先</text><text x="145" y="118">方向転換</text>',
    converge: '<path d="M30 20 L165 80 M30 140 L165 80 M310 20 L165 80 M310 140 L165 80" stroke="#2563eb" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="165" cy="80" r="10" fill="#16a34a"/><text x="165" y="58">一点に集まる</text><text x="165" y="113">converge</text>',
    reduce: '<path d="M28 130 H310" stroke="currentColor" stroke-opacity=".3" stroke-width="2"/><rect x="48" y="25" width="74" height="105" rx="5" fill="#2563eb" fill-opacity=".75"/><rect x="220" y="78" width="74" height="52" rx="5" fill="#16a34a" fill-opacity=".75"/><path d="M140 68 H201" stroke="currentColor" stroke-width="2.5"/><path d="M191 59 L202 68 L191 77" stroke="currentColor" stroke-width="2.5" fill="none"/><text x="85" y="147">100</text><text x="257" y="147">50</text><text x="170" y="44">量を減らす</text>',
    prosper: '<path d="M22 130 H318" stroke="currentColor" stroke-opacity=".3" stroke-width="2"/><rect x="38" y="108" width="33" height="22" rx="3" fill="#16a34a" fill-opacity=".4"/><rect x="92" y="89" width="33" height="41" rx="3" fill="#16a34a" fill-opacity=".5"/><rect x="146" y="66" width="33" height="64" rx="3" fill="#16a34a" fill-opacity=".6"/><rect x="200" y="43" width="33" height="87" rx="3" fill="#16a34a" fill-opacity=".7"/><rect x="254" y="19" width="33" height="111" rx="3" fill="#16a34a" fill-opacity=".8"/><path d="M42 99 Q148 91 275 12" stroke="#2563eb" stroke-width="3" fill="none"/><path d="M258 13 L278 10 L272 30" stroke="#2563eb" stroke-width="3" fill="none"/><text x="162" y="148">順調に成長・繁栄する</text>',
    shimmering: '<rect x="18" y="45" width="304" height="102" rx="10" fill="#93c5fd" fill-opacity=".15"/><path d="M25 70 Q55 58 85 70 T145 70 T205 70 T265 70 T315 70 M25 100 Q55 88 85 100 T145 100 T205 100 T265 100 T315 100 M25 129 Q55 117 85 129 T145 129 T205 129 T265 129 T315 129" stroke="#3b82f6" stroke-width="2" fill="none" stroke-opacity=".6"/><path d="M74 56 V80 M62 68 H86 M155 85 V109 M143 97 H167 M245 55 V79 M233 67 H257 M285 109 V133 M273 121 H297" stroke="#eab308" stroke-width="2.5" stroke-linecap="round"/><text x="170" y="26">水面で光が細かく揺れながらきらめく</text>',
    conventional: '<rect x="20" y="20" width="210" height="114" rx="13" fill="#2563eb" fill-opacity=".07" stroke="#2563eb" stroke-width="2" stroke-dasharray="6 4"/><circle cx="60" cy="53" r="12" fill="#2563eb"/><circle cx="106" cy="53" r="12" fill="#2563eb"/><circle cx="152" cy="53" r="12" fill="#2563eb"/><circle cx="198" cy="53" r="12" fill="#2563eb"/><circle cx="60" cy="100" r="12" fill="#2563eb"/><circle cx="106" cy="100" r="12" fill="#2563eb"/><circle cx="152" cy="100" r="12" fill="#2563eb"/><circle cx="198" cy="100" r="12" fill="#2563eb"/><circle cx="282" cy="75" r="16" fill="#f59e0b"/><text x="125" y="153">一般的・標準的</text><text x="280" y="111">型破り</text>',
    dimension: '<path d="M65 75 L205 75 L265 30 L125 30 Z M205 75 L265 30 L265 140 L205 185 Z M65 75 L205 75 L205 185 L65 185 Z" stroke="#2563eb" stroke-width="2" fill="#60a5fa" fill-opacity=".09"/><path d="M65 198 H205 M54 75 V185 M215 196 L277 147" stroke="#ea580c" stroke-width="2.5" fill="none"/><text x="135" y="216">幅 width</text><text x="34" y="135">高さ</text><text x="278" y="181">奥行き</text><text x="140" y="130">3 dimensions</text>',
    jury: '<rect x="108" y="12" width="124" height="28" rx="6" fill="#64748b" fill-opacity=".16"/><text x="170" y="31">証拠 evidence</text><path d="M170 42 V63 M165 57 L170 64 L175 57" stroke="#64748b" stroke-width="2" fill="none"/><rect x="24" y="68" width="292" height="72" rx="10" fill="#2563eb" fill-opacity=".07" stroke="#2563eb" stroke-dasharray="5 4"/><circle cx="65" cy="91" r="10" fill="#2563eb"/><circle cx="107" cy="91" r="10" fill="#2563eb"/><circle cx="149" cy="91" r="10" fill="#2563eb"/><circle cx="191" cy="91" r="10" fill="#2563eb"/><circle cx="233" cy="91" r="10" fill="#2563eb"/><circle cx="275" cy="91" r="10" fill="#2563eb"/><text x="170" y="127">陪審員団 jury</text><path d="M170 141 V153" stroke="#64748b" stroke-width="2"/><text x="170" y="158">評決 verdict</text>',
    visibility: '<rect x="10" y="25" width="150" height="112" rx="12" fill="#94a3b8" fill-opacity=".18" stroke="#94a3b8" stroke-dasharray="5 4"/><rect x="180" y="25" width="150" height="112" rx="12" fill="#2563eb" fill-opacity=".06" stroke="#2563eb" stroke-dasharray="5 4"/><path d="M42 80 Q85 43 128 80 Q85 117 42 80Z" stroke="#94a3b8" stroke-opacity=".25" stroke-width="3" fill="none"/><circle cx="85" cy="80" r="13" fill="#94a3b8" fill-opacity=".2"/><path d="M210 80 Q255 42 300 80 Q255 118 210 80Z" stroke="#2563eb" stroke-width="3" fill="none"/><circle cx="255" cy="80" r="14" fill="#2563eb"/><circle cx="255" cy="80" r="6" fill="white"/><text x="85" y="154">Low visibility</text><text x="255" y="154">High visibility</text>',
    pigment: '<rect x="15" y="32" width="126" height="90" rx="12" fill="#64748b" fill-opacity=".07" stroke="#94a3b8" stroke-dasharray="4 4"/><circle cx="36" cy="52" r="8" fill="#dc2626"/><circle cx="62" cy="65" r="8" fill="#2563eb"/><circle cx="92" cy="49" r="8" fill="#eab308"/><circle cx="117" cy="78" r="8" fill="#dc2626"/><circle cx="46" cy="95" r="8" fill="#eab308"/><circle cx="85" cy="92" r="8" fill="#2563eb"/><circle cx="106" cy="108" r="8" fill="#eab308"/><path d="M152 78 H186 L179 71 M186 78 L179 85" stroke="#64748b" stroke-width="2" fill="none"/><rect x="198" y="38" width="125" height="80" rx="8" fill="#2563eb" fill-opacity=".12" stroke="#2563eb"/><path d="M203 95 Q232 52 254 81 T318 57" stroke="#dc2626" stroke-width="13" fill="none" stroke-linecap="round"/><path d="M205 106 Q246 99 281 111 T317 98" stroke="#eab308" stroke-width="9" fill="none" stroke-linecap="round"/><text x="78" y="145">顔料の粒子</text><text x="260" y="145">キャンバスの色</text>',
    narrative: '<rect x="20" y="15" width="90" height="40" rx="7" fill="#64748b" fill-opacity=".12" stroke="#64748b"/><rect x="125" y="15" width="90" height="40" rx="7" fill="#64748b" fill-opacity=".12" stroke="#64748b"/><rect x="230" y="15" width="90" height="40" rx="7" fill="#64748b" fill-opacity=".12" stroke="#64748b"/><text x="65" y="40">Event A</text><text x="170" y="40">Event B</text><text x="275" y="40">Event C</text><path d="M65 60 V85 H275 V60 M170 85 V115" fill="none" stroke="#64748b" stroke-width="2"/><rect x="55" y="120" width="230" height="45" rx="10" fill="#2563eb" fill-opacity=".12" stroke="#2563eb"/><text x="170" y="148">Narrative</text>',
    preserve: '<rect x="12" y="32" width="90" height="65" rx="8" fill="#64748b" fill-opacity=".1" stroke="#64748b"/><circle cx="57" cy="66" r="16" fill="#16a34a" fill-opacity=".2" stroke="#16a34a"/><path d="M107 66 H155 M146 58 L155 66 L146 74" stroke="currentColor" fill="none" stroke-width="2"/><path d="M164 35 L194 25 L224 35 V63 Q220 84 194 96 Q168 84 164 63 Z" fill="#2563eb" fill-opacity=".1" stroke="#2563eb" stroke-width="2"/><path d="M181 60 L191 71 L208 49" fill="none" stroke="#16a34a" stroke-width="4"/><path d="M229 66 H270 M261 58 L270 66 L261 74" stroke="currentColor" fill="none" stroke-width="2"/><circle cx="300" cy="66" r="16" fill="#16a34a" fill-opacity=".2" stroke="#16a34a"/><text x="57" y="118">Original</text><text x="194" y="118">Preserve</text><text x="300" y="118">Retained</text>'
  };

  // Curated semantic diagrams: every headword has an explicit concept and diagram type.
  const semanticSpecs={"hiatus":["gap","活動","空白期間"],"drowsiness":["fade","覚醒","眠気"],"predicament":["trap","困難","抜け出しにくい"],"compensation":["balance","損失","埋め合わせ"],"dilute":["spread","濃い","薄い"],"delegate":["transfer","自分の仕事","他者へ委任"],"flock-to":["gather","各地の人","一か所に集まる"],"subside":["fall","高い水準","落ち着く"],"circle-back":["cycle","話題","再び戻る"],"ulterior":["hidden","表向きの理由","隠れた目的"],"folk":["gather","個々の人","共同体"],"permissible":["gate","規則・基準","許容される"],"condescendingly":["hierarchy","相手を下に見る","上から話す"],"subsidy":["transfer","公的資金","支援対象"],"tolerable":["threshold","負担・不快","耐えられる範囲"],"amendment":["edit","元の規定","一部を修正"],"hilarious":["rise","面白さ","大笑い"],"speculation":["branch","手がかり","複数の推測"],"pave":["path","障害のある道","通れる道"],"candidly":["reveal","隠していたこと","率直に伝える"],"prominent":["standout","周囲","際立つ"],"preside":["center","参加者","議事を取り仕切る"],"literature":["gather","文字・記録","作品・文献群"],"malfunction":["break","正常な動作","不具合"],"incorporate":["merge","別々の要素","一つの全体"],"signify":["signal","見えるしるし","背後の意味"],"intriguing":["mystery","わからないこと","知りたい気持ち"],"infrared":["spectrum","可視光の赤","赤外線"],"faint":["fade","強い感覚","かすか"],"apparent":["reveal","見えているもの","明白／見かけ"],"transparent":["reveal","遮るもの","内部が見える"],"prevail":["contest","競い合う力","一方が優勢"],"plausible":["gate","説明・仮説","筋が通る"],"provincial":["center","中心都市","地方・周辺"],"converge":["gather","別々の方向","一点に近づく"],"compromise":["balance","対立する立場","歩み寄る"],"disruption":["break","連続した流れ","途中で断絶"],"reduce":["fall","大きい・多い","小さい・少ない"],"prosper":["rise","現在の状態","発展・繁栄"],"divert":["fork","元の進路","別方向へ"],"shimmering":["wave","光の反射","細かなきらめき"],"conventional":["standout","共通の型","慣習・標準"],"dimension":["axes","一つの対象","複数の側面"],"jury":["gather","証拠・証言","共同で評決"],"visibility":["reveal","見えにくい","はっきり見える"],"pigment":["spread","色の粒子","物に色を与える"],"narrative":["sequence","個々の出来事","一つの筋書き"],"preserve":["shield","守る対象","状態を維持"],"strike":["impact","動くもの","強く当たる"],"scenery":["panorama","山・空・湖","一つの風景"],"temperate":["balance","暑い・寒い","適度な状態"],"tectonic":["shift","巨大な地殻","構造が動く"],"compression":["squeeze","広い状態","押し縮める"],"erosion":["erode","元の地形","少しずつ削れる"],"precipitation":["rain","雲・大気","地表へ落ちる"],"comparative":["compare","対象A・対象B","共通基準で比較"],"excavate":["excavate","地中に埋まる","土を除き発掘"],"plateaus":["plateau","上昇する値","高い水準で横ばい"],"valid":["gate","条件・証拠","基準を満たす"]};
  const conceptDiagram=(id,description='')=>{
    const spec=semanticSpecs[id];if(!spec)return '';
    const [kind,left,right]=spec;
    const t=(x,y,value,size=12)=>'<text x="'+x+'" y="'+y+'" text-anchor="middle" font-size="'+size+'" fill="#334155">'+escapeHTML(value)+'</text>';
    const line=(d,color='#2563eb',width=3)=>'<path d="'+d+'" fill="none" stroke="'+color+'" stroke-width="'+width+'" stroke-linecap="round" stroke-linejoin="round"/>';
    const rect=(x,y,w,h,color='#e0f2fe')=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="9" fill="'+color+'" stroke="#94a3b8"/>';
    let art='';
    if(['rise','fall','plateau','fade','erode','wave','spectrum'].includes(kind)){
      art=line('M26 140 H314 M26 140 V18','#94a3b8',1.5);
      const shapes={rise:'M32 123 L88 114 L140 90 L195 66 L250 40 L305 23',fall:'M32 25 L88 45 L140 75 L195 100 L250 119 L305 127',plateau:'M32 130 L105 83 L167 45 L235 45 L305 45',fade:'M32 27 L90 52 L145 84 L205 109 L305 125',erode:'M32 38 L90 43 L145 62 L200 79 L255 101 L305 125',wave:'M32 83 Q54 30 76 83 T120 83 T164 83 T208 83 T252 83 T296 83',spectrum:'M32 100 H125 L125 100 L210 100 L210 100 L305 100'};
      art+=line(shapes[kind],kind==='erode'?'#b45309':'#2563eb',4);
      if(kind==='spectrum')art+='<rect x="34" y="75" width="165" height="45" rx="5" fill="#bfdbfe"/><rect x="199" y="75" width="103" height="45" rx="5" fill="#fecaca"/>'+line('M198 62 V132','#ef4444',2);
      if(kind==='wave')art+=line('M32 112 Q54 59 76 112 T120 112 T164 112 T208 112 T252 112 T296 112','#60a5fa',2);
    }else if(['gather','center','merge','contest','balance','compare','branch'].includes(kind)){
      art+=rect(120,60,100,48,'#dcfce7');
      if(kind==='compare'||kind==='balance'){art+=rect(18,60,75,48)+rect(247,60,75,48)+line('M94 84 H118 M222 84 H246');}
      else if(kind==='branch'){art+=line('M170 60 L65 28 M170 60 L275 28 M170 108 L65 138 M170 108 L275 138');}
      else {art+=rect(16,22,77,38)+rect(16,118,77,38)+rect(247,22,77,38)+rect(247,118,77,38)+line('M94 42 L119 68 M94 137 L119 100 M246 42 L221 68 M246 137 L221 100');}
      art+=t(170,88,kind==='compare'?'比較':kind==='balance'?'調整':kind==='contest'?'優勢':kind==='branch'?'推測':'集約',13);
    }else if(['gate','threshold','trap','shield','hidden','reveal','mystery'].includes(kind)){
      art+=rect(30,46,108,76)+rect(204,46,108,76,'#dcfce7')+line('M139 84 H201 M191 77 L201 84 L191 91');
      art+=t(84,89,kind==='hidden'?'表面':kind==='trap'?'困難':'入力');
      art+=t(258,89,kind==='shield'?'保護':kind==='gate'?'承認':kind==='threshold'?'許容':'発見');
      if(kind==='gate'||kind==='shield')art+=line('M250 103 L260 113 L279 94','#16a34a',4);
    }else if(['fork','path','transfer','cycle','sequence','edit','signal','impact','break','shift','squeeze','excavate','rain','spread','panorama','standout','hierarchy','axes'].includes(kind)){
      const special={
      fork:line('M25 124 H125 Q153 124 177 88 L286 25')+line('M177 88 L286 124','#94a3b8',2),
      path:line('M25 128 L90 111 L145 89 L205 65 L310 33','#16a34a',8),
      transfer:rect(18,55,110,62)+rect(212,55,110,62,'#dcfce7')+line('M132 86 H207 M198 78 L207 86 L198 94'),
      cycle:line('M70 94 C70 10 270 10 270 94 C270 170 70 170 70 94')+line('M257 82 L270 94 L280 80'),
      sequence:rect(14,55,88,62)+rect(126,55,88,62)+rect(238,55,88,62)+line('M103 86 H125 M215 86 H237'),
      edit:rect(35,45,115,78)+rect(190,45,115,78,'#dcfce7')+line('M151 85 H189')+line('M215 88 L235 104 L280 60','#16a34a',4),
      signal:rect(26,55,104,64)+line('M130 87 H211')+rect(212,55,102,64,'#dcfce7'),
      impact:line('M35 40 L160 95 L125 97 M160 95 L146 62')+line('M160 95 L245 95','#ea580c',5),
      break:line('M25 85 H140 M200 85 H315')+line('M140 65 L160 105 L180 65 L200 85','#dc2626',4),
      shift:rect(35,45,110,90)+rect(195,45,110,90,'#dcfce7')+line('M145 88 L194 66 M185 62 L194 66 L188 76'),
      squeeze:rect(24,45,125,90)+rect(225,65,70,50,'#dcfce7')+line('M151 88 H221'),
      excavate:'<path d="M24 55 H316 V138 H24Z" fill="#c4a484"/><path d="M130 55 V118 H220 V55" fill="#f8fafc" stroke="#92400e" stroke-width="3"/>'+line('M175 105 V23 M167 31 L175 23 L183 31'),
      rain:'<path d="M110 50 Q90 16 125 18 Q148 0 175 22 Q205 5 220 34 Q250 38 238 57Z" fill="#bfdbfe" stroke="#2563eb"/>'+line('M135 70 L123 99 M180 70 L168 99 M225 70 L213 99')+line('M26 128 H314','#64748b',2),
      spread:'<circle cx="68" cy="87" r="24" fill="#2563eb"/><circle cx="205" cy="48" r="9" fill="#2563eb"/><circle cx="260" cy="84" r="9" fill="#2563eb"/><circle cx="210" cy="124" r="9" fill="#2563eb"/>'+line('M99 87 H165 M156 79 L165 87 L156 95'),
      panorama:'<path d="M20 130 L80 40 L130 110 L190 30 L260 118 L320 55 V145 H20Z" fill="#bbf7d0" stroke="#15803d"/>',
      standout:'<circle cx="70" cy="90" r="13" fill="#94a3b8"/><circle cx="130" cy="90" r="13" fill="#94a3b8"/><circle cx="190" cy="62" r="22" fill="#2563eb"/><circle cx="260" cy="90" r="13" fill="#94a3b8"/>',
      hierarchy:rect(115,15,110,42)+rect(35,105,110,42)+rect(195,105,110,42)+line('M170 58 V82 H90 V103 M170 82 H250 V103'),
      axes:line('M70 120 H275 M70 120 V25 M70 120 L135 55')+line('M275 120 L265 114 M275 120 L265 126')
      };art+=special[kind]||'';
    }
    const svg='<svg viewBox="0 0 340 184" role="img" aria-label="'+escapeHTML(id)+' の意味を示す個別概念図" xmlns="http://www.w3.org/2000/svg">'+art+t(85,173,left,12)+t(255,173,right,12)+'</svg>';
    return '<figure class="core-diagram" data-core-word="'+escapeHTML(id)+'">'+svg+'<figcaption>'+escapeHTML(description||left+' → '+right)+'</figcaption></figure>';
  };
  const coreDiagram=entry=>{
    const drawing=coreDiagrams[entry.id];
    if(!drawing)return conceptDiagram(entry.id,entry.core);
    return '<figure class="core-diagram" data-core-word="'+escapeHTML(entry.id)+'"><svg viewBox="0 0 340 160" role="img" aria-label="'+escapeHTML(entry.word)+' の個別コアイメージ図" xmlns="http://www.w3.org/2000/svg">'+drawing+'</svg><figcaption>'+escapeHTML(entry.core)+'</figcaption></figure>';
  };
  function annotateStaticCoreDiagrams(){
    document.querySelectorAll('main section.family').forEach(section=>{
      if(!semanticSpecs[section.id]||section.querySelector('.core-diagram'))return;
      const field=[...section.querySelectorAll(':scope > .field')].find(el=>el.querySelector('b')?.textContent.includes('コアイメージ'));
      if(!field)return;
      const description=field.textContent.replace(/^.*?コアイメージ/,'').trim();
      field.insertAdjacentHTML('afterend',conceptDiagram(section.id,description));
    });
  }
  document.addEventListener('DOMContentLoaded',annotateStaticCoreDiagrams,{once:true});
  if(document.readyState!=='loading')annotateStaticCoreDiagrams();
  const diagramStyle=document.createElement('style');
  diagramStyle.textContent='.core-diagram{margin:12px 0 18px;padding:12px;border:1px solid var(--line,#ddd);border-radius:12px;background:var(--paper,#fff)}.core-diagram svg{display:block;width:100%;height:auto;max-height:220px}.core-diagram svg text{font-size:12px;fill:currentColor;text-anchor:middle}.core-diagram figcaption{margin-top:8px;font-size:.87rem;color:var(--muted,#666);line-height:1.6}';
  document.head.appendChild(diagramStyle);

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
      '<div class="field"><b>② コアイメージ</b>'+escapeHTML(entry.core)+'</div>'+coreDiagram(entry)+
      '<div class="field"><b>③ 基本情報と例文</b>'+escapeHTML(entry.usage)+'</div>'+examples+
      '<div class="related"><h3>④ 同語源の単語</h3>'+(entry.related||[]).map(x=>relatedCard(entry.id,x)).join('')+
      '<h3>⑤ 同義語・類義語</h3>'+(entry.synonyms||[]).map(x=>relatedCard(entry.id,x)).join('')+
      '<div class="field"><b>ニュアンス比較</b>'+comparisonTable((entry.comparisonRows&&entry.comparisonRows.length?entry.comparisonRows.map(item=>[item.word,item.nuance]):[[entry.word,entry.core],...(entry.synonyms||[]).map(item=>[item.word,item.note||item.meaning])]))+'</div></div></section>';
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
    // Resolve deep links even when the requested chapter was created asynchronously.
    const requested=decodeURIComponent(location.hash.slice(1));
    const requestedTarget=document.getElementById(requested);
    if(requestedTarget){
      if(requestedTarget.closest('details'))requestedTarget.closest('details').open=true;
      requestAnimationFrame(()=>requestedTarget.scrollIntoView({block:'start'}));
      window.parent?.postMessage({type:'vocabulary-target-ready',id:requested},location.origin);
    }
    // If a URL points to a related word, make sure the target is visible.
    if(location.hash) {
      const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if(target&&added.some(section=>section.contains(target)))target.scrollIntoView();
    }
  } catch(error) { console.error('Vocabulary data could not be loaded:',error); }
})();
