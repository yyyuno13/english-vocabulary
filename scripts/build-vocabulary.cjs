// Generated HTML is committed for GitHub Pages; JSON is the single editable source.
const fs=require('node:fs');
const path=require('node:path');

function generate(template,data){
 const entries=data.entries;
 if(!Array.isArray(entries)||!entries.length)throw Error("entries must be nonempty");
 const ids=new Set();
 for(const e of entries){if(!/^[a-z0-9-]+$/i.test(e.id)||ids.has(e.id))throw Error("Invalid or duplicate id: "+e.id);ids.add(e.id);}
 const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const stars=n=>"★".repeat(Math.max(1,Math.min(5,Number(n)||1)));
 const card=(parent,x)=>'<article class="wordcard searchable" id="'+esc(parent+"-"+x.word)+'" data-search="'+esc(x.word+" "+x.meaning)+'"><h4>'+esc(x.word)+' <span class="small">'+esc(x.ipa)+'｜'+esc(x.pos)+'</span></h4><button class="pronounce-btn" data-say="'+esc(x.word)+'" type="button">🔊 発音</button><div>'+esc(x.meaning)+'</div><div class="meta"><span class="pill">難易度 '+stars(x.difficulty)+'</span><span class="pill">日常 '+stars(x.daily)+'</span><span class="pill">ビジネス '+stars(x.business)+'</span></div><p><b>例：</b>'+esc(x.example)+'<br><b>訳：</b>'+esc(x.translation)+'</p><p class="small"><b>語源・使い分け：</b>'+esc(x.note)+'</p></article>';
 const section=(e,i)=>'<section class="family searchable" id="'+esc(e.id)+'" data-search="'+esc([e.word,e.meaning,...(e.related||[]).map(x=>x.word),...(e.synonyms||[]).map(x=>x.word)].join(" "))+'"><h2>'+(i+18)+'. '+esc(e.word)+'</h2><button class="pronounce-btn" data-say="'+esc(e.word)+'" type="button">🔊 発音</button><div class="backlinks"><a href="#toc">↑ 目次へ</a><a href="#word-index">単語インデックスへ</a></div><div class="meta"><span class="pill">'+esc(e.pos)+'</span><span class="pill">発音：'+esc(e.ipa)+'</span><span class="pill">難易度 '+stars(e.difficulty)+'</span><span class="pill">日常 '+stars(e.daily)+'</span><span class="pill">ビジネス '+stars(e.business)+'</span></div><div class="field"><b>意味</b>'+esc(e.meaning)+'</div><div class="field"><b>① 語源の分解と解説</b>'+esc(e.etymology)+'</div><div class="field"><b>② コアイメージ</b>'+esc(e.core)+'</div><div class="field"><b>③ 基本情報と例文</b>'+esc(e.usage)+'</div>'+(e.examples||[]).map(x=>'<div class="example"><b>例：</b>'+esc(x[0])+'<br><b>訳：</b>'+esc(x[1])+'</div>').join("")+'<div class="related"><h3>④ 同語源の単語</h3>'+(e.related||[]).map(x=>card(e.id,x)).join("")+'<h3>⑤ 同義語・類義語</h3>'+(e.synonyms||[]).map(x=>card(e.id,x)).join("")+'<div class="field"><b>ニュアンス比較</b><table class="nuance-table"><thead><tr><th>単語</th><th>ニュアンス</th></tr></thead><tbody>'+(e.comparisonRows||[{word:e.word,nuance:e.core},...(e.synonyms||[]).map(x=>({word:x.word,nuance:x.note||x.meaning}))]).map(x=>'<tr><th>'+esc(x.word)+'</th><td>'+esc(x.nuance)+'</td></tr>').join("")+'</tbody></table></div></div></section>';
 const chapters=entries.map(section).join("\n");
 const toc=entries.map((e,i)=>'<a href="#'+esc(e.id)+'">'+(i+18)+'. '+esc(e.word)+'</a>').join("");
 const index=entries.map(e=>'<a href="#'+esc(e.id)+'">'+esc(e.word)+'</a>').join("");
 for(const marker of ["GENERATED_CHAPTERS","GENERATED_TOC","GENERATED_INDEX"])if(!template.includes("<!-- "+marker+" -->"))throw Error("Missing marker: "+marker);
 const output=template.replace("<!-- GENERATED_CHAPTERS -->",chapters).replace("<!-- GENERATED_TOC -->",toc).replace("<!-- GENERATED_INDEX -->",index);
 if((output.match(/<section class="family searchable" id="/g)||[]).length!==entries.length)throw Error("Generated chapter count mismatch");
 for(const e of entries)if(!output.includes('id="'+e.id+'"')||!output.includes('href="#'+e.id+'"'))throw Error("Missing anchor: "+e.id);
 return output;
}

const root=path.resolve(__dirname,'..');
const template=fs.readFileSync(path.join(root,'templates/index.template.html'),'utf8');
const data=JSON.parse(fs.readFileSync(path.join(root,'words/entries.json'),'utf8'));
const output=generate(template,data);
const dest=path.join(root,'index.html');
if(process.argv.includes('--check')){
 if(fs.readFileSync(dest,'utf8')!==output){console.error('index.html is not up to date. Run node scripts/build-vocabulary.cjs');process.exit(1);}
 console.log('Generated HTML is up to date:',data.entries.length,'JSON chapters');
}else{fs.writeFileSync(dest,output);console.log('Generated',data.entries.length,'JSON chapters in index.html');}
