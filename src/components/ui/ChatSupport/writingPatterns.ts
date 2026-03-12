// ---------------------------------------------------------------------------
// 日本語テクニカルライティング パターン集
// ---------------------------------------------------------------------------
// このファイルはChatSupportのAI回答品質の参照ドキュメントです。
// システムプロンプトには模範回答(few-shot)を配置し、
// 詳細パターンはこのファイルで管理します。
// 将来的にRAGやコンテキスト注入で活用可能です。
//
// カテゴリ:
//   A. 冗語・冗長表現 (Redundancy)
//   B. 曖昧表現 (Ambiguity)
//   C. LLM特有の悪癖 (AI Anti-patterns)
//   D. 文法・構文 (Grammar & Syntax)
//   E. 論理構造 (Logic & Structure)
//   F. 表記・表現統一 (Notation & Consistency)
//   G. 対話品質 (Dialogue Quality)
//   H. 技術文書特有 (Technical Writing)
// ---------------------------------------------------------------------------

export interface WritingPattern {
  id: string
  category: string
  subcategory: string
  bad: string
  good: string
  reason: string
}

// ---------------------------------------------------------------------------
// A. 冗語・冗長表現 (Redundancy)
// ---------------------------------------------------------------------------

export const REDUNDANCY_PATTERNS: WritingPattern[] = [
  // A1. 重言（同じ意味の重複）
  {
    id: 'A1-01',
    category: '冗語',
    subcategory: '重言',
    bad: 'まず最初に',
    good: 'まず',
    reason: '「まず」に「最初」の意味が含まれる',
  },
  {
    id: 'A1-02',
    category: '冗語',
    subcategory: '重言',
    bad: '一番最後に',
    good: '最後に',
    reason: '「最後」に「一番」の意味が含まれる',
  },
  {
    id: 'A1-03',
    category: '冗語',
    subcategory: '重言',
    bad: 'あらかじめ事前に',
    good: 'あらかじめ',
    reason: '同義の重複',
  },
  {
    id: 'A1-04',
    category: '冗語',
    subcategory: '重言',
    bad: '後で後悔する',
    good: '後悔する',
    reason: '「後悔」に「後で」の意味が含まれる',
  },
  {
    id: 'A1-05',
    category: '冗語',
    subcategory: '重言',
    bad: '各々それぞれ',
    good: 'それぞれ',
    reason: '同義の重複',
  },
  {
    id: 'A1-06',
    category: '冗語',
    subcategory: '重言',
    bad: '必ず必要です',
    good: '必要です',
    reason: '「必要」に「必ず」の意味が含まれる',
  },
  {
    id: 'A1-07',
    category: '冗語',
    subcategory: '重言',
    bad: '約〜ほど',
    good: '約〜',
    reason: '「約」と「ほど」が同義',
  },
  {
    id: 'A1-08',
    category: '冗語',
    subcategory: '重言',
    bad: 'すべて全部',
    good: 'すべて',
    reason: '同義の重複',
  },

  // A2. 冗長な動詞表現
  {
    id: 'A2-01',
    category: '冗語',
    subcategory: '冗長動詞',
    bad: '〜することができます',
    good: '〜できます',
    reason: '「する+ことができる」は「できる」で十分',
  },
  {
    id: 'A2-02',
    category: '冗語',
    subcategory: '冗長動詞',
    bad: '〜を行います',
    good: '〜します',
    reason: '「行う」は「する」で十分',
  },
  {
    id: 'A2-03',
    category: '冗語',
    subcategory: '冗長動詞',
    bad: '〜を実施します',
    good: '〜します',
    reason: '技術文書では簡潔に',
  },
  {
    id: 'A2-04',
    category: '冗語',
    subcategory: '冗長動詞',
    bad: '〜という形になります',
    good: '〜です',
    reason: '「という形になる」は「である」で十分',
  },
  {
    id: 'A2-05',
    category: '冗語',
    subcategory: '冗長動詞',
    bad: '〜を活用していく',
    good: '〜を使う',
    reason: '「活用していく」は「使う」で十分',
  },
  {
    id: 'A2-06',
    category: '冗語',
    subcategory: '冗長動詞',
    bad: '〜が存在します',
    good: '〜があります',
    reason: '技術文書では簡潔に',
  },
  {
    id: 'A2-07',
    category: '冗語',
    subcategory: '冗長動詞',
    bad: '〜の設定を行う',
    good: '〜を設定する',
    reason: '「の設定を行う」→「を設定する」',
  },
  {
    id: 'A2-08',
    category: '冗語',
    subcategory: '冗長動詞',
    bad: '〜という点があります',
    good: '〜です',
    reason: '回りくどい表現',
  },

  // A3. 冗長な修飾・接続
  {
    id: 'A3-01',
    category: '冗語',
    subcategory: '冗長修飾',
    bad: '〜に関してですが',
    good: '（削除して本題へ）',
    reason: '前置きとして不要',
  },
  {
    id: 'A3-02',
    category: '冗語',
    subcategory: '冗長修飾',
    bad: '〜についてなのですが',
    good: '（削除して本題へ）',
    reason: '前置きとして不要',
  },
  {
    id: 'A3-03',
    category: '冗語',
    subcategory: '冗長修飾',
    bad: '〜ということになります',
    good: '〜です',
    reason: '回りくどい表現',
  },
  {
    id: 'A3-04',
    category: '冗語',
    subcategory: '冗長修飾',
    bad: '〜といった感じです',
    good: '〜です',
    reason: '「感じ」は曖昧',
  },
  {
    id: 'A3-05',
    category: '冗語',
    subcategory: '冗長修飾',
    bad: '〜させていただきます',
    good: '〜します',
    reason: '過剰敬語',
  },
  {
    id: 'A3-06',
    category: '冗語',
    subcategory: '冗長修飾',
    bad: '〜のほうを',
    good: '〜を',
    reason: '「のほう」は不要',
  },
  {
    id: 'A3-07',
    category: '冗語',
    subcategory: '冗長修飾',
    bad: '現時点においては',
    good: '現在は',
    reason: '簡潔に',
  },
  {
    id: 'A3-08',
    category: '冗語',
    subcategory: '冗長修飾',
    bad: '〜的な観点から',
    good: '〜の観点から',
    reason: '「的な」は曖昧',
  },
]

// ---------------------------------------------------------------------------
// B. 曖昧表現 (Ambiguity)
// ---------------------------------------------------------------------------

export const AMBIGUITY_PATTERNS: WritingPattern[] = [
  // B1. 逃げ表現（具体性を避ける）
  {
    id: 'B1-01',
    category: '曖昧',
    subcategory: '逃げ表現',
    bad: '基本的に〜です',
    good: '〜です（例外: Xの場合はY）',
    reason: '例外があるなら明示、なければ「基本的に」を削除',
  },
  {
    id: 'B1-02',
    category: '曖昧',
    subcategory: '逃げ表現',
    bad: '一般的に〜です',
    good: '〜です',
    reason: '技術文書では事実を断定する',
  },
  {
    id: 'B1-03',
    category: '曖昧',
    subcategory: '逃げ表現',
    bad: '通常は〜します',
    good: '〜してください（Xの場合はYしてください）',
    reason: '例外条件を明示',
  },
  {
    id: 'B1-04',
    category: '曖昧',
    subcategory: '逃げ表現',
    bad: '〜と思います',
    good: '〜です',
    reason: '技術文書では断定する',
  },
  {
    id: 'B1-05',
    category: '曖昧',
    subcategory: '逃げ表現',
    bad: '〜かもしれません',
    good: '〜です / 〜の可能性があります（条件: X）',
    reason: '条件を明示する',
  },
  {
    id: 'B1-06',
    category: '曖昧',
    subcategory: '逃げ表現',
    bad: 'おそらく〜でしょう',
    good: '〜です',
    reason: '確信がないなら調査して確認する',
  },

  // B2. 列挙の放棄
  {
    id: 'B2-01',
    category: '曖昧',
    subcategory: '列挙放棄',
    bad: '様々なコンポーネントがあります',
    good: 'Button, Card, Alert などのコンポーネントがあります',
    reason: '代表例を3つ挙げる',
  },
  {
    id: 'B2-02',
    category: '曖昧',
    subcategory: '列挙放棄',
    bad: 'いろいろな方法があります',
    good: '方法は3つあります: A, B, C',
    reason: '数と具体名を示す',
  },
  {
    id: 'B2-03',
    category: '曖昧',
    subcategory: '列挙放棄',
    bad: '〜等を設定します',
    good: '〜とYを設定します',
    reason: '「等」で省略せず列挙する',
  },
  {
    id: 'B2-04',
    category: '曖昧',
    subcategory: '列挙放棄',
    bad: '〜などが使えます',
    good: '〜とYとZが使えます',
    reason: '「など」で省略せず列挙する',
  },

  // B3. 数量・程度の曖昧さ
  {
    id: 'B3-01',
    category: '曖昧',
    subcategory: '数量曖昧',
    bad: 'ある程度の',
    good: '（具体値を示す）',
    reason: '「ある程度」は読者が判断できない',
  },
  {
    id: 'B3-02',
    category: '曖昧',
    subcategory: '数量曖昧',
    bad: 'それなりに',
    good: '（具体値を示す）',
    reason: '主観的すぎる',
  },
  {
    id: 'B3-03',
    category: '曖昧',
    subcategory: '数量曖昧',
    bad: 'かなりの',
    good: '（具体値を示す）',
    reason: '読者によって基準が異なる',
  },
  {
    id: 'B3-04',
    category: '曖昧',
    subcategory: '数量曖昧',
    bad: '適切に設定してください',
    good: 'size="small" を指定してください',
    reason: '何が「適切」か読者にはわからない',
  },
  {
    id: 'B3-05',
    category: '曖昧',
    subcategory: '数量曖昧',
    bad: '正しく設定してください',
    good: 'variant="contained" を指定してください',
    reason: '何が「正しい」か読者にはわからない',
  },
  {
    id: 'B3-06',
    category: '曖昧',
    subcategory: '数量曖昧',
    bad: '大きめの値',
    good: '24px以上の値',
    reason: '具体的な閾値を示す',
  },

  // B4. 指示語の曖昧さ
  {
    id: 'B4-01',
    category: '曖昧',
    subcategory: '指示語',
    bad: 'これを使います',
    good: 'sx propを使います',
    reason: '「これ」が何を指すか不明確',
  },
  {
    id: 'B4-02',
    category: '曖昧',
    subcategory: '指示語',
    bad: 'そのコンポーネント',
    good: 'Buttonコンポーネント',
    reason: '「その」より具体名',
  },
  {
    id: 'B4-03',
    category: '曖昧',
    subcategory: '指示語',
    bad: 'あの設定',
    good: 'theme.tsの設定',
    reason: '「あの」は対話で曖昧になりやすい',
  },
  {
    id: 'B4-04',
    category: '曖昧',
    subcategory: '指示語',
    bad: '先ほどの方法',
    good: 'createColorSetで定義する方法',
    reason: '具体名で参照する',
  },
]

// ---------------------------------------------------------------------------
// C. LLM特有の悪癖 (AI Anti-patterns)
// ---------------------------------------------------------------------------

export const AI_ANTIPATTERNS: WritingPattern[] = [
  // C1. 空約束（予告して中身なし）
  {
    id: 'C1-01',
    category: 'LLM悪癖',
    subcategory: '空約束',
    bad: '次に具体例を示します。',
    good: '（予告せず直接コードを書く）',
    reason: '「示します」と言って示さないのは裏切り',
  },
  {
    id: 'C1-02',
    category: 'LLM悪癖',
    subcategory: '空約束',
    bad: '以下に整理します。[URL]',
    good: '結論→コード例→「詳しくはURLを参照」',
    reason: 'URLは整理結果ではなく補足参照',
  },
  {
    id: 'C1-03',
    category: 'LLM悪癖',
    subcategory: '空約束',
    bad: 'コードで説明します。',
    good: '（直接コードを書く）',
    reason: '予告文は不要',
  },
  {
    id: 'C1-04',
    category: 'LLM悪癖',
    subcategory: '空約束',
    bad: '詳しく見ていきましょう。',
    good: '（直接詳細を書く）',
    reason: '誘導文は不要',
  },
  {
    id: 'C1-05',
    category: 'LLM悪癖',
    subcategory: '空約束',
    bad: 'ポイントをまとめます。',
    good: '（直接ポイントを書く）',
    reason: '予告不要、直接書け',
  },

  // C2. オウム返し・前置き
  {
    id: 'C2-01',
    category: 'LLM悪癖',
    subcategory: 'オウム返し',
    bad: '〜についてですね。',
    good: '（削除して直接回答）',
    reason: '質問の繰り返しは無意味',
  },
  {
    id: 'C2-02',
    category: 'LLM悪癖',
    subcategory: 'オウム返し',
    bad: '〜ということですね。',
    good: '（削除して直接回答）',
    reason: '確認は不要、直接答える',
  },
  {
    id: 'C2-03',
    category: 'LLM悪癖',
    subcategory: '前置き',
    bad: '良い質問ですね！',
    good: '（削除して直接回答）',
    reason: '評価は不要',
  },
  {
    id: 'C2-04',
    category: 'LLM悪癖',
    subcategory: '前置き',
    bad: 'お答えします。',
    good: '（削除して直接回答）',
    reason: '宣言不要、直接答える',
  },
  {
    id: 'C2-05',
    category: 'LLM悪癖',
    subcategory: '前置き',
    bad: 'はい、もちろんです！',
    good: '（削除して直接回答）',
    reason: '過剰な肯定は不要',
  },
  {
    id: 'C2-06',
    category: 'LLM悪癖',
    subcategory: '前置き',
    bad: 'ご質問ありがとうございます。',
    good: '（削除して直接回答）',
    reason: '社交辞令は不要',
  },

  // C3. 同義反復・水増し
  {
    id: 'C3-01',
    category: 'LLM悪癖',
    subcategory: '同義反復',
    bad: '重要なポイントは大切です',
    good: '（一方を削除）',
    reason: '「重要」と「大切」は同義',
  },
  {
    id: 'C3-02',
    category: 'LLM悪癖',
    subcategory: '水増し',
    bad: 'AはBです。つまりAとはBのことです。',
    good: 'AはBです。',
    reason: '同じことの言い換えで量を稼がない',
  },
  {
    id: 'C3-03',
    category: 'LLM悪癖',
    subcategory: '水増し',
    bad: '〜は非常に重要です。なぜなら〜が大切だからです。',
    good: '〜は重要です。理由はXです。',
    reason: '循環論法を避ける',
  },
  {
    id: 'C3-04',
    category: 'LLM悪癖',
    subcategory: '水増し',
    bad: 'まとめると、〜ということです。（冒頭と同じ内容）',
    good: '（まとめを削除）',
    reason: '短い回答に「まとめ」は不要',
  },

  // C4. 過剰な丁寧・謙譲
  {
    id: 'C4-01',
    category: 'LLM悪癖',
    subcategory: '過剰丁寧',
    bad: '〜させていただければと存じます',
    good: '〜してください',
    reason: '技術文書では簡潔に',
  },
  {
    id: 'C4-02',
    category: 'LLM悪癖',
    subcategory: '過剰丁寧',
    bad: 'もしよろしければ〜',
    good: '〜してください',
    reason: '提案ではなく指示する',
  },
  {
    id: 'C4-03',
    category: 'LLM悪癖',
    subcategory: '過剰丁寧',
    bad: '〜していただけますと幸いです',
    good: '〜してください',
    reason: '技術文書では直接的に',
  },
  {
    id: 'C4-04',
    category: 'LLM悪癖',
    subcategory: '過剰丁寧',
    bad: 'ご参考になれば幸いです',
    good: '（削除）',
    reason: '不要な締めくくり',
  },

  // C5. 幻覚・捏造
  {
    id: 'C5-01',
    category: 'LLM悪癖',
    subcategory: '幻覚',
    bad: '〜というAPIがあります（存在しない）',
    good: '公式ドキュメントを確認してください',
    reason: '存在しないAPIを捏造しない',
  },
  {
    id: 'C5-02',
    category: 'LLM悪癖',
    subcategory: '幻覚',
    bad: '〜というpropを設定します（存在しない）',
    good: '（正しいprop名を使う / 確認を促す）',
    reason: 'prop名を正確に書く',
  },
]

// ---------------------------------------------------------------------------
// D. 文法・構文 (Grammar & Syntax)
// ---------------------------------------------------------------------------

export const GRAMMAR_PATTERNS: WritingPattern[] = [
  // D1. ねじれ文（主述の不一致）
  {
    id: 'D1-01',
    category: '文法',
    subcategory: 'ねじれ文',
    bad: '特徴は、高速に動作します',
    good: '特徴は、高速に動作することです',
    reason: '「特徴は」→「〜ことです」で対応',
  },
  {
    id: 'D1-02',
    category: '文法',
    subcategory: 'ねじれ文',
    bad: '理由は、型安全性を保つためです',
    good: '型安全性を保つためです',
    reason: '「理由は〜ため」は重複。どちらかにする',
  },
  {
    id: 'D1-03',
    category: '文法',
    subcategory: 'ねじれ文',
    bad: '目的は、バグを防ぐために使います',
    good: '目的はバグの防止です / バグを防ぐために使います',
    reason: '主述を一致させる',
  },

  // D2. 係り受けの曖昧さ
  {
    id: 'D2-01',
    category: '文法',
    subcategory: '係り受け',
    bad: '新しいMUIのコンポーネント',
    good: 'MUIの新しいコンポーネント / 新しいMUIコンポーネント',
    reason: '「新しい」がMUIにかかるのかコンポーネントにかかるのか不明',
  },
  {
    id: 'D2-02',
    category: '文法',
    subcategory: '係り受け',
    bad: '赤い大きなボタン',
    good: '大きな赤いボタン',
    reason: '長い修飾語→短い修飾語の順に並べる',
  },

  // D3. 並列表現の不統一
  {
    id: 'D3-01',
    category: '文法',
    subcategory: '並列不統一',
    bad: '色の変更、フォントを大きくする、余白の調整',
    good: '色の変更、フォントの拡大、余白の調整',
    reason: '並列は品詞を統一する（すべて名詞句）',
  },
  {
    id: 'D3-02',
    category: '文法',
    subcategory: '並列不統一',
    bad: 'sxを使うか、classNameで設定します',
    good: 'sxを使うか、classNameを使います',
    reason: '並列は構文を統一する',
  },

  // D4. 助詞の誤用
  {
    id: 'D4-01',
    category: '文法',
    subcategory: '助詞',
    bad: '〜を設定を行う',
    good: '〜を設定する / 〜の設定を行う',
    reason: '「を」の重複',
  },
  {
    id: 'D4-02',
    category: '文法',
    subcategory: '助詞',
    bad: '性能がパフォーマンスが向上する',
    good: 'パフォーマンスが向上する',
    reason: '主語の重複',
  },
]

// ---------------------------------------------------------------------------
// E. 論理構造 (Logic & Structure)
// ---------------------------------------------------------------------------

export const LOGIC_PATTERNS: WritingPattern[] = [
  // E1. 回答構成
  {
    id: 'E1-01',
    category: '論理',
    subcategory: '構成',
    bad: '背景→理論→結論',
    good: '結論→理由→コード例→補足',
    reason: 'PREP法: 結論先行',
  },
  {
    id: 'E1-02',
    category: '論理',
    subcategory: '構成',
    bad: '長い前提説明→やっと回答',
    good: '回答→必要な補足',
    reason: '冒頭で質問に直接答える',
  },

  // E2. 論理の飛躍
  {
    id: 'E2-01',
    category: '論理',
    subcategory: '飛躍',
    bad: 'MUIを使います。したがってパフォーマンスが向上します。',
    good: 'MUIのTree Shakingにより、使用コンポーネントのみバンドルされるため、バンドルサイズが削減されます。',
    reason: '因果関係を具体的に示す',
  },
  {
    id: 'E2-02',
    category: '論理',
    subcategory: '飛躍',
    bad: 'React.FCは禁止です。TypeScriptを使ってください。',
    good: 'React.FCはジェネリック型の推論が壊れるため禁止です。代わりに通常の関数宣言にprops型を指定してください。',
    reason: '理由と代替策を明示する',
  },

  // E3. 比較の軸の統一
  {
    id: 'E3-01',
    category: '論理',
    subcategory: '比較軸',
    bad: 'Aは速い。Bは使いやすい。',
    good: '速度: A > B。使いやすさ: B > A。',
    reason: '同じ軸で比較する',
  },
]

// ---------------------------------------------------------------------------
// F. 表記・表現統一 (Notation & Consistency)
// ---------------------------------------------------------------------------

export const NOTATION_PATTERNS: WritingPattern[] = [
  // F1. 漢字の開き（ひらがなで書くべきもの）
  {
    id: 'F1-01',
    category: '表記',
    subcategory: '漢字開き',
    bad: '〜して頂く',
    good: '〜していただく',
    reason: '補助動詞はひらがな',
  },
  {
    id: 'F1-02',
    category: '表記',
    subcategory: '漢字開き',
    bad: '〜して下さい',
    good: '〜してください',
    reason: '補助動詞はひらがな',
  },
  {
    id: 'F1-03',
    category: '表記',
    subcategory: '漢字開き',
    bad: '〜する事',
    good: '〜すること',
    reason: '形式名詞はひらがな',
  },
  {
    id: 'F1-04',
    category: '表記',
    subcategory: '漢字開き',
    bad: '〜する為',
    good: '〜するため',
    reason: '接続詞的用法はひらがな',
  },
  {
    id: 'F1-05',
    category: '表記',
    subcategory: '漢字開き',
    bad: '〜の様に',
    good: '〜のように',
    reason: '比況の助動詞はひらがな',
  },
  {
    id: 'F1-06',
    category: '表記',
    subcategory: '漢字開き',
    bad: '出来る',
    good: 'できる',
    reason: '可能の意味ではひらがな',
  },
  {
    id: 'F1-07',
    category: '表記',
    subcategory: '漢字開き',
    bad: '〜と言う',
    good: '〜という',
    reason: '引用・例示の用法はひらがな',
  },
  {
    id: 'F1-08',
    category: '表記',
    subcategory: '漢字開き',
    bad: '予め',
    good: 'あらかじめ',
    reason: '読みにくい漢字はひらがな',
  },

  // F2. 用語統一
  {
    id: 'F2-01',
    category: '表記',
    subcategory: '用語統一',
    bad: '同じ回答内で「sx prop」と「sxプロパティ」を混在',
    good: '「sx prop」で統一',
    reason: '用語は1つに統一する',
  },
  {
    id: 'F2-02',
    category: '表記',
    subcategory: '用語統一',
    bad: '「コンポーネント」と「部品」を混在',
    good: '「コンポーネント」で統一',
    reason: '技術用語は原語を使う',
  },
  {
    id: 'F2-03',
    category: '表記',
    subcategory: '用語統一',
    bad: '「ダークモード」と「ダークテーマ」を混在',
    good: 'どちらかに統一',
    reason: '同じ概念は同じ名前で',
  },

  // F3. コードと日本語の境界
  {
    id: 'F3-01',
    category: '表記',
    subcategory: 'コード境界',
    bad: 'primaryカラーを使います',
    good: '`primary.main` カラーを使います',
    reason: 'コード値はバッククォートで囲む',
  },
  {
    id: 'F3-02',
    category: '表記',
    subcategory: 'コード境界',
    bad: 'useState hookを使います',
    good: '`useState` フックを使います',
    reason: 'API名はバッククォートで囲む',
  },
  {
    id: 'F3-03',
    category: '表記',
    subcategory: 'コード境界',
    bad: 'trueに設定します',
    good: '`true` に設定します',
    reason: 'リテラル値はバッククォートで囲む',
  },

  // F4. 句読点
  {
    id: 'F4-01',
    category: '表記',
    subcategory: '句読点',
    bad: '読点なしの長い文',
    good: '主語の後、条件節の後に読点を打つ',
    reason: '読点で意味の区切りを明示する',
  },
  {
    id: 'F4-02',
    category: '表記',
    subcategory: '句読点',
    bad: 'AでありBでありCです',
    good: 'Aであり、Bであり、Cです',
    reason: '並列には読点を入れる',
  },
]

// ---------------------------------------------------------------------------
// G. 対話品質 (Dialogue Quality)
// ---------------------------------------------------------------------------

export const DIALOGUE_PATTERNS: WritingPattern[] = [
  // G1. 質問タイプ別の応答構成
  {
    id: 'G1-01',
    category: '対話',
    subcategory: '応答型',
    bad: 'Howの質問にパラメータ一覧だけ',
    good: '手順を番号付きで示し、各手順にコード例',
    reason: 'Howには手順が必要',
  },
  {
    id: 'G1-02',
    category: '対話',
    subcategory: '応答型',
    bad: 'Whatの質問に手順を回答',
    good: '一文で定義→用途→コード例',
    reason: 'Whatには定義が必要',
  },
  {
    id: 'G1-03',
    category: '対話',
    subcategory: '応答型',
    bad: 'Whyの質問にやり方を回答',
    good: '理由を1文→背景→根拠',
    reason: 'Whyには理由が必要',
  },
  {
    id: 'G1-04',
    category: '対話',
    subcategory: '応答型',
    bad: 'Yes/No質問に長い説明から開始',
    good: 'Yes/Noを最初に→方法→コード例',
    reason: '結論を先に',
  },
  {
    id: 'G1-05',
    category: '対話',
    subcategory: '応答型',
    bad: '比較質問に一方だけ説明',
    good: '判断基準→比較表→両方のコード例',
    reason: '比較は軸を揃えて両方示す',
  },

  // G2. フォローアップ
  {
    id: 'G2-01',
    category: '対話',
    subcategory: 'フォロー',
    bad: '何か他にありますか？',
    good: '（不要。聞かれたら答える）',
    reason: '技術チャットでは不要な社交',
  },
  {
    id: 'G2-02',
    category: '対話',
    subcategory: 'フォロー',
    bad: 'お役に立てたら幸いです',
    good: '（不要）',
    reason: '締めの社交辞令は不要',
  },

  // G3. エラー・トラブルシュート対応
  {
    id: 'G3-01',
    category: '対話',
    subcategory: 'エラー対応',
    bad: 'エラーの原因は様々です',
    good: '原因はXです。Yを確認してください',
    reason: '具体的な原因と対処を示す',
  },
  {
    id: 'G3-02',
    category: '対話',
    subcategory: 'エラー対応',
    bad: '再インストールしてみてください',
    good: '`pnpm install` を実行してください。解決しない場合は `node_modules` を削除してから再実行してください',
    reason: '具体コマンドと段階的手順',
  },
]

// ---------------------------------------------------------------------------
// H. 技術文書特有 (Technical Writing)
// ---------------------------------------------------------------------------

export const TECHNICAL_PATTERNS: WritingPattern[] = [
  // H1. コード例の品質
  {
    id: 'H1-01',
    category: '技術文書',
    subcategory: 'コード品質',
    bad: 'import文なしのコード例',
    good: 'import文を含む完全なコード例',
    reason: 'コピペで動く形にする',
  },
  {
    id: 'H1-02',
    category: '技術文書',
    subcategory: 'コード品質',
    bad: '// ... 省略',
    good: '省略せず書く（短いコードの場合）',
    reason: '読者が補完できない省略はしない',
  },
  {
    id: 'H1-03',
    category: '技術文書',
    subcategory: 'コード品質',
    bad: 'コード例なしの手順説明',
    good: '各手順にコード例を添える',
    reason: '技術的な手順にはコードが必須',
  },

  // H2. ファイルパス・バージョン
  {
    id: 'H2-01',
    category: '技術文書',
    subcategory: 'パス表記',
    bad: 'テーマファイルを編集',
    good: '`src/themes/colorToken.ts` を編集',
    reason: '正確なファイルパスを示す',
  },
  {
    id: 'H2-02',
    category: '技術文書',
    subcategory: 'バージョン',
    bad: 'MUIの最新版を使う',
    good: 'MUI v7を使う',
    reason: 'バージョンを明示する',
  },

  // H3. NG/OK対比
  {
    id: 'H3-01',
    category: '技術文書',
    subcategory: '対比',
    bad: '良い方法だけ示す',
    good: 'NG例とOK例を両方示す（該当する場合）',
    reason: '対比で理解が深まる',
  },

  // H4. URL・リンク
  {
    id: 'H4-01',
    category: '技術文書',
    subcategory: 'URL',
    bad: '文中にURLを唐突に配置',
    good: '回答末尾に「詳しくはURLを参照してください」',
    reason: 'URLは補足参照として末尾に置く',
  },
  {
    id: 'H4-02',
    category: '技術文書',
    subcategory: 'URL',
    bad: 'URL直後に日本語（リンク切れ）',
    good: 'URL直後に半角スペース',
    reason: 'パーサーがURLの終端を誤認する',
  },
]

// ---------------------------------------------------------------------------
// 全パターン統合
// ---------------------------------------------------------------------------

export const ALL_WRITING_PATTERNS: WritingPattern[] = [
  ...REDUNDANCY_PATTERNS,
  ...AMBIGUITY_PATTERNS,
  ...AI_ANTIPATTERNS,
  ...GRAMMAR_PATTERNS,
  ...LOGIC_PATTERNS,
  ...NOTATION_PATTERNS,
  ...DIALOGUE_PATTERNS,
  ...TECHNICAL_PATTERNS,
]

/** パターン総数 */
export const PATTERN_COUNT = ALL_WRITING_PATTERNS.length

/** カテゴリ別にパターンを取得 */
export const getPatternsByCategory = (category: string): WritingPattern[] =>
  ALL_WRITING_PATTERNS.filter((p) => p.category === category)

/** サブカテゴリ別にパターンを取得 */
export const getPatternsBySubcategory = (
  subcategory: string
): WritingPattern[] =>
  ALL_WRITING_PATTERNS.filter((p) => p.subcategory === subcategory)
