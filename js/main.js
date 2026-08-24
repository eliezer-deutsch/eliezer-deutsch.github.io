// ===== ניווט עליון =====
const navbar = document.getElementById("navbar");
const toTop = document.getElementById("toTop");

window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 8);
  toTop.classList.toggle("show", window.scrollY > 600);
}, { passive: true });

toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// תפריט מובייל
const burger = document.getElementById("burger");
const mobileMenu = document.getElementById("mobileMenu");
burger.addEventListener("click", () => {
  const open = mobileMenu.classList.toggle("open");
  burger.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", open);
});
mobileMenu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
  mobileMenu.classList.remove("open");
  burger.classList.remove("open");
  burger.setAttribute("aria-expanded", "false");
}));

// ===== גילוי בגלילה =====
// ההשהיה המדורגת ניתנת כ-inline delay לפי מיקום בין האחים, ומנוקה בסוף המעבר
// כדי שלא תעכב מעברי hover (transition-delay חל על כל המאפיינים).
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    el.style.transitionDelay = (el.dataset.revealDelay || 0) + "ms";
    el.classList.add("visible");
    el.addEventListener("transitionend", function onEnd(ev) {
      if (ev.propertyName !== "transform") return;
      el.style.transitionDelay = "";
      el.classList.add("done");
      el.removeEventListener("transitionend", onEnd);
    });
    revealObserver.unobserve(el);
  });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach(el => {
  const siblings = el.parentElement
    ? [...el.parentElement.children].filter(c => c.classList.contains("reveal"))
    : [el];
  el.dataset.revealDelay = siblings.length > 1 ? siblings.indexOf(el) * 80 : 0;
  revealObserver.observe(el);
});

// ===== מונים נספרים =====
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || "";
  const dur = 1400;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3); /* easeOutCubic */
    el.textContent = Math.round(target * eased).toLocaleString("en-US") + (p === 1 ? suffix : "");
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCounter(e.target);
      counterObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.6 });
document.querySelectorAll(".counter").forEach(el => counterObserver.observe(el));

// ===== הגימיק: "אשתי לא מרשה לי" =====
const processingSteps = [
  "קולט את הפנייה שלך...",
  "בודק זמינות ביומן...",
  "מחשב הצעת מחיר...",
  "מעביר לאישור הרשות המוסמכת (אשתי)...",
];

/* כל תירוץ: t=כותרת, i=אייקון, x=טקסט. {n} מוחלף במספר התור הנוכחי.
   התירוצים מ-0 עד WIFE_COUNT-1 הם ה"אשתי לא מרשה לי" — משם תמיד מגיעה התשובה הראשונה,
   כי זו הפאנץ' של הדף. אחריה מתערבבים גם תירוצי התור. */
const excuses = [
  { t: "אשתי לא מרשה לי", i: "#i-denied", x: "בדקנו עם ההנהלה הבכירה. התשובה: אשתי לא מרשה לי. אין מה לעשות, זו סמכות מעליי." },
  { t: "אשתי לא מרשה לי", i: "#i-denied", x: "הייתי מגיע כבר מחר בבוקר, אבל אשתי אמרה שקודם מסיימים את המדף בסלון. זה שמחכה מ-2019." },
  { t: "אשתי לא מרשה לי", i: "#i-denied", x: "הבקשה נדונה בוועדת התכנון העליונה (אשתי). הסטטוס: נדחתה פה אחד. הוועדה מונה חברה אחת." },
  { t: "אשתי לא מרשה לי", i: "#i-denied", x: "יש לי חלון פנוי בעוד שלושה חודשים... רגע, שנייה... לא, אשתי אומרת שגם אז לא." },
  { t: "אשתי לא מרשה לי", i: "#i-denied", x: "אשתי בדקה את היומן שלי והודיעה שאני עסוק. במה? זה עדיין בבירור." },
  { t: "אשתי לא מרשה לי", i: "#i-denied", x: "דיברתי עם אשתי. היא אמרה: 'בטח, כמו הפרגולה שהבטחת לאמא שלי'. אז... לא." },
  { t: "אשתי לא מרשה לי", i: "#i-denied", x: "אשתי לא מרשה לי לקחת פרויקטים חדשים עד שאני מרכיב את הארון מאיקאה. אנחנו בשנה השנייה להרכבה." },
  { t: "אשתי לא מרשה לי", i: "#i-denied", x: "התקשרתי הביתה לבדוק אם אפשר. תשמע... עדיף שלא ניכנס לפרטים. התשובה שלילית." },
  { t: "אשתי לא מרשה לי", i: "#i-denied", x: "אשתי הזכירה לי שהבטחתי לה מרפסת עוד בחתונה. עד שאין מרפסת — אין פרויקטים חדשים." },
  { t: "נרשמת. יש תור.", i: "#i-hourglass", x: "רשמתי אותך. המקום שלך בתור: {n}. אנחנו מקדמים בערך שלושה בשנה, אז זה מתקדם יפה." },
  { t: "רשימת המתנה", i: "#i-hourglass", x: "זמן ההמתנה הממוצע לפרויקט חדש עומד על שמונה שנים. זה עוד לפני הזמן שאשתי תיקח לחשוב על זה." },
  { t: "היומן מלא", i: "#i-hourglass", x: "היומן סגור עד תשפ\"ט. אחרי זה יש חלון אחד, והוא כבר מובטח לגיס שלי." },
  { t: "יש אנשים לפניך", i: "#i-hourglass", x: "לפניך {n} פונים. חלקם מחכים מאז שהבן שלי נולד. הוא בן ארבע." },
  { t: "עומס חריג", i: "#i-hourglass", x: "היום התקבלו 41 פניות. ענינו לאחת — וגם עליה אשתי אמרה לא." },
  { t: "בטיפול", i: "#i-hourglass", x: "הבקשה שלך במקום {n}, ומטופלת לפי סדר הגעה. את הסדר קובעת אשתי, וזה לא בהכרח סדר הגעה." },
];
const WIFE_COUNT = 9;

const finalExcuse = "טוב, שכנעת אותי! מתי מתחילים?... רגע, אשתי מתקשרת... כן מאמי... ברור מאמי... אז זהו, לא. סופי. תבורכו.";

const overlay = document.getElementById("overlay");
const modal = document.getElementById("modal");
const loadingView = document.getElementById("loadingView");
const resultView = document.getElementById("resultView");
const stepsBox = document.getElementById("steps");
const resultText = document.getElementById("resultText");
const resultTitle = document.getElementById("resultTitle");
const resultIco = document.getElementById("resultIco");
const resultIcoUse = document.getElementById("resultIcoUse");
const convinceCounter = document.getElementById("convinceCounter");
const btnConvince = document.getElementById("btnConvince");
const btnGiveup = document.getElementById("btnGiveup");

const vipView = document.getElementById("vipView");
const vipResultView = document.getElementById("vipResultView");
const vipResultText = document.getElementById("vipResultText");
const bribesBox = document.getElementById("bribes");
const btnVip = document.getElementById("btnVip");
const btnBribe = document.getElementById("btnBribe");
const btnVipBack = document.getElementById("btnVipBack");
const btnBribeAgain = document.getElementById("btnBribeAgain");
const btnVipGiveup = document.getElementById("btnVipGiveup");

let attempts = 0;
let usedExcuses = [];
let stepTimers = [];
let queueNum = 12345;
let selectedBribe = null;

/* למודאל ארבעה מסכים: טעינה, תשובה, מסלול מהיר, ותשובת המסלול המהיר */
function showView(v) {
  loadingView.style.display = v === "loading" ? "block" : "none";
  resultView.style.display = v === "result" ? "block" : "none";
  vipView.style.display = v === "vip" ? "block" : "none";
  vipResultView.style.display = v === "vipResult" ? "block" : "none";
  modal.classList.toggle("wide", v === "vip");
}

function pickExcuse() {
  if (usedExcuses.length >= excuses.length) return null; /* null = התירוץ הסופי */
  /* התשובה הראשונה תמיד "אשתי לא מרשה לי"; מכאן והלאה כל המאגר פתוח */
  const top = usedExcuses.length === 0 ? WIFE_COUNT : excuses.length;
  let idx;
  do { idx = Math.floor(Math.random() * top); } while (usedExcuses.includes(idx));
  usedExcuses.push(idx);
  return excuses[idx];
}

function showResult() {
  const ex = pickExcuse();
  const isFinal = ex === null;
  showView("result");
  resultTitle.textContent = isFinal ? "זהו. באמת שאין טעם." : ex.t;
  resultText.textContent = isFinal ? finalExcuse : ex.x.replace("{n}", queueNum.toLocaleString("en-US"));
  resultIcoUse.setAttribute("href", isFinal ? "#i-phone-off" : ex.i);
  resultIco.classList.toggle("muted", isFinal);
  queueNum -= 1 + Math.floor(Math.random() * 2); /* התור זז. קצת. */
  if (!btnConvince.disabled) btnConvince.focus({ preventScroll: true });
  modal.classList.remove("shake");
  void modal.offsetWidth; /* מאתחל את אנימציית הרעידה מחדש */
  modal.classList.add("shake");
  if (attempts > 0) {
    convinceCounter.textContent = "ניסיונות שכנוע: " + attempts;
  }
  if (isFinal) {
    btnConvince.disabled = true;
    btnConvince.textContent = "אין טעם. באמת.";
  }
}

function runProcessing(steps, title, stepDur, onDone) {
  document.getElementById("loadingTitle").textContent = title;
  stepsBox.innerHTML = "";
  const stepEls = steps.map(txt => {
    const div = document.createElement("div");
    div.className = "step";
    div.innerHTML = '<span class="step-ico"><svg class="ico step-mark" aria-hidden="true">'
      + '<use href="#i-check"></use></svg></span><span>' + txt + "</span>";
    stepsBox.appendChild(div);
    return div;
  });

  stepTimers.forEach(clearTimeout);
  stepTimers = [];

  stepEls.forEach((el, i) => {
    /* הפעלת שלב */
    stepTimers.push(setTimeout(() => {
      el.classList.add("active");
    }, i * stepDur));
    /* סיום שלב: וי ירוק לכולם, איקס אדום לאישור של אשתו */
    stepTimers.push(setTimeout(() => {
      el.classList.remove("active");
      const isLast = i === stepEls.length - 1;
      el.classList.add(isLast ? "fail" : "done");
      el.querySelector(".step-mark use").setAttribute("href", isLast ? "#i-x" : "#i-check");
      if (isLast) {
        stepTimers.push(setTimeout(onDone, 650));
      }
    }, (i + 1) * stepDur + (i === stepEls.length - 1 ? 700 : 0)));
  });
}

document.getElementById("orderForm").addEventListener("submit", function (e) {
  e.preventDefault();
  attempts = 0;
  usedExcuses = [];
  queueNum = 12000 + Math.floor(Math.random() * 2600);
  resultIcoUse.setAttribute("href", "#i-denied");
  resultIco.classList.remove("muted");
  btnConvince.disabled = false;
  btnConvince.textContent = "נסה לשכנע אותה";
  convinceCounter.textContent = "";
  clearBribe();
  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
  showView("loading");
  modal.focus({ preventScroll: true });
  runProcessing(processingSteps, "מעבד את הבקשה...", 1000, showResult);
});

btnConvince.addEventListener("click", () => {
  attempts++;
  showResult();
});

function closeOverlay() {
  stepTimers.forEach(clearTimeout);
  overlay.classList.remove("open");
  document.body.style.overflow = "";
}

btnGiveup.addEventListener("click", closeOverlay);

overlay.addEventListener("click", (e) => {
  if (e.target === overlay) closeOverlay();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && overlay.classList.contains("open")) closeOverlay();
});

// ===== בועת דיבור יזומה — עובדות על העסק, כל אחת מופיעה פעם אחת בלבד =====
(function () {
  const facts = [
    "חלק ממחיר עבודת ריתוך הוא חולצת טריקו חדשה, שרוול ארוך!",
    "כל העובדים שלנו מתחת לגיל 18.\nבתכל'ס, גם מתחת לגיל 8",
    "מתקינים מצברים ומערכות סולאריות — ומגוון פתרונות הלכתיים לחשמל ולמים בשבת",
    "השותף הצעיר בחברה, מיכאל דויטש, בן 4. אחראי על מחלקת הפירוק",
    "כל חיבור שמצריך 10 ברגים — אנחנו נבצע ב-100 ברגים",
    "פשרות הם לא חלק מהאופציה אצלינו.\nזה מושלם, או לא יקרה לעולם",
    "אנחנו מאפשרים ביקורים באתר לכל דורש או מתעניין.\nכמובן, על אחריותו הבטיחותית בלבד",
    "מגורים באתר מותרים ואף מומלצים.\nתצפית מיוחדת בכוכבים במחיר 200 עקיצות יתושים בלבד",
    "חוויית שיפוץ מושלמת באמצעות כלי עבודה אקראיים המונחים בכל המיקומים השימושיים בביתכם. אוכלים, ישנים ונושמים את העבודה",
    "אנו מעניקים לצוות ימי בריאות הנפש על בסיס קבוע — בהם הוא מבצע איזו עבודה שירצה, גם אם היא לא רווחית, לא קשורה ולא מקדמת את הפרויקט",
    "גם אחרי השלמת הבנייה נשאיר לכם צינור בולט או מקום לא צבוע, כדי שתוכלו ליהנות מהרכב העבודה לאורך שנים",
    "לא מפונקים בכלי רכב: מאופניים ישנות, דרך רכב חבוט בלי מזגן, ועד משאית עם מנוף.\nהעבודה תבוצע באותו פרק זמן",
    "בתכנון: קראוון מגורים ייחודי על נגרר. קמפינג אמיתי בלי להתפשר על נוחות מקסימלית",
    "בתכנון: צימר כפרי מושקע עם כניסה פרטית, משקיף על מיטב חצרות השכנים.\nאפשרות לשירות רכבל מהבית הראשי",
  ];

  const pop = document.getElementById("factPop");
  const txt = document.getElementById("factPopText");
  const closeBtn = document.getElementById("factPopClose");
  const fab = document.querySelector(".chat-float");
  if (!pop || !txt || !closeBtn) return;

  const FIRST_DELAY = 5500;  /* השהיה לפני הבועה הראשונה */
  const VISIBLE = 8500;      /* כמה זמן היא נשארת */
  const GAP = 9000;          /* בסיס המרווח בין בועות */

  /* מרווח מעט שונה בכל פעם — מרווח קבוע נקרא מכני */
  function jitter(ms) { return Math.round(ms * (0.75 + Math.random() * 0.6)); }

  /* הבועה מתחלפת בין ארבע פינות. הגרלה בלי חזרה, וגם בלי אותה פינה פעמיים ברצף. */
  const SPOTS = ["fab", "br", "tr", "tl"];
  let bag = [], lastSpot = null;

  function nextSpot() {
    if (!bag.length) {
      bag = SPOTS.slice();
      for (let i = bag.length - 1; i > 0; i--) {
        const k = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[k]] = [bag[k], bag[i]];
      }
      if (bag[0] === lastSpot) [bag[0], bag[1]] = [bag[1], bag[0]];
    }
    lastSpot = bag.shift();
    return lastSpot;
  }

  let idx = 0, showTimer = null, hideTimer = null, nudgeTimer = null, stopped = false;

  function schedule(fn, ms) {
    clearTimeout(showTimer);
    showTimer = setTimeout(fn, ms);
  }

  function show() {
    if (stopped || idx >= facts.length) return; /* כל עובדה מוצגת פעם אחת ותו לא */
    /* לא מתחרים במודאל של הטופס — ממתינים עד שהוא נסגר */
    const lb = document.getElementById("lightbox");
    if (overlay.classList.contains("open") || (lb && lb.classList.contains("open")) || document.hidden) {
      schedule(show, 4000);
      return;
    }
    txt.textContent = facts[idx];
    const spot = nextSpot();
    pop.classList.remove("pos-fab", "pos-br", "pos-tr", "pos-tl");
    pop.classList.add("pos-" + spot);
    pop.classList.add("show");
    /* הטבעת על כפתור הצ'אט הגיונית רק כשהבועה באמת יוצאת ממנו */
    if (fab && spot === "fab") {
      fab.classList.add("nudge");
      clearTimeout(nudgeTimer);
      nudgeTimer = setTimeout(() => fab.classList.remove("nudge"), 2600);
    }
    idx++;
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, VISIBLE);
  }

  function hide() {
    pop.classList.remove("show");
    if (!stopped && idx < facts.length) schedule(show, jitter(GAP));
  }

  function stop() {
    stopped = true;
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
    clearTimeout(nudgeTimer);
    pop.classList.remove("show");
    if (fab) fab.classList.remove("nudge");
  }

  /* ריחוף משהה את הסגירה האוטומטית — רק במכשירים עם עכבר אמיתי.
     במגע, mouseenter נורה בהקשה ו-mouseleave עלול לא להגיע לעולם, ואז החלונית
     הייתה נתקעת על המסך לנצח; לכן גם ההשהיה מוגבלת בזמן. */
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    pop.addEventListener("mouseenter", () => {
      clearTimeout(hideTimer);
      hideTimer = setTimeout(hide, 30000);
    });
    pop.addEventListener("mouseleave", () => {
      clearTimeout(hideTimer);
      if (!stopped && pop.classList.contains("show")) {
        hideTimer = setTimeout(hide, 3500);
      }
    });
  }

  closeBtn.addEventListener("click", stop);

  /* כשהמודאל נפתח — מסתירים מיד ומחכים בסבלנות (בלי לבזבז את העובדה) */
  new MutationObserver(() => {
    if (overlay.classList.contains("open") && pop.classList.contains("show")) {
      clearTimeout(hideTimer);
      pop.classList.remove("show");
      if (!stopped && idx < facts.length) schedule(show, jitter(GAP));
    }
  }).observe(overlay, { attributes: true, attributeFilter: ["class"] });

  schedule(show, FIRST_DELAY);
})();


// ===== המסלול המהיר: בוחרים מה מציעים, ומקבלים "עדיין לא" =====
/* הסדר חייב להתאים ל-data-i של הצ'יפים ב-index.html */
const bribeReplies = [
  "יום? אני צריך אותו לשבועיים רק בשביל להעביר את הפרגולה של אמא שלי. אבל תודה.",
  "חודש כבר מדבר אליי. שלושה חודשים מדברים לאשתי, וזו השפה שקובעת.",
  "מפתה מאוד. אלא שאשתי אומרת שאם יש רכב יש גם זמן, ואם יש זמן יש עוד עבודות.",
  "רישיון יש לי. מה שאין לי זה משאית. וגם על זה, ניחשת נכון, אשתי לא מרשה.",
  "רתכת יש. מה שנשרף בסוף זה החולצות. תביא חולצות, נדבר.",
  "אני מעביר רהיטים גם ככה. השאלה היא של מי, ולמה זה תמיד בשבע בבוקר.",
  "תיק חדש פירושו סידור מחדש של כל הכלים. אין לי שבוע פנוי לפרויקט הזה.",
  "עכשיו נגעת. רגע... אשתי שואלת כמה מברגות כבר יש בבית. אז לא.",
  "גראז' זה החלום. וגם המקום שבו אשתי תגלה כמה כלים באמת קניתי.",
  "השעתיים האלה כבר תפוסות. הן הוקצו מראש לארון מאיקאה שבשנה השנייה להרכבה.",
  "זה כבר לא שוחד, זה נס. ועל ניסים אני לא לוקח תשלום.",
];

const vipSteps = [
  "מתעד את ההצעה...",
  "מעביר לשותף הצעיר לחוות דעת...",
  "מעריך שווי מול נזק תדמיתי...",
  "מעביר לאישור הרשות המוסמכת (אשתי)...",
];

function clearBribe() {
  selectedBribe = null;
  btnBribe.disabled = true;
  bribesBox.querySelectorAll(".bribe").forEach(b => b.setAttribute("aria-checked", "false"));
}

bribesBox.addEventListener("click", (e) => {
  const chip = e.target.closest(".bribe");
  if (!chip) return;
  bribesBox.querySelectorAll(".bribe").forEach(b => b.setAttribute("aria-checked", "false"));
  chip.setAttribute("aria-checked", "true");
  selectedBribe = parseInt(chip.dataset.i, 10);
  btnBribe.disabled = false;
});

btnVip.addEventListener("click", () => {
  showView("vip");
  bribesBox.scrollTop = 0;
});

btnVipBack.addEventListener("click", () => showView("result"));
btnVipGiveup.addEventListener("click", closeOverlay);
btnBribeAgain.addEventListener("click", () => {
  clearBribe();
  showView("vip");
});

btnBribe.addEventListener("click", () => {
  if (selectedBribe === null) return;
  const reply = bribeReplies[selectedBribe];
  showView("loading");
  runProcessing(vipSteps, "בוחן את ההצעה...", 800, () => {
    showView("vipResult");
    vipResultText.textContent = reply;
    modal.classList.remove("shake");
    void modal.offsetWidth;
    modal.classList.add("shake");
    btnBribeAgain.focus({ preventScroll: true });
  });
});

// ===== גלריה: פס נגלל + פתיחה לגריד מלא =====
(function () {
  const rail = document.getElementById("galleryGrid");
  const prev = document.getElementById("railPrev");
  const next = document.getElementById("railNext");
  const toggle = document.getElementById("galleryToggle");
  if (!rail || !prev || !next || !toggle) return;

  const label = toggle.querySelector("span");
  const closedLabel = label.textContent;
  /* ב-RTL scrollLeft של כרום יורד מאפס למינוס — לכן כל החישובים על הערך המוחלט */
  const sign = getComputedStyle(rail).direction === "rtl" ? -1 : 1;

  function step() {
    return Math.max(rail.clientWidth * 0.8, 240);
  }

  function sync() {
    if (rail.classList.contains("open")) return;
    const max = rail.scrollWidth - rail.clientWidth - 2;
    const pos = Math.abs(rail.scrollLeft);
    prev.disabled = pos <= 2;
    next.disabled = pos >= max;
  }

  /* scrollBy/scrollTo עם behavior:"smooth" נעצרים אחרי כמה עשרות פיקסלים כשה-scroll-snap
     פעיל ב-RTL, ולכן מנפישים כאן ידנית: הצמדה מכובה לאורך התנועה ומוחזרת בסופה.
     ה-timeout הוא רשת ביטחון למקרה שהדפדפן לא מספק פריימים (לשונית ברקע). */
  let anim = 0, guard = 0;

  function animateTo(target) {
    const from = rail.scrollLeft;
    const dist = target - from;
    if (Math.abs(dist) < 1) return;
    const t0 = performance.now();
    const dur = 380;
    rail.style.scrollSnapType = "none";
    cancelAnimationFrame(anim);
    clearTimeout(guard);

    function tick(now) {
      const p = Math.min((now - t0) / dur, 1);
      rail.scrollLeft = from + dist * (1 - Math.pow(1 - p, 3));
      if (p < 1) anim = requestAnimationFrame(tick); else finish();
    }
    function finish() {
      rail.style.scrollSnapType = "";
      sync();
    }
    anim = requestAnimationFrame(tick);
    guard = setTimeout(() => {
      if (Math.abs(rail.scrollLeft - target) > 4) {
        cancelAnimationFrame(anim);
        rail.scrollLeft = target;
        finish();
      }
    }, dur + 140);
  }

  /* ב-RTL הטווח של scrollLeft הוא [-max, 0] — הקיצוץ נעשה מול הקצה הנכון */
  function go(forward) {
    const max = rail.scrollWidth - rail.clientWidth;
    const raw = rail.scrollLeft + sign * (forward ? 1 : -1) * step();
    const target = sign < 0 ? Math.min(0, Math.max(-max, raw)) : Math.max(0, Math.min(max, raw));
    animateTo(target);
  }

  prev.addEventListener("click", () => go(false));
  next.addEventListener("click", () => go(true));
  rail.addEventListener("scroll", sync, { passive: true });
  window.addEventListener("resize", sync);

  toggle.addEventListener("click", () => {
    const open = rail.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
    label.textContent = open ? "כווץ את הגלריה" : closedLabel;
    prev.hidden = next.hidden = open;
    if (open) {
      /* כל התמונות נחשפות בבת אחת — מוותרים על הטעינה העצלה כדי שלא ייפתחו ריקים */
      rail.querySelectorAll("img").forEach(im => { im.loading = "eager"; });
    } else {
      rail.scrollLeft = 0;
      document.getElementById("gallery").scrollIntoView({ behavior: "smooth", block: "start" });
      sync();
    }
  });

  sync();
})();

// ===== גלריה: לייטבוקס =====
(function () {
  const grid = document.getElementById("galleryGrid");
  const lb = document.getElementById("lightbox");
  if (!grid || !lb) return;
  const img = document.getElementById("lbImg");
  const cap = document.getElementById("lbCap");
  const count = document.getElementById("lbCount");
  const btnClose = document.getElementById("lbClose");
  const btnPrev = document.getElementById("lbPrev");
  const btnNext = document.getElementById("lbNext");
  const items = Array.prototype.slice.call(grid.querySelectorAll(".gitem"));
  let cur = 0, lastFocus = null;

  function preload(i) {
    const el = items[(i + items.length) % items.length];
    const im = new Image();
    im.src = el.dataset.full;
  }

  function render(i) {
    cur = (i + items.length) % items.length;
    const el = items[cur];
    img.classList.remove("swap");
    void img.offsetWidth; /* מאתחל את אנימציית ההחלפה */
    img.classList.add("swap");
    img.src = el.dataset.full;
    img.alt = el.dataset.cap;
    cap.textContent = el.dataset.cap;
    count.textContent = (cur + 1) + " / " + items.length;
    preload(cur + 1);
    preload(cur - 1);
  }

  function open(i) {
    lastFocus = document.activeElement;
    render(i);
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
    btnClose.focus({ preventScroll: true });
  }

  function close() {
    lb.classList.remove("open");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }

  items.forEach((el, i) => el.addEventListener("click", () => open(i)));
  btnClose.addEventListener("click", close);
  btnPrev.addEventListener("click", () => render(cur - 1));
  btnNext.addEventListener("click", () => render(cur + 1));
  lb.addEventListener("mousedown", (e) => { if (e.target === lb) close(); });

  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") { close(); return; }
    /* הדף בעברית: חץ שמאלה מתקדם, חץ ימינה חוזר */
    if (e.key === "ArrowLeft") { e.preventDefault(); render(cur + 1); }
    if (e.key === "ArrowRight") { e.preventDefault(); render(cur - 1); }
  });

  /* החלקה במגע */
  let x0 = null;
  lb.addEventListener("touchstart", (e) => { x0 = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 45) render(dx < 0 ? cur + 1 : cur - 1);
    x0 = null;
  }, { passive: true });
})();
