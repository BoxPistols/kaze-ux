/**
 * ジオコーディングサービス
 *
 * 曖昧なキーワードから座標を取得するためのサービス
 * - Fuse.jsによるローカルファジー検索
 * - 国土地理院APIによる住所検索（無料）
 */

import Fuse from 'fuse.js'

// 検索結果の型
export interface GeocodingResult {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  type: LocationType
  score: number // 0-1 の信頼度スコア
  source: 'local' | 'gsi' // データソース
}

// 地点種別
export type LocationType =
  | 'airport'
  | 'heliport'
  | 'station'
  | 'landmark'
  | 'government'
  | 'river'
  | 'coast'
  | 'port'
  | 'bridge'
  | 'highway'
  | 'power_plant'
  | 'industrial'
  | 'drone_field'
  | 'drone_school'
  | 'city'
  | 'town'
  | 'address'
  | 'imperial'
  | 'other'

// ローカルデータベースのエントリ型
interface LocationEntry {
  id: string
  name: string
  aliases: string[] // 別名、読み仮名、略称
  address: string
  latitude: number
  longitude: number
  type: LocationType
  importance: number // 重要度（0-10）
}

// 国土地理院APIのレスポンス型
interface GSISearchResult {
  geometry: {
    coordinates: [number, number] // [lng, lat]
    type: string
  }
  type: string
  properties: {
    addressCode: string
    title: string
  }
}

/**
 * ローカル地点データベース
 * ドローン飛行に関連する主要な地点を登録
 */
const LOCAL_DATABASE: LocationEntry[] = [
  // === 空港 ===
  {
    id: 'NRT',
    name: '成田国際空港',
    aliases: ['成田空港', 'なりた', 'Narita', 'NRT', '新東京国際空港'],
    address: '千葉県成田市古込1-1',
    latitude: 35.7647,
    longitude: 140.3864,
    type: 'airport',
    importance: 10,
  },
  {
    id: 'HND',
    name: '東京国際空港',
    aliases: ['羽田空港', 'はねだ', 'Haneda', 'HND', '羽田'],
    address: '東京都大田区羽田空港',
    latitude: 35.5494,
    longitude: 139.7798,
    type: 'airport',
    importance: 10,
  },
  {
    id: 'KIX',
    name: '関西国際空港',
    aliases: ['関空', 'かんくう', 'Kansai', 'KIX'],
    address: '大阪府泉佐野市泉州空港北1',
    latitude: 34.4347,
    longitude: 135.2441,
    type: 'airport',
    importance: 10,
  },
  {
    id: 'ITM',
    name: '大阪国際空港',
    aliases: ['伊丹空港', 'いたみ', 'Itami', 'ITM'],
    address: '大阪府豊中市螢池西町3-555',
    latitude: 34.7855,
    longitude: 135.438,
    type: 'airport',
    importance: 9,
  },
  {
    id: 'NGO',
    name: '中部国際空港',
    aliases: ['セントレア', 'Centrair', 'NGO', 'ちゅうぶ'],
    address: '愛知県常滑市セントレア1-1',
    latitude: 34.8584,
    longitude: 136.8125,
    type: 'airport',
    importance: 9,
  },
  {
    id: 'CTS',
    name: '新千歳空港',
    aliases: ['千歳空港', 'ちとせ', 'Chitose', 'CTS'],
    address: '北海道千歳市美々',
    latitude: 42.7752,
    longitude: 141.6924,
    type: 'airport',
    importance: 9,
  },
  {
    id: 'FUK',
    name: '福岡空港',
    aliases: ['ふくおか', 'Fukuoka', 'FUK'],
    address: '福岡県福岡市博多区下臼井',
    latitude: 33.5859,
    longitude: 130.4513,
    type: 'airport',
    importance: 9,
  },
  {
    id: 'RJTA',
    name: '厚木飛行場',
    aliases: ['厚木基地', 'あつぎ', 'Atsugi'],
    address: '神奈川県綾瀬市',
    latitude: 35.4547,
    longitude: 139.4506,
    type: 'airport',
    importance: 8,
  },
  {
    id: 'RJTY',
    name: '横田飛行場',
    aliases: ['横田基地', 'よこた', 'Yokota'],
    address: '東京都福生市',
    latitude: 35.7485,
    longitude: 139.3489,
    type: 'airport',
    importance: 8,
  },
  {
    id: 'RJTF',
    name: '調布飛行場',
    aliases: ['ちょうふ', 'Chofu'],
    address: '東京都調布市西町',
    latitude: 35.6717,
    longitude: 139.5289,
    type: 'airport',
    importance: 7,
  },

  // === ヘリポート ===
  {
    id: 'TOKYO_HELIPORT',
    name: '東京ヘリポート',
    aliases: ['新木場ヘリポート', 'しんきば'],
    address: '東京都江東区新木場4-7-28',
    latitude: 35.6361,
    longitude: 139.8286,
    type: 'heliport',
    importance: 8,
  },
  {
    id: 'YOKOHAMA_HELIPORT',
    name: '横浜ヘリポート',
    aliases: ['よこはま'],
    address: '神奈川県横浜市中区山下町',
    latitude: 35.4436,
    longitude: 139.6517,
    type: 'heliport',
    importance: 7,
  },
  {
    id: 'OSAKA_HELIPORT',
    name: '大阪ヘリポート',
    aliases: ['おおさか', '八尾ヘリポート'],
    address: '大阪府八尾市空港2-12',
    latitude: 34.5961,
    longitude: 135.6028,
    type: 'heliport',
    importance: 7,
  },

  // === 主要駅 ===
  {
    id: 'TOKYO_STA',
    name: '東京駅',
    aliases: ['とうきょうえき', 'Tokyo Station'],
    address: '東京都千代田区丸の内1丁目',
    latitude: 35.6812,
    longitude: 139.7671,
    type: 'station',
    importance: 10,
  },
  {
    id: 'SHINAGAWA_STA',
    name: '品川駅',
    aliases: ['しながわえき', 'Shinagawa'],
    address: '東京都港区高輪3丁目',
    latitude: 35.6284,
    longitude: 139.7387,
    type: 'station',
    importance: 8,
  },
  {
    id: 'SHIBUYA_STA',
    name: '渋谷駅',
    aliases: ['しぶやえき', 'Shibuya'],
    address: '東京都渋谷区道玄坂1丁目',
    latitude: 35.658,
    longitude: 139.7016,
    type: 'station',
    importance: 8,
  },
  {
    id: 'SHINJUKU_STA',
    name: '新宿駅',
    aliases: ['しんじゅくえき', 'Shinjuku'],
    address: '東京都新宿区新宿3丁目',
    latitude: 35.6896,
    longitude: 139.7006,
    type: 'station',
    importance: 9,
  },
  {
    id: 'OSAKA_STA',
    name: '大阪駅',
    aliases: ['おおさかえき', 'Osaka Station', '梅田'],
    address: '大阪府大阪市北区梅田3丁目',
    latitude: 34.7024,
    longitude: 135.4959,
    type: 'station',
    importance: 9,
  },
  {
    id: 'NAGOYA_STA',
    name: '名古屋駅',
    aliases: ['なごやえき', 'Nagoya Station'],
    address: '愛知県名古屋市中村区名駅1丁目',
    latitude: 35.1709,
    longitude: 136.8815,
    type: 'station',
    importance: 9,
  },

  // === ランドマーク ===
  {
    id: 'TOKYO_TOWER',
    name: '東京タワー',
    aliases: ['とうきょうタワー', 'Tokyo Tower'],
    address: '東京都港区芝公園4-2-8',
    latitude: 35.6586,
    longitude: 139.7454,
    type: 'landmark',
    importance: 9,
  },
  {
    id: 'SKYTREE',
    name: '東京スカイツリー',
    aliases: ['スカイツリー', 'Skytree', 'すかいつりー'],
    address: '東京都墨田区押上1-1-2',
    latitude: 35.7101,
    longitude: 139.8107,
    type: 'landmark',
    importance: 9,
  },
  {
    id: 'LANDMARK_TOWER',
    name: '横浜ランドマークタワー',
    aliases: ['ランドマークタワー', 'みなとみらい'],
    address: '神奈川県横浜市西区みなとみらい2-2-1',
    latitude: 35.4556,
    longitude: 139.6312,
    type: 'landmark',
    importance: 8,
  },

  // === 政府・重要施設（飛行禁止区域参考） ===
  {
    id: 'KOKKAI',
    name: '国会議事堂',
    aliases: ['こっかい', 'Diet Building'],
    address: '東京都千代田区永田町1-7-1',
    latitude: 35.6762,
    longitude: 139.745,
    type: 'government',
    importance: 10,
  },
  {
    id: 'KANTEI',
    name: '首相官邸',
    aliases: ['かんてい', 'Prime Minister'],
    address: '東京都千代田区永田町2-3-1',
    latitude: 35.6739,
    longitude: 139.7467,
    type: 'government',
    importance: 10,
  },
  {
    id: 'KOKYO',
    name: '皇居',
    aliases: ['こうきょ', 'Imperial Palace'],
    address: '東京都千代田区千代田1-1',
    latitude: 35.6852,
    longitude: 139.7528,
    type: 'imperial',
    importance: 10,
  },

  // === 河川敷 ===
  {
    id: 'TAMAGAWA',
    name: '多摩川河川敷',
    aliases: ['たまがわ', '二子玉川', 'Tamagawa'],
    address: '東京都世田谷区玉川',
    latitude: 35.6116,
    longitude: 139.6267,
    type: 'river',
    importance: 6,
  },
  {
    id: 'ARAKAWA',
    name: '荒川河川敷',
    aliases: ['あらかわ', 'Arakawa'],
    address: '埼玉県戸田市',
    latitude: 35.8156,
    longitude: 139.6789,
    type: 'river',
    importance: 6,
  },
  {
    id: 'EDOGAWA',
    name: '江戸川河川敷',
    aliases: ['えどがわ', 'Edogawa'],
    address: '千葉県市川市',
    latitude: 35.7289,
    longitude: 139.9156,
    type: 'river',
    importance: 6,
  },
  {
    id: 'TONEGAWA',
    name: '利根川河川敷',
    aliases: ['とねがわ', 'Tonegawa'],
    address: '茨城県取手市',
    latitude: 35.9123,
    longitude: 140.0567,
    type: 'river',
    importance: 6,
  },

  // === 橋梁 ===
  {
    id: 'RAINBOW',
    name: 'レインボーブリッジ',
    aliases: ['Rainbow Bridge'],
    address: '東京都港区芝浦',
    latitude: 35.6378,
    longitude: 139.7634,
    type: 'bridge',
    importance: 7,
  },
  {
    id: 'BAY_BRIDGE',
    name: '横浜ベイブリッジ',
    aliases: ['Bay Bridge'],
    address: '神奈川県横浜市中区',
    latitude: 35.4589,
    longitude: 139.6712,
    type: 'bridge',
    importance: 7,
  },
  {
    id: 'GATE_BRIDGE',
    name: '東京ゲートブリッジ',
    aliases: ['Gate Bridge', '恐竜橋'],
    address: '東京都江東区',
    latitude: 35.6056,
    longitude: 139.8389,
    type: 'bridge',
    importance: 6,
  },

  // === ドローン関連施設 ===
  {
    id: 'DJI_ARENA',
    name: 'DJIアリーナ東京',
    aliases: ['DJI Arena', 'DJIありーな'],
    address: '東京都葛飾区',
    latitude: 35.7467,
    longitude: 139.8523,
    type: 'drone_field',
    importance: 5,
  },
  {
    id: 'JUAVAC',
    name: 'JUAVAC東京校',
    aliases: ['ジュアバック', 'JUAVAC'],
    address: '東京都江東区',
    latitude: 35.6534,
    longitude: 139.8012,
    type: 'drone_school',
    importance: 5,
  },

  // === 工業地帯 ===
  {
    id: 'KAWASAKI_RINKAI',
    name: '川崎臨海部工業地帯',
    aliases: ['かわさきりんかい', '京浜工業地帯'],
    address: '神奈川県川崎市川崎区',
    latitude: 35.5234,
    longitude: 139.7689,
    type: 'industrial',
    importance: 6,
  },
  {
    id: 'CHIBA_COMBINAT',
    name: '千葉コンビナート',
    aliases: ['ちばコンビナート', '京葉工業地帯'],
    address: '千葉県市原市',
    latitude: 35.4567,
    longitude: 140.0789,
    type: 'industrial',
    importance: 6,
  },
]

/**
 * テキストを正規化（ひらがな変換、全角→半角、不要文字除去）
 */
const normalizeText = (text: string): string => {
  let normalized = text.toLowerCase()

  // 全角英数字→半角
  normalized = normalized.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) =>
    String.fromCharCode(s.charCodeAt(0) - 0xfee0)
  )

  // カタカナ→ひらがな
  normalized = normalized.replace(/[\u30A1-\u30F6]/g, (s) =>
    String.fromCharCode(s.charCodeAt(0) - 0x60)
  )

  // 長音記号を統一
  normalized = normalized.replace(/[ーｰ−]/g, 'ー')

  return normalized.trim()
}

/**
 * Fuse.js検索オプション
 */
const fuseOptions: Fuse.IFuseOptions<LocationEntry> = {
  keys: [
    { name: 'name', weight: 1.0 },
    { name: 'aliases', weight: 0.9 },
    { name: 'address', weight: 0.5 },
  ],
  threshold: 0.4, // 曖昧さの許容度（0=完全一致のみ、1=全て一致）
  includeScore: true,
  minMatchCharLength: 2,
  ignoreLocation: true, // 文字位置を無視（部分一致を改善）
  findAllMatches: true,
}

// Fuse.jsインスタンス（遅延初期化）
let fuseInstance: Fuse<LocationEntry> | null = null

const getFuseInstance = (): Fuse<LocationEntry> => {
  if (!fuseInstance) {
    fuseInstance = new Fuse(LOCAL_DATABASE, fuseOptions)
  }
  return fuseInstance
}

/**
 * ローカルデータベースでファジー検索
 */
const searchLocal = (query: string): GeocodingResult[] => {
  const fuse = getFuseInstance()
  const normalizedQuery = normalizeText(query)

  const results = fuse.search(normalizedQuery)

  return results.slice(0, 10).map((result) => ({
    id: result.item.id,
    name: result.item.name,
    address: result.item.address,
    latitude: result.item.latitude,
    longitude: result.item.longitude,
    type: result.item.type,
    // Fuse.jsのスコアは0（完全一致）〜1（一致しない）なので反転
    score: result.score !== undefined ? 1 - result.score : 0.5,
    source: 'local' as const,
  }))
}

/**
 * 国土地理院API（住所検索）を呼び出す
 * https://msearch.gsi.go.jp/address-search/AddressSearch
 * 無料・商用利用可・API Key不要
 */
const searchGSI = async (query: string): Promise<GeocodingResult[]> => {
  try {
    const url = `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(query)}`
    const response = await fetch(url)

    if (!response.ok) {
      console.warn('GSI API error:', response.status)
      return []
    }

    const data: GSISearchResult[] = await response.json()

    return data.slice(0, 5).map((item, index) => ({
      id: `gsi-${index}-${Date.now()}`,
      name: item.properties.title,
      address: item.properties.title,
      latitude: item.geometry.coordinates[1], // GSIは[lng, lat]順
      longitude: item.geometry.coordinates[0],
      type: 'address' as LocationType,
      score: 0.8 - index * 0.1, // 順位に応じてスコア調整
      source: 'gsi' as const,
    }))
  } catch (error) {
    console.warn('GSI API fetch error:', error)
    return []
  }
}

/**
 * 重複を除去してマージ
 */
const mergeResults = (
  localResults: GeocodingResult[],
  gsiResults: GeocodingResult[]
): GeocodingResult[] => {
  const merged: GeocodingResult[] = [...localResults]
  const coordThreshold = 0.005 // 約500m以内は同一地点とみなす

  for (const gsiResult of gsiResults) {
    const isDuplicate = merged.some(
      (local) =>
        Math.abs(local.latitude - gsiResult.latitude) < coordThreshold &&
        Math.abs(local.longitude - gsiResult.longitude) < coordThreshold
    )

    if (!isDuplicate) {
      // GSI結果はローカルより若干低いスコアに調整
      merged.push({
        ...gsiResult,
        score: gsiResult.score * 0.85,
      })
    }
  }

  // スコア順にソート
  return merged.sort((a, b) => b.score - a.score)
}

/**
 * ジオコーディング検索（メインAPI）
 *
 * @param query - 検索クエリ（地名、住所、施設名など）
 * @param options - 検索オプション
 * @returns 検索結果の配列
 */
export const geocodeSearch = async (
  query: string,
  options: {
    useGSI?: boolean // 国土地理院APIを使用するか（デフォルト: true）
    maxResults?: number // 最大結果数（デフォルト: 10）
  } = {}
): Promise<GeocodingResult[]> => {
  const { useGSI = true, maxResults = 10 } = options

  if (!query || query.trim().length < 2) {
    return []
  }

  // ローカル検索（即座に実行）
  const localResults = searchLocal(query)

  // GSI検索（オプション）
  let gsiResults: GeocodingResult[] = []
  if (useGSI) {
    gsiResults = await searchGSI(query)
  }

  // マージして返す
  const merged = mergeResults(localResults, gsiResults)
  return merged.slice(0, maxResults)
}

/**
 * ローカル検索のみ（同期版、高速）
 */
export const geocodeSearchLocal = (
  query: string,
  maxResults: number = 10
): GeocodingResult[] => {
  if (!query || query.trim().length < 2) {
    return []
  }
  return searchLocal(query).slice(0, maxResults)
}

/**
 * 地点タイプの日本語ラベルを取得
 */
export const getLocationTypeLabel = (type: LocationType): string => {
  const labels: Record<LocationType, string> = {
    airport: '空港',
    heliport: 'ヘリポート',
    station: '駅',
    landmark: 'ランドマーク',
    government: '政府機関',
    river: '河川',
    coast: '海岸',
    port: '港',
    bridge: '橋梁',
    highway: '高速道路',
    power_plant: '発電所',
    industrial: '工業地帯',
    drone_field: 'ドローン飛行場',
    drone_school: 'ドローンスクール',
    city: '市区町村',
    town: '町村',
    address: '住所',
    imperial: '皇室関連',
    other: 'その他',
  }
  return labels[type] || 'その他'
}

/**
 * 地点タイプのアイコン色を取得
 */
export const getLocationTypeColor = (
  type: LocationType
): 'error' | 'warning' | 'info' | 'success' | 'default' => {
  switch (type) {
    case 'airport':
    case 'heliport':
      return 'error' // 飛行制限関連
    case 'government':
    case 'imperial':
      return 'error' // 飛行禁止関連
    case 'drone_field':
    case 'drone_school':
      return 'success' // ドローン関連
    case 'river':
    case 'coast':
      return 'info' // 自然
    default:
      return 'default'
  }
}
