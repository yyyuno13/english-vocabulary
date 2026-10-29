// Generated HTML is committed for GitHub Pages; JSON is the single editable source.
const fs=require('node:fs');
const path=require('node:path');

function generate(template,data,rootMap,synonymRootLinks){
 const availableRoots=new Set(Object.values(rootMap).map(x=>x[0]));
 for(const [parent,links] of Object.entries(synonymRootLinks)){
 const entry=data.entries.find(x=>x.id===parent);if(!entry)throw Error('Missing parent '+parent);
 for(const [word,group] of Object.entries(links)){if(!entry.synonyms.some(x=>x.word===word)||!availableRoots.has(group)||group==='その他')throw Error('Invalid synonym link '+parent+'/'+word);}}

 for(const entry of data.entries){if(!rootMap[entry.id])throw Error('Missing etymology group: '+entry.id);}

 for(const e of data.entries.slice(0,17)){
  const categories=[['related','cognate'],['synonyms','synonym'],['reference','reference']];
  const seen=new Set();
  for(const [field,kind] of categories)for(const x of e[field]||[]){
   if(x.relationship!==kind)throw Error('Incorrect legacy word classification: '+e.id+'/'+x.word);
   if(seen.has(x.word))throw Error('Duplicate related word across categories: '+e.id+'/'+x.word);
   seen.add(x.word);
   if(kind==='synonym'&&!x.etymology)throw Error('Missing synonym etymology: '+e.id+'/'+x.word);
  }
 }
 const entries=data.entries;
 if(!Array.isArray(entries)||!entries.length)throw Error("entries must be nonempty");
 const ids=new Set();
 for(const e of entries){if(!/^[a-z0-9-]+$/i.test(e.id)||ids.has(e.id))throw Error("Invalid or duplicate id: "+e.id);ids.add(e.id);}
 const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const stars=n=>n==null?'未評価':"★".repeat(Math.max(1,Math.min(5,Number(n)||1)));
 const usageHint=(e,x)=>{const w=x.word.toLowerCase(),p=e.id;const specific={hiatus:{interruption:'進行中の出来事が途中で遮られる場合。',pause:'短い一時停止。再開を予定する場面。',break:'仕事・活動の区切りや休憩。',gap:'時間・空間・能力などの空白や差。',recess:'会議・議会・学校などの公式な休止期間。'},drowsiness:{sleepiness:'一般的な眠気。日常会話に最も自然。',somnolence:'医療・薬剤の副作用としての傾眠。',lethargy:'眠気だけでなく無気力や活動性の低下。',torpor:'極端な不活発・鈍麻。専門的・文語的。'},predicament:{dilemma:'二つ以上の難しい選択肢の板挟み。',plight:'他人の深刻な苦境への同情を伴いやすい。',quandary:'どう判断すべきか分からない迷い。',fix:'困った状況を表す口語。',mess:'物事が混乱し収拾がつかない状態。'},compensation:{remuneration:'労働・役務に対する報酬。契約・人事で形式的。',salary:'月給・年俸など固定的な給与。',wage:'時給・日給など労働時間に連動する賃金。',reimbursement:'立替費用の実費精算。',indemnity:'損害の補償・免責。法務・保険で使用。',reparation:'被害や不正への償い・賠償。'},dilute:{thin:'液体や混合物を薄くする一般表現。',weaken:'力・効果・主張を弱める広い意味。', 'water down':'内容や主張を薄める口語的・批判的表現。',attenuate:'信号・強度・影響の減衰。専門的。',reduce:'数量・程度を減らす最も一般的な語。'},delegate:{assign:'仕事・役割を割り当てる。権限移譲は必須ではない。',entrust:'信頼して責任や物を任せる。','assign responsibility':'責任の所在を明確に割り当てる。','entrust someone with something':'人に特定の仕事・物を託す構文。'},'flock-to':{gather:'集まること自体を表す中立的な語。','rush to':'急いで殺到する。','pour into':'人や資金が大量に流入する。','gravitate toward(s)':'自然に引き寄せられる・好む。','converge on':'複数の方向から一か所へ集結する。'},subside:{ease:'痛み・緊張・負担が和らぐ。',abate:'嵐・怒り・危険などの勢いが弱まる。',diminish:'量・重要性・強さが小さくなる。',recede:'水位・痛み・危険などが後退する。','taper off':'時間をかけて徐々に減る。'},'circle-back':{revisit:'議題や判断を改めて検討する。','return to':'前の話題・場所へ戻る。','follow up on':'未解決事項の進捗を確認する。','get back to':'相手に後で返答する。','come back to':'話題を後で再び取り上げる。'},ulterior:{hidden:'単に見えない・隠された状態。',underlying:'表面に現れない根本原因・前提。',covert:'意図的に秘密裏に行う行動。','hidden agenda':'公表していない目的・思惑。',secret:'知られないようにされた情報・計画。'},folk:{people:'人々を広く指す中立的な基本語。',population:'地域・集団の人口を統計的に指す。',community:'共通の地域・関心・属性で結ばれた集団。'},permissible:{allowed:'規則や権限により許可されている。',acceptable:'基準・状況から見て容認できる。',allowable:'規定上認められる。経費・控除などにも使用。',legitimate:'法的・道義的に正当な。'},condescendingly:{patronizingly:'相手を子ども扱いする恩着せがましい態度。',arrogantly:'自分の優位性を誇示する傲慢さ。',disdainfully:'相手を価値の低いものとみなす軽蔑。',contemptuously:'強い侮蔑・軽視をあらわす。'},subsidy:{grant:'特定の目的に交付する助成金。','financial aid':'学費支援なども含む広い経済援助。',allowance:'制度に基づく手当・定額給付。',funding:'投資・融資・寄付を含む資金供給全般。'},tolerable:{bearable:'苦痛・不快さを我慢できる。',acceptable:'品質・条件が許容基準を満たす。',manageable:'負担・問題を対処可能な範囲に収められる。',endurable:'長期的な苦痛や困難に耐えられる。'},amendment:{revision:'文章・計画の見直し・改訂。',modification:'部分的な仕様・条件変更。',alteration:'形・内容を変えること一般。',correction:'誤りを正す修正。',addendum:'既存文書に追加する補遺。'},hilarious:{funny:'日常的な「面白い」。',amusing:'穏やかに楽しませる面白さ。',comical:'滑稽で喜劇的な面白さ。',hysterical:'笑いが止まらないほど非常に面白い口語用法。','side-splitting':'腹がよじれるほど面白い強調表現。'}};if(specific[p]?.[w])return specific[p][w];const note=String(x.note||'');const parts=note.split(/[。；;]/).map(v=>v.trim()).filter(Boolean);const semantic=parts.filter(v=>/より|違|一方|強調|場面|使う|用いる|指す|表す|含み|焦点|ニュアンス|響き|口語|専門|一般|形式的|比喩|強い|弱い|具体|抽象|主に|限定|広い|狭い|意味/.test(v)&&!/ラテン語|ギリシャ語|古英語|古フランス語|語源|由来|接頭辞|接尾辞/.test(v));return semantic.join('。')+(semantic.length?'。':'')||('「'+x.meaning+'」を表す。'+e.word+'と置き換える際は文脈・対象・語法を確認する。')};
 const compareRows=e=>{const original=new Map((e.comparisonRows||[]).map(x=>[x.word,x]));return [{word:e.word,meaning:e.meaning,usage:'中心語。'+e.core},...(e.synonyms||[]).map(x=>({word:x.word,meaning:x.meaning,usage:x.usageContrast||original.get(x.word)?.usage||usageHint(e,x)}))]};
 const card=(parent,x,kind)=>'<article class="wordcard searchable" id="'+esc(parent+"-"+x.word)+'" data-search="'+esc(x.word+" "+x.meaning)+'"><h4>'+esc(x.word)+' <span class="small">'+esc(x.ipa)+'｜'+esc(x.pos)+'</span></h4><button class="pronounce-btn" data-say="'+esc(x.word)+'" type="button">🔊 発音</button><div>'+esc(x.meaning)+'</div><div class="meta"><span class="pill">難易度 '+stars(x.difficulty)+'</span><span class="pill">日常 '+stars(x.daily)+'</span><span class="pill">ビジネス '+stars(x.business)+'</span></div><p><b>例：</b>'+esc(x.example)+'<br><b>訳：</b>'+esc(x.translation)+'</p><p class="small"><b>語源・使い分け：</b>'+esc(x.note)+'</p>'+(x.etymology?'<p class="small"><b>語源の補足：</b>'+esc(x.etymology)+'</p>':'')+((kind==='related'&&rootMap[parent]?.[0]!=='その他')||synonymRootLinks[parent]?.[x.word]?'<p><a class="etymology-root-link" data-root="'+esc((kind==='related'?rootMap[parent][0]:synonymRootLinks[parent][x.word]))+'" href="./roots.html#root='+encodeURIComponent((kind==='related'?rootMap[parent][0]:synonymRootLinks[parent][x.word]))+'">同語源グループ：'+esc((kind==='related'?rootMap[parent][0]:synonymRootLinks[parent][x.word]))+' →</a></p>':'')+'</article>';
 const rootLink=e=>{const group=rootMap[e.id]?.[0];return group&&group!=='その他'?'<a class="etymology-root-link" href="./roots.html#root='+encodeURIComponent(group)+'" data-root="'+esc(group)+'">語源別：'+esc(group)+' →</a>':''};
 const section=(e,i)=>'<section class="family searchable" id="'+esc(e.id)+'" data-search="'+esc([e.word,e.meaning,...(e.related||[]).map(x=>x.word),...(e.synonyms||[]).map(x=>x.word),...(e.reference||[]).map(x=>x.word)].join(" "))+'"><h2>'+(i+1)+'. '+esc(e.word)+'</h2>'+rootLink(e)+'<button class="pronounce-btn" data-say="'+esc(e.word)+'" type="button">🔊 発音</button><div class="backlinks"><a href="#toc">↑ 目次へ</a><a href="#word-index">単語インデックスへ</a></div><div class="meta"><span class="pill">'+esc(e.pos)+'</span><span class="pill">発音：'+esc(e.ipa)+'</span><span class="pill">難易度 '+stars(e.difficulty)+'</span><span class="pill">日常 '+stars(e.daily)+'</span><span class="pill">ビジネス '+stars(e.business)+'</span></div><div class="field"><b>意味</b>'+esc(e.meaning)+'</div><div class="field"><b>① 語源の分解と解説</b>'+esc(e.etymology)+'</div><div class="field"><b>② コアイメージ</b>'+esc(e.core)+'</div><div class="field"><b>③ 基本情報と例文</b>'+esc(e.usage)+'</div>'+(e.examples||[]).map(x=>'<div class="example"><b>例：</b>'+esc(x[0])+'<br><b>訳：</b>'+esc(x[1])+'</div>').join("")+'<div class="related"><h3>④ 同語源の単語</h3>'+(e.related||[]).map(x=>card(e.id,x,'related')).join("")+'<h3>⑤ 同義語・類義語</h3>'+(e.synonyms||[]).map(x=>card(e.id,x,'synonym')).join("")+'<div class="field"><b>ニュアンス比較</b><table class="nuance-table"><thead><tr><th>単語</th><th>意味</th><th>ニュアンス・使い分け</th></tr></thead><tbody>'+compareRows(e).map(x=>'<tr><th>'+esc(x.word)+'</th><td>'+esc(x.meaning)+'</td><td>'+esc(x.usage)+'</td></tr>').join("")+'</tbody></table></div>'+(e.reference?.length?'<h3>参考語（同語源・同義とは限らない）</h3>'+e.reference.map(x=>card(e.id,x,'reference')).join(''):'')+'</div></section>';
 const chapters=entries.map(section).join("\n");
 const toc=entries.map((e,i)=>'<a href="#'+esc(e.id)+'">'+(i+1)+'. '+esc(e.word)+'</a>').join("");
 const index=entries.map(e=>'<a href="#'+esc(e.id)+'">'+esc(e.word)+'</a>'+[...(e.related||[]),...(e.synonyms||[]),...(e.reference||[])].map(x=>'<a href="#'+esc(e.id+'-'+x.word)+'">'+esc(x.word)+'</a>').join('')).join("");
 for(const marker of ["GENERATED_CHAPTERS","GENERATED_TOC","GENERATED_INDEX"])if(!template.includes("<!-- "+marker+" -->"))throw Error("Missing marker: "+marker);
 const output=template.replace("<!-- GENERATED_CHAPTERS -->",chapters).replace("<!-- GENERATED_TOC -->",toc).replace("<!-- GENERATED_INDEX -->",index);
 if((output.match(/<section class="family searchable" id="/g)||[]).length!==entries.length)throw Error("Generated chapter count mismatch");
 for(const e of entries)if(!output.includes('id="'+e.id+'"')||!output.includes('href="#'+e.id+'"'))throw Error("Missing anchor: "+e.id);
 return output;
}

const root=path.resolve(__dirname,'..');
const template=fs.readFileSync(path.join(root,'templates/index.template.html'),'utf8');
const data=JSON.parse(fs.readFileSync(path.join(root,'words/entries.json'),'utf8'));
const rootMap=JSON.parse(fs.readFileSync(path.join(root,'words/root-map.json'),'utf8'));
const synonymRootLinks=JSON.parse(fs.readFileSync(path.join(root,'words/synonym-root-links.json'),'utf8'));
const output=generate(template,data,rootMap,synonymRootLinks);
const dest=path.join(root,'index.html');
if(process.argv.includes('--check')){
 if(fs.readFileSync(dest,'utf8')!==output){console.error('index.html is not up to date. Run node scripts/build-vocabulary.cjs');process.exit(1);}
 console.log('Generated HTML is up to date:',data.entries.length,'JSON chapters');
}else{fs.writeFileSync(dest,output);console.log('Generated',data.entries.length,'JSON chapters in index.html');}
