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

const excuses = [
  "בדקנו עם ההנהלה הבכירה. התשובה: אשתי לא מרשה לי. אין מה לעשות, זו סמכות מעליי.",
  "הייתי מגיע כבר מחר בבוקר, אבל אשתי אמרה שקודם מסיימים את המדף בסלון. זה שמחכה מ-2019.",
  "הבקשה נדונה בוועדת התכנון העליונה (אשתי). הסטטוס: נדחתה פה אחד. הוועדה מונה חברה אחת.",
  "יש לי חלון פנוי בעוד שלושה חודשים... רגע, שנייה... לא, אשתי אומרת שגם אז לא.",
  "אשתי בדקה את היומן שלי והודיעה שאני עסוק. במה? זה עדיין בבירור.",
  "דיברתי עם אשתי. היא אמרה: 'בטח, כמו הפרגולה שהבטחת לאמא שלי'. אז... לא.",
  "אשתי לא מרשה לי לקחת פרויקטים חדשים עד שאני מרכיב את הארון מאיקאה. אנחנו בשנה השנייה להרכבה.",
  "התקשרתי הביתה לבדוק אם אפשר. תשמע... עדיף שלא ניכנס לפרטים. התשובה שלילית.",
  "אשתי הזכירה לי שהבטחתי לה מרפסת עוד בחתונה. עד שאין מרפסת — אין פרויקטים חדשים.",
];

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

let attempts = 0;
let usedExcuses = [];
let stepTimers = [];

function pickExcuse() {
  if (usedExcuses.length >= excuses.length) return finalExcuse;
  let idx;
  do { idx = Math.floor(Math.random() * excuses.length); } while (usedExcuses.includes(idx));
  usedExcuses.push(idx);
  return excuses[idx];
}

function showResult() {
  loadingView.style.display = "none";
  resultView.style.display = "block";
  resultText.textContent = pickExcuse();
  if (!btnConvince.disabled) btnConvince.focus({ preventScroll: true });
  modal.classList.remove("shake");
  void modal.offsetWidth; /* מאתחל את אנימציית הרעידה מחדש */
  modal.classList.add("shake");
  if (attempts > 0) {
    convinceCounter.textContent = "ניסיונות שכנוע: " + attempts;
  }
  if (usedExcuses.length >= excuses.length && resultText.textContent === finalExcuse) {
    resultTitle.textContent = "זהו. באמת שאין טעם.";
    resultIcoUse.setAttribute("href", "#i-phone-off");
    resultIco.classList.add("muted");
    btnConvince.disabled = true;
    btnConvince.textContent = "אין טעם. באמת.";
    btnConvince.style.opacity = ".5";
    btnConvince.style.cursor = "not-allowed";
  }
}

function runProcessing() {
  stepsBox.innerHTML = "";
  const stepEls = processingSteps.map(txt => {
    const div = document.createElement("div");
    div.className = "step";
    div.innerHTML = '<span class="step-ico"><svg class="ico step-mark" aria-hidden="true">'
      + '<use href="#i-check"></use></svg></span><span>' + txt + "</span>";
    stepsBox.appendChild(div);
    return div;
  });

  stepTimers.forEach(clearTimeout);
  stepTimers = [];
  const stepDur = 1000;

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
        stepTimers.push(setTimeout(showResult, 650));
      }
    }, (i + 1) * stepDur + (i === stepEls.length - 1 ? 700 : 0)));
  });
}

document.getElementById("orderForm").addEventListener("submit", function (e) {
  e.preventDefault();
  attempts = 0;
  usedExcuses = [];
  resultTitle.textContent = "אשתי לא מרשה לי";
  resultIcoUse.setAttribute("href", "#i-denied");
  resultIco.classList.remove("muted");
  btnConvince.disabled = false;
  btnConvince.textContent = "נסה לשכנע אותה";
  btnConvince.style.opacity = "";
  btnConvince.style.cursor = "";
  convinceCounter.textContent = "";
  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
  loadingView.style.display = "block";
  resultView.style.display = "none";
  modal.focus({ preventScroll: true });
  runProcessing();
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
    "בכל ריתוך נשרפת חולצת עבודה — ולכן הלקוח מממן חדשה. סעיף קבוע בהצעת המחיר",
    "כל העובדים שלנו מתחת לגיל 18.\nבתכל'ס, גם מתחת לגיל 8",
    "מתקינים מצברים ומערכות סולאריות — ומגוון פתרונות הלכתיים לחשמל ולמים בשבת",
    "השותף הצעיר בחברה, מיכאל דויטש, בן 4. אחראי על מחלקת הפירוק",
  ];

  const pop = document.getElementById("factPop");
  const txt = document.getElementById("factPopText");
  const closeBtn = document.getElementById("factPopClose");
  const fab = document.querySelector(".chat-float");
  if (!pop || !txt || !closeBtn) return;

  const FIRST_DELAY = 5500;  /* השהיה לפני הבועה הראשונה */
  const VISIBLE = 9500;      /* כמה זמן היא נשארת */
  const GAP = 11000;         /* מרווח בין בועות */

  let idx = 0, showTimer = null, hideTimer = null, nudgeTimer = null, stopped = false;

  function schedule(fn, ms) {
    clearTimeout(showTimer);
    showTimer = setTimeout(fn, ms);
  }

  function show() {
    if (stopped || idx >= facts.length) return; /* כל עובדה מוצגת פעם אחת ותו לא */
    /* לא מתחרים במודאל של הטופס — ממתינים עד שהוא נסגר */
    if (overlay.classList.contains("open") || document.hidden) {
      schedule(show, 4000);
      return;
    }
    txt.textContent = facts[idx];
    pop.classList.add("show");
    if (fab) {
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
    if (!stopped && idx < facts.length) schedule(show, GAP);
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
      if (!stopped && idx < facts.length) schedule(show, GAP);
    }
  }).observe(overlay, { attributes: true, attributeFilter: ["class"] });

  schedule(show, FIRST_DELAY);
})();
