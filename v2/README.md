# 英単語ノート v2

旧版を一切上書きせず、独立したHTML/CSS/JavaScript/JSONで構成した新しい単語帳。

## URL と更新範囲

- 新版: https://yyyuno13.github.io/english-vocabulary/v2/
- 旧版: https://yyyuno13.github.io/english-vocabulary/roots.html
- v2 の更新は `v2/` 配下に限定する。旧版の `index.html`、`roots.html`、`words/entries.json`、`words/loader.js` は変更しない。

## ファイル構造

| ファイル | 担当 |
|---|---|
| `index.html` | 必要最低限の画面の骨組み |
| `styles.css` | レスポンシブな表示スタイル（iPhone優先） |
| `app.js` | 画面モード、検索、URL、発音、データ読み込み |
| `model.js` | 入力検証、検索、語源別・イディオム別グループ化 |
| `render.js` | XSS対策をした DOM 描画 |
| `data/entries.json` | **新版専用**の見出し語・例文・派生語・類義語の正本 |
| `roots-map.json` | 見出し語ID → 語源グループの明示的な対応 |
| `idioms.json` | 旧版から移行した補助イディオム集 |
| `validate.py` | JSONと参照関係の検査 |

## 単語を追加する手順

1. **新版だけを変更**する場合、`data/entries.json` の末尾に新しい見出し語を追加。各語の `id` は一意かつ安定させる。旧語の並び順とIDは維持する（章番号とリンク保全のため）。
2. `roots-map.json` に同じ `id` の語源グループ（例: `["duc-/duct-", "dūcere｜導く（ラテン語）"]`）を追加。確実でない場合は `["その他", "語源の分類を要確認"]` とする。
3. `python3 v2/validate.py` を実行。GitHub Actions でもデータとJS構文を自動検査する。
4. 新版の URL でキーワード、語源、イディオムの表示、目次、検索、発音、リンクを確認する。

手作業でHTMLの目次やリンクを書き換える必要はない。画面はJSONから自動生成される。単語データはHTMLとして直接挿入せず、`textContent` で表示する。

## コアイメージ図解（SVG）

- `data/entries.json` の各見出し語に、任意項目 `coreImage: {"src":"./images/core/<id>.svg","alt":"日本語で図の内容を説明"}` を指定する。
- SVG画像は `images/core/` 内に保存し、GitHub Pagesから相対URLで読み込む。
- 画像の有無にかかわらず、テキストのコアイメージ説明は常に表示する。SVGが読み込めない場合は画像表示だけを外す。
- スマートフォンでは画像をタップすると別タブで拡大できる。
- 初回実装：`bounce`, `hiatus`, `converge`, `divert`, `incorporate`。
- 2026-11-11 更新：上記5語に加え、`compensation`, `dilute`, `delegate`, `flock to`, `subside`, `circle back`, `ulterior`, `permissible`, `speculation`, `pave`, `prominent`, `preside`, `malfunction`, `infrared`, `apparent`, `transparent`, `prevail`, `compromise`, `disruption`, `reduce`, `preserve`, `compression`, `erosion`, `anticipate`, `pursue`, `induct`, `amendment` を追加。合計32語。
- `validate.py` はSVGパス、実ファイルの存在、XMLの正しい形式、代替テキストの有無を確認する。

## リンク

- キーワード別の見出し語: `#word=hiatus`
- 関連語: `#word=hiatus&focus=hiatal`
- 語源グループ: `#root=hia-%2Fhiat-`
- イディオム動詞グループ: `#idiom=turn`

## 既知の制限

- 語源は旧版の対応表を基にした暫定分類。新規分類は必ず確認する。
- 旧版の全ての独自HTML装飾・文法補足・詳細比較表が完全移行できたわけではない。見出し語、主要なJSON項目、関連語リンクを優先して移行した。
- 音声は端末・ブラウザの Web Speech API に依存するため、端末によって声質や再生の可否が異なる。
- GitHubに保存されたことと、GitHub Pagesでの反映・iPhone実機での動作確認は別の確認工程とする。
