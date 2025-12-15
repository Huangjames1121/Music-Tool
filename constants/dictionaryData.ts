
// 本地音樂術語資料庫
// 參考來源：國家教育研究院學術名詞 及 常見音樂術語列表 (類似 GitHub wiwikuan/terms)
// 格式：Term (Original) / Term (Chinese)

const formatDefinition = (original: string, chinese: string, lang: string, def: string, app: string) => `**術語**：${original} / ${chinese}
**語言**：${lang}
**定義**：${def}
**演奏應用**：${app}`;

const DB: Record<string, string> = {
    // --- 速度術語 (Tempo) ---
    "largo": formatDefinition(
        "Largo", "廣板", "義大利文",
        "速度術語。意為寬廣地、莊嚴地。極慢速。",
        "演奏時需展現莊重、宏偉的氣勢。每個音符的時值要非常飽滿。"
    ),
    "larghetto": formatDefinition(
        "Larghetto", "甚廣板 / 小廣板", "義大利文",
        "速度術語。比 Largo 稍快一點，但仍屬於慢速。",
        "保留 Largo 的寬廣感，但流動性稍高，不要過於沉重。"
    ),
    "adagio": formatDefinition(
        "Adagio", "慢板", "義大利文",
        "速度術語。意為自在、從容、緩慢地。",
        "強調旋律的歌唱性（Cantabile）與延綿感，避免急促。"
    ),
    "andante": formatDefinition(
        "Andante", "行板", "義大利文",
        "速度術語。原意為「行走」，指像步行一樣自然的速度。",
        "保持穩定的律動感，像散步一樣的步伐，不宜過度拖延。"
    ),
    "andantino": formatDefinition(
        "Andantino", "小行板", "義大利文",
        "速度術語。通常指比 Andante 稍快一點（但有時在歷史上曾指稍慢）。",
        "演奏上通常比 Andante 更輕盈、流暢。"
    ),
    "moderato": formatDefinition(
        "Moderato", "中板", "義大利文",
        "速度術語。意為適度地、節制地。中庸的速度。",
        "速度要平穩適中，需展現穩定而有條理的性格。"
    ),
    "allegretto": formatDefinition(
        "Allegretto", "小快板", "義大利文",
        "速度術語。比 Allegro 稍慢，比 Moderato 快。",
        "通常帶有輕鬆、優雅或詼諧的性格，不像 Allegro 那麼衝。"
    ),
    "allegro": formatDefinition(
        "Allegro", "快板", "義大利文",
        "速度術語。意為快樂的、開朗的、快速的。",
        "演奏需輕快、流暢，展現活力與精神。"
    ),
    "vivace": formatDefinition(
        "Vivace", "甚快板 / 活潑地", "義大利文",
        "速度術語。意為充滿生機的、活潑的。",
        "強調節奏的彈性與重音的活力，需展現熱情。"
    ),
    "presto": formatDefinition(
        "Presto", "急板", "義大利文",
        "速度術語。意為急速的。",
        "技術上的挑戰，需保持極高的清晰度與準確性。"
    ),

    // --- 速度變化 (Modification) ---
    "ritardando": formatDefinition(
        "Ritardando (rit.)", "漸慢", "義大利文",
        "速度術語。意為延遲、放慢。",
        "通常用於樂句結尾，需自然地煞車，要有呼吸感。"
    ),
    "rallentando": formatDefinition(
        "Rallentando (rall.)", "漸慢", "義大利文",
        "速度術語。與 Ritardando 相似，指逐漸放慢。",
        "通常暗示著放鬆、消失的感覺。"
    ),
    "accelerando": formatDefinition(
        "Accelerando (accel.)", "漸快", "義大利文",
        "速度術語。意為加速。",
        "需帶動情緒的推升，通常伴隨著能量增加。"
    ),
    "rubato": formatDefinition(
        "Rubato", "彈性速度", "義大利文",
        "原意為「被偷走的時間」。指自由伸縮拍子。",
        "伴奏保持穩定，旋律自由伸縮，展現個人風格。"
    ),
    "a tempo": formatDefinition(
        "A tempo", "回原速", "義大利文",
        "速度術語。回到原本的速度。",
        "需精確地回到速度變化之前的脈動。"
    ),

    // --- 表情與風格 (Expression & Mood) ---
    "agitato": formatDefinition(
        "Agitato", "激動地", "義大利文",
        "表情術語。意為焦慮、激動、不安。",
        "演奏時速度可能會稍不穩定，帶有衝動感。"
    ),
    "animato": formatDefinition(
        "Animato", "生動地 / 有精神地", "義大利文",
        "表情術語。意為賦予靈魂。",
        "通常速度會稍快，觸鍵或運弓要更有彈性與活力。"
    ),
    "brillante": formatDefinition(
        "Brillante", "華麗地 / 輝煌地", "義大利文",
        "表情術語。意為閃耀的。",
        "強調音色的明亮度與技巧的炫耀感。"
    ),
    "cantabile": formatDefinition(
        "Cantabile", "如歌地", "義大利文",
        "表情術語。意為像唱歌一樣。",
        "強調旋律線條的連貫與優美，模仿人聲的呼吸與抑揚頓挫。"
    ),
    "dolce": formatDefinition(
        "Dolce", "溫柔地 / 甜蜜地", "義大利文",
        "表情術語。意為甜美的。",
        "觸鍵需輕柔，音色圓潤，避免尖銳。"
    ),
    "espressivo": formatDefinition(
        "Espressivo (espr.)", "富於表情地", "義大利文",
        "表情術語。意為表達情感。",
        "通常暗示可以使用更多的 Vibrato（抖音）或 Rubato（彈性速度）。"
    ),
    "grazioso": formatDefinition(
        "Grazioso", "優雅地", "義大利文",
        "表情術語。意為優美的、高雅的。",
        "節奏要輕盈，避免粗魯的重音。"
    ),
    "maestoso": formatDefinition(
        "Maestoso", "莊嚴地 / 雄偉地", "義大利文",
        "表情術語。意為莊嚴的。",
        "速度通常較慢，聲音飽滿厚實，富有權威感。"
    ),
    "misterioso": formatDefinition(
        "Misterioso", "神祕地", "義大利文",
        "表情術語。意為神祕的。",
        "通常音量較弱，觸鍵模糊或斷奏，營造懸疑氛圍。"
    ),
    "scherzando": formatDefinition(
        "Scherzando", "詼諧地 / 開玩笑地", "義大利文",
        "表情術語。源自 Scherzo（詼諧曲）。",
        "演奏需輕快、幽默，常帶有斷奏或突強。"
    ),
    "sostenuto": formatDefinition(
        "Sostenuto", "持續地 / 保持地", "義大利文",
        "表情/速度術語。意為支撐。",
        "音符時值要保持到滿，甚至稍慢，強調樂句的綿延。"
    ),
    "tranquillo": formatDefinition(
        "Tranquillo", "寧靜地", "義大利文",
        "表情術語。意為安靜、平和。",
        "速度穩定，音量偏弱，避免情緒的大幅波動。"
    ),

    // --- 力度 (Dynamics) ---
    "piano": formatDefinition("Piano (p)", "弱", "義大利文", "力度術語。輕柔。", "保持核心與穿透力，控制觸鍵深度。"),
    "forte": formatDefinition("Forte (f)", "強", "義大利文", "力度術語。強有力。", "運用重量而非蠻力，追求飽滿共鳴。"),
    "crescendo": formatDefinition("Crescendo (cresc.)", "漸強", "義大利文", "聲音逐漸增強。", "需規劃層次，逐步累積能量。"),
    "diminuendo": formatDefinition("Diminuendo (dim.)", "漸弱", "義大利文", "聲音逐漸減弱。", "保持音準與支撐，避免音色扁平。"),
    "sfz": formatDefinition("Sforzando (sfz)", "突強", "義大利文", "對單個音符的突然加強。", "需有爆發力，隨後通常立即回到原本力度。"),

    // --- 演奏法 (Articulation/Technique) ---
    "staccato": formatDefinition("Staccato", "斷奏", "義大利文", "音符時值縮短，彼此斷開。", "觸鍵短促輕盈。"),
    "legato": formatDefinition("Legato", "圓滑奏", "義大利文", "音與音無縫連接。", "製造連綿不斷的線條感。"),
    "marcato": formatDefinition("Marcato", "加強音", "義大利文", "每個音都強調。", "帶有重音與分離感，具有權威感。"),
    "arpeggio": formatDefinition("Arpeggio", "琶音", "義大利文", "和弦音像豎琴般依序奏出。", "均勻流暢，營造流動感。"),
    "glissando": formatDefinition("Glissando", "滑奏", "法/義", "快速滑過所有音高。", "展現華麗與流暢。"),
    "pizzicato": formatDefinition("Pizzicato", "撥奏", "義大利文", "弦樂器用手指撥弦。", "聲音短促，具打擊樂效果。"),
    "arco": formatDefinition("Arco", "拉奏 / 弓", "義大利文", "弦樂器用弓拉奏（相對於撥奏）。", "Pizzicato 之後恢復用弓。"),
    "tremolo": formatDefinition("Tremolo", "震音", "義大利文", "同音或兩音之間快速反覆。", "營造緊張或激動的效果。"),
    "trill": formatDefinition("Trill (tr)", "顫音", "義大利文/英文", "主要音與上方鄰音快速交替。", "裝飾性，需均勻且快速。"),
    "una corda": formatDefinition("Una corda", "柔音踏板 / 一條弦", "義大利文", "鋼琴左踏板。", "使擊弦機位移只敲擊一條弦（或較少弦），改變音色使其柔和。"),
    "tutti": formatDefinition("Tutti", "全體", "義大利文", "指樂團所有成員一起演奏。", "相對於 Solo（獨奏）。"),
    "solo": formatDefinition("Solo", "獨奏", "義大利文", "單獨一人演奏。", "需展現個人技巧與主角風範。"),

    // --- 其他 (Misc) ---
    "coda": formatDefinition("Coda", "尾奏", "義大利文", "樂曲結束的附加段落。", "全曲總結，展現結束感。"),
    "da capo": formatDefinition("Da Capo (D.C.)", "從頭反覆", "義大利文", "回到樂曲開頭。", "通常搭配 al Fine 使用。"),
    "dal segno": formatDefinition("Dal Segno (D.S.)", "從記號反覆", "義大利文", "回到記號（Segno）處。", "從標有 S 加斜線符號處開始演奏。"),
    "opus": formatDefinition("Opus (Op.)", "作品編號", "拉丁文", "作曲家的作品順序編號。", "通常代表出版順序。"),
    "etude": formatDefinition("Etude", "練習曲", "法文", "為練習特定技巧而寫的樂曲。", "蕭邦與李斯特將其提升為演奏會曲目。"),
    "nocturne": formatDefinition("Nocturne", "夜曲", "法文", "靈感來自夜晚的樂曲。", "通常性格恬靜、憂鬱，旋律優美。"),
};

// 別名對照表 (Alias Map)
const ALIAS_MAP: Record<string, string> = {
    // 中文別名
    "廣板": "largo", "小廣板": "larghetto", "慢板": "adagio", "行板": "andante", "小行板": "andantino",
    "中板": "moderato", "小快板": "allegretto", "快板": "allegro", "甚快板": "vivace", "急板": "presto",
    "漸慢": "ritardando", "rit": "ritardando", "rit.": "ritardando", "rall": "rallentando", "rall.": "rallentando",
    "漸快": "accelerando", "accel": "accelerando", "accel.": "accelerando",
    "彈性速度": "rubato", "自由速度": "rubato", "回原速": "a tempo",
    "激動": "agitato", "有精神": "animato", "華麗": "brillante", "如歌": "cantabile", "甜美": "dolce",
    "溫柔": "dolce", "表情": "espressivo", "優雅": "grazioso", "莊嚴": "maestoso", "神祕": "misterioso",
    "詼諧": "scherzando", "持續": "sostenuto", "寧靜": "tranquillo",
    "弱": "piano", "強": "forte", "漸強": "crescendo", "漸弱": "diminuendo", "突強": "sfz",
    "斷奏": "staccato", "跳音": "staccato", "圓滑奏": "legato", "連奏": "legato", "加強音": "marcato",
    "琶音": "arpeggio", "滑奏": "glissando", "撥奏": "pizzicato", "拉奏": "arco", "震音": "tremolo",
    "顫音": "trill", "柔音踏板": "una corda", "全體": "tutti", "獨奏": "solo",
    "尾奏": "coda", "從頭反覆": "da capo", "作品編號": "opus", "練習曲": "etude", "夜曲": "nocturne"
};

const normalize = (s: string) => s.trim().toLowerCase();

export const searchLocalDictionary = (term: string): string | null => {
    const key = normalize(term);
    if (DB[key]) return DB[key];
    const aliasKey = ALIAS_MAP[key];
    if (aliasKey && DB[aliasKey]) return DB[aliasKey];
    // Partial English Search
    const foundKey = Object.keys(DB).find(k => k.includes(key) || key.includes(k));
    if (foundKey) return DB[foundKey];
    return null;
}

// 新增：取得搜尋建議 (Autocomplete)
export const getSuggestions = (query: string): string[] => {
    if (!query || query.length < 1) return [];
    const lowerQ = normalize(query);

    const matches = new Set<string>();

    // 1. Check Standard Keys
    Object.keys(DB).forEach(key => {
        if (key.includes(lowerQ)) matches.add(key);
    });

    // 2. Check Aliases (Chinese)
    Object.keys(ALIAS_MAP).forEach(alias => {
        if (alias.includes(lowerQ)) matches.add(alias);
    });

    // Convert Set to Array, capitalize first letter, limit to 6
    return Array.from(matches)
        .slice(0, 6)
        .map(s => s.charAt(0).toUpperCase() + s.slice(1));
};
