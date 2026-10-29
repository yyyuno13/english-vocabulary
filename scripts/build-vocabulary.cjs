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
 const card=(parent,x,kind)=>'<article class="wordcard searchable" id="'+esc(parent+"-"+x.word)+'" data-search="'+esc(x.word+" "+x.meaning)+'"><h4>'+esc(x.word)+' <span class="small">'+esc(x.ipa)+'｜'+esc(x.pos)+'</span></h4><button class="pronounce-btn" data-say="'+esc(x.word)+'" type="button">🔊 発音</button><div>'+esc(x.meaning)+'</div><div class="meta"><span class="pill">難易度 '+stars(x.difficulty)+'</span><span class="pill">日常 '+stars(x.daily)+'</span><span class="pill">ビジネス '+stars(x.business)+'</span></div><p><b>例：</b>'+esc(x.example)+'<br><b>訳：</b>'+esc(x.translation)+'</p><p class="small"><b>語源・使い分け：</b>'+esc(x.note)+'</p>'+(x.etymology?'<p class="small"><b>語源の補足：</b>'+esc(x.etymology)+'</p>':'')+((kind==='related'&&rootMap[parent]?.[0]!=='その他')||synonymRootLinks[parent]?.[x.word]?'<p><a class="etymology-root-link" data-root="'+esc((kind==='related'?rootMap[parent][0]:synonymRootLinks[parent][x.word]))+'" href="./roots.html#root='+encodeURIComponent((kind==='related'?rootMap[parent][0]:synonymRootLinks[parent][x.word]))+'">同語源グループ：'+esc((kind==='related'?rootMap[parent][0]:synonymRootLinks[parent][x.word]))+' →</a></p>':'')+'</article>';
 const rootLink=e=>{const group=rootMap[e.id]?.[0];return group&&group!=='その他'?'<a class="etymology-root-link" href="./roots.html#root='+encodeURIComponent(group)+'" data-root="'+esc(group)+'">語源別：'+esc(group)+' →</a>':''};
 const section=(e,i)=>'<section class="family searchable" id="'+esc(e.id)+'" data-search="'+esc([e.word,e.meaning,...(e.related||[]).map(x=>x.word),...(e.synonyms||[]).map(x=>x.word),...(e.reference||[]).map(x=>x.word)].join(" "))+'"><h2>'+(i+1)+'. '+esc(e.word)+'</h2>'+rootLink(e)+'<button class="pronounce-btn" data-say="'+esc(e.word)+'" type="button">🔊 発音</button><div class="backlinks"><a href="#toc">↑ 目次へ</a><a href="#word-index">単語インデックスへ</a></div><div class="meta"><span class="pill">'+esc(e.pos)+'</span><span class="pill">発音：'+esc(e.ipa)+'</span><span class="pill">難易度 '+stars(e.difficulty)+'</span><span class="pill">日常 '+stars(e.daily)+'</span><span class="pill">ビジネス '+stars(e.business)+'</span></div><div class="field"><b>意味</b>'+esc(e.meaning)+'</div><div class="field"><b>① 語源の分解と解説</b>'+esc(e.etymology)+'</div><div class="field"><b>② コアイメージ</b>'+esc(e.core)+'</div><div class="field"><b>③ 基本情報と例文</b>'+esc(e.usage)+'</div>'+(e.examples||[]).map(x=>'<div class="example"><b>例：</b>'+esc(x[0])+'<br><b>訳：</b>'+esc(x[1])+'</div>').join("")+'<div class="related"><h3>④ 同語源の単語</h3>'+(e.related||[]).map(x=>card(e.id,x,'related')).join("")+'<h3>⑤ 同義語・類義語</h3>'+(e.synonyms||[]).map(x=>card(e.id,x,'synonym')).join("")+'<div class="field"><b>ニュアンス比較</b><table class="nuance-table"><thead><tr><th>単語</th><th>ニュアンス</th></tr></thead><tbody>'+(e.comparisonRows||[{word:e.word,nuance:e.core},...(e.synonyms||[]).map(x=>({word:x.word,nuance:x.note||x.meaning}))]).map(x=>'<tr><th>'+esc(x.word)+'</th><td>'+esc(x.nuance)+'</td></tr>').join("")+'</tbody></table></div>'+(e.reference?.length?'<h3>参考語（同語源・同義とは限らない）</h3>'+e.reference.map(x=>card(e.id,x,'reference')).join(''):'')+'</div></section>';
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
