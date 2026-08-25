export type Locale = "ru" | "tg";

export const translations = {
  ru: {
    home: "Главная",
    documents: "Документы",
    education: "Образование",
    government: "Госуслуги",
    notary: "Нотариальные услуги",
    medicine: "Медицина",
    social: "Социальное страхование",
    knowledge: "База знаний",
    language: "Язык",
    russian: "Русский",
    tajik: "Тоҷикӣ",
    ask: "Спросить →",
    search: "Найти",
    loading: "Проверяю…",
    quickAccess: "Быстрый доступ",
    start: "С чего начнём?",
    officialSources: "Официальные источники",
    forTajikistan: "Для Таджикистана",
    clearAndUseful: "Понятно и по делу",
    searchPlaceholder: "Например: какие документы нужны для паспорта?",
    knowledgePlaceholder: "Паспорт, ЦВЭ, налог…",
    noResults: "По этому запросу ничего не найдено.",
    source: "Официальный источник →",
  },
  tg: {
    home: "Асосӣ",
    documents: "Ҳуҷҷатҳо",
    education: "Маориф",
    government: "Хизматрасониҳои давлатӣ",
    notary: "Хизматрасониҳои нотариалӣ",
    medicine: "Тиб",
    social: "Суғуртаи иҷтимоӣ",
    knowledge: "Махзани дониш",
    language: "Забон",
    russian: "Русский",
    tajik: "Тоҷикӣ",
    ask: "Пурсидан →",
    search: "Ҷустуҷӯ",
    loading: "Маълумот санҷида мешавад…",
    quickAccess: "Дастрасии зуд",
    start: "Аз куҷо оғоз мекунем?",
    officialSources: "Сарчашмаҳои расмӣ",
    forTajikistan: "Барои Тоҷикистон",
    clearAndUseful: "Фаҳмо ва мухтасар",
    searchPlaceholder: "Масалан: барои гирифтани шиноснома чӣ ҳуҷҷатҳо лозиманд?",
    knowledgePlaceholder: "Шиноснома, ММТ, андоз…",
    noResults: "Аз рӯи ин дархост маълумот ёфт нашуд.",
    source: "Сарчашмаи расмӣ →",
  },
} as const;

export type TranslationKey = keyof typeof translations.ru;

export function getTranslation(locale: Locale, key: TranslationKey): string {
  return translations[locale][key] ?? translations.ru[key];
}
