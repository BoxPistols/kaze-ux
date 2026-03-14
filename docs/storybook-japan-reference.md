# Storybook / デザインシステム — 日本企業リファレンス集

## 公開 Storybook インスタンス

| 企業               | デザインシステム       | URL                                  | 確認 |
| ------------------ | ---------------------- | ------------------------------------ | ---- |
| SmartHR            | SmartHR UI             | <https://story.smarthr-ui.dev/>      | OK   |
| pixiv              | Charcoal               | <https://pixiv.github.io/charcoal/>  | OK   |
| freee              | Vibes                  | <https://vibes.freee.co.jp/>         | OK   |
| CyberAgent / Ameba | Spindle                | <https://spindle.ameba.design/>      | OK   |
| 三菱電機           | Serendie               | <https://storybook.serendie.design/> | OK   |
| デジタル庁         | デザインシステムベータ | <https://design.digital.go.jp/>      | OK   |
| GMOペパボ          | Inhouse                | <https://design.pepabo.com/inhouse/> | OK   |

## 社内 / 半公開で活用

| 企業             | 特徴                                              | 参考記事                                                          |
| ---------------- | ------------------------------------------------- | ----------------------------------------------------------------- |
| メルカリ         | CI自動ビルド → 社内公開。PM・デザイナーの共通言語 | <https://engineering.mercari.com/blog/entry/2019-08-26-090000/>   |
| LINEヤフー       | 3階層トークン。旧Yahoo「Riff」+ 旧LINE統合        | <https://techblog.yahoo.co.jp/entry/2021082530175149/>            |
| サイボウズ       | kintone DS。Chromatic VRT 先進事例                | <https://blog.cybozu.io/entry/2022/03/16/141935>                  |
| マネーフォワード | MFUI。MCP サーバー化で AI 連携                    | <https://zenn.dev/moneyforward/articles/43bcef16b033f8>           |
| 楽天             | ReX。独自 addon 公開。Vitest + VRT 統合           | <https://commerce-engineer.rakuten.careers/entry/en/tech/0062>    |
| Sansan           | One DS。Chromatic VRT + デザイナーレビュー        | <https://buildersbox.corp-sansan.com/entry/2025/01/27/130000>     |
| LayerX           | Story を MCP サーバー化して AI 支援               | <https://zenn.dev/layerx/articles/7e9f87fca65e94>                 |
| Ubie             | Ubie Vitals。MCP サーバー化で爆速化               | <https://zenn.dev/ubie_dev/articles/f927aaff02d618>               |
| ZOZO             | WEAR 10年目で DS 導入。新人オンボーディング活用   | <https://techblog.zozo.com/entry/wear-design-system-first>        |
| ラクスル         | kamii。freee / Ubie と合同勉強会                  | <https://note.com/raksuldesign/n/nd1b126c1f64e>                   |
| クックパッド     | Apron（3世代目）。写真素材表現までカバー          | <https://note.com/fjkn/n/nf73742ec925a>                           |
| KINTO            | Vue + Storybook。20カ国グローバル展開             | <https://blog.kinto-technologies.com/posts/2022_09_13_storybook/> |
| イタンジ         | ITANDI BB UI。テスト結果 Chip 表示                | <https://tech.itandi.co.jp/entry/2025/03/11/120616>               |
| グッドパッチ     | Sparkle Design。16PJ 実績、作業時間54%削減        | <https://goodpatch.com/blog/2025-06-sparkle-design-1>             |

## まとめ記事（メタリスト）

| タイトル                                                                 | URL                                           |
| ------------------------------------------------------------------------ | --------------------------------------------- |
| 【2025年版】コンポーネントが公開されている日本のデザインシステムまとめ   | <https://note.com/kerm/n/n583d691437fd>       |
| 公開されている日本企業のデザインシステムをまとめてみたよ（2025年更新版） | <https://note.com/tamagooo/n/n52fa3fb219ee>   |
| 日本・海外のデザインシステム総まとめ【56事例＋α】                        | <https://note.com/akane_desu/n/n2e564f6561b4> |

---

## Storybook 運用の課題・失敗事例

### Hacker News

| URL                                             | 要点                                                                           |
| ----------------------------------------------- | ------------------------------------------------------------------------------ |
| <https://news.ycombinator.com/item?id=39978875> | 「6社で導入→衰退→撤去を経験。もう二度と使わない」                              |
| <https://news.ycombinator.com/item?id=28493328> | 「heavy, complicated, awkward」「keeps breaking all the time」                 |
| <https://news.ycombinator.com/item?id=39696845> | 「Storybook外したらnode_modules 1GB減」「Dependabotアラートの大半がStorybook」 |
| <https://news.ycombinator.com/item?id=33675261> | 「一度セットアップしたら二度と触りたくない」                                   |
| <https://news.ycombinator.com/item?id=24132276> | 「Storybook公式サイト自体がCPU 100%」                                          |

### Reddit

| URL                                                          | 要点                                         |
| ------------------------------------------------------------ | -------------------------------------------- |
| <https://www.reddit.com/r/reactjs/comments/1f71lje/>         | 「セットアップ後、誰も使わなくなった」       |
| <https://www.reddit.com/r/Angular2/comments/1es9wg4/>        | 「アップデートのたびに何かが壊れる」         |
| <https://www.reddit.com/r/reactjs/comments/153uso8/>         | ROI 悪すぎて諦めたチーム                     |
| <https://www.reddit.com/r/reactjs/comments/1l2hm18/>         | 「Storybook のアップグレードにはもう疲れた」 |
| <https://www.reddit.com/r/reactjs/comments/14w73f9/>         | 重すぎて自作した人たちの議論                 |
| <https://www.reddit.com/r/ExperiencedDevs/comments/1l2dhal/> | 経験者コミュニティでのメンテ負担議論         |

### 日本語

| URL                                                                           | 要点                                         |
| ----------------------------------------------------------------------------- | -------------------------------------------- |
| <https://zenn.dev/m10maeda/articles/storybook-only-testing-dream>             | 「全テストを Storybook に → よくなかった」   |
| <https://zenn.dev/takumishimizu/articles/isolate-design-system-to-avoid-debt> | 「資産」→「負債」→ 完全放棄の過程            |
| <https://zenn.dev/yumemi_inc/articles/do-not-let-the-storybook-rot>           | ゆめみ「腐らせない」3つの腐敗原因            |
| <https://zenn.dev/ankd/articles/design-system-communication>                  | 1ヶ月見積もり大幅超過                        |
| <https://zenn.dev/jinjer_techblog/articles/df3f83c9383cb0>                    | 「絶妙に使いにくい」で失敗                   |
| <https://blog.cybozu.io/entry/2024/08/13/140000>                              | サイボウズ: CI 不安定で Storybook テスト縮小 |
| <https://note.com/platodesign/n/n7e32bd26492e>                                | 「失敗する会社の構造は最初から決まっている」 |

### 英語ブログ

| URL                                                                                                               | 要点                                |
| ----------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| <https://spin.atomicobject.com/using-storybook-reconsider/>                                                       | 複数 PJ で Storybook を剥がした経験 |
| <https://medium.com/blixtdunder/self-documenting-products-why-storybook-is-a-symptom-not-a-solution-264111ab6110> | 40個登録 / 23個実使用の乖離         |
