import type ILocale from "./interface";

/**
 * Represents the English locale configuration for the picker.
 */
export default {
  name: "vi",
  weekdays: "chủ nhật_thứ hai_thứ ba_thứ tư_thứ năm_thứ sáu_thứ bảy".split("_"),
  months:
    "tháng 1_tháng 2_tháng 3_tháng 4_tháng 5_tháng 6_tháng 7_tháng 8_tháng 9_tháng 10_tháng 11_tháng 12".split(
      "_",
    ),
  weekStart: 1,
  weekdaysShort: "CN_T2_T3_T4_T5_T6_T7".split("_"),
  monthsShort:
    "Th01_Th02_Th03_Th04_Th05_Th06_Th07_Th08_Th09_Th10_Th11_Th12".split("_"),
  weekdaysMin: "CN_T2_T3_T4_T5_T6_T7".split("_"),
  ordinal: function (t: number) {
    return t;
  },
  formats: {
    LT: "DD/MM",
    LTS: "HH:mm:ss",
    L: "DD/MM/YYYY",
    LL: "D MMMM [năm] YYYY",
    LLL: "DD/MM/YYYY HH:mm:ss",
    LLLL: "dddd, D MMMM [năm] YYYY HH:mm",
  },
  // 2026/04/24 20:48
  relativeTime: {
    future: "%s tới",
    past: "%s trước",
    s: "vài giây",
    m: "một phút",
    mm: "%d phút",
    h: "một giờ",
    hh: "%d giờ",
    d: "một ngày",
    dd: "%d ngày",
    M: "một tháng",
    MM: "%d tháng",
    y: "một năm",
    yy: "%d năm",
  },
} as ILocale;
