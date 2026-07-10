
/* ============================================================
   TOC DRAWER
   ============================================================ */
function toggleToc(){
  document.getElementById('toc-drawer').classList.toggle('open');
  document.getElementById('toc-overlay').classList.toggle('show');
}

/* ============================================================
   DAY PROGRESS BAR (sunrise -> night as you scroll)
   ============================================================ */
const dayEmojis = ["🌅","🌤️","☀️","🌇","🌆","🌙"];
function updateDayBar(){
  const doc = document.documentElement;
  const scrollTop = doc.scrollTop || document.body.scrollTop;
  const scrollHeight = (doc.scrollHeight || document.body.scrollHeight) - doc.clientHeight;
  const pct = scrollHeight > 0 ? Math.min(100, Math.max(0,(scrollTop/scrollHeight)*100)) : 0;
  document.getElementById('daybar-fill').style.width = pct + '%';
  const marker = document.getElementById('day-marker');
  marker.style.left = pct + '%';
  const idx = Math.min(dayEmojis.length - 1, Math.floor((pct/100) * dayEmojis.length));
  marker.textContent = dayEmojis[idx];
}
window.addEventListener('scroll', updateDayBar);
window.addEventListener('resize', updateDayBar);

/* ============================================================
   CODE EDITORS (CodeMirror)
   ============================================================ */
const editors = {};
const originalCode = {};

function initAllEditors(){
  const textareas = document.querySelectorAll('.code-panel textarea');
  textareas.forEach(ta => {
    originalCode[ta.id] = ta.value;
    const cm = CodeMirror.fromTextArea(ta, {
      mode: 'text/x-csrc',
      theme: 'dayincode',
      lineNumbers: true,
      matchBrackets: true,
      indentUnit: 4,
      tabSize: 4,
      viewportMargin: Infinity,
      lineWrapping: true
    });
    editors[ta.id] = cm;
  });
}

function resetCode(id){
  if (editors[id]) {
    editors[id].setValue(originalCode[id]);
  }
  const outEl = document.getElementById(id.replace('code','out'));
  if (outEl) {
    outEl.textContent = '';
    outEl.classList.remove('error');
  }
}

/* ============================================================
   RUN C CODE VIA JSCPP
   ============================================================ */
function runCode(codeId, outId, inputId){
  const cm = editors[codeId];
  const code = cm ? cm.getValue() : document.getElementById(codeId).value;
  const outEl = document.getElementById(outId);
  outEl.classList.remove('error');
  outEl.textContent = '⏳ প্রোগ্রাম চলছে...';

  let inputVal = '';
  if (inputId) {
    const inpEl = document.getElementById(inputId);
    if (inpEl) inputVal = inpEl.value + "\n";
  }

  setTimeout(function(){
    if (typeof JSCPP === 'undefined') {
      outEl.classList.add('error');
      outEl.textContent = '⚠️ কোড রানার লোড হতে পারেনি (ইন্টারনেট সংযোগ চেক করো এবং পাতাটি রিফ্রেশ করো)।';
      return;
    }
    let output = '';
    try {
      const config = {
        stdio: {
          write: function(s){ output += s; }
        },
        unsigned_overflow: 'warn',
        maxTimeout: 6000
      };
      const exitCode = JSCPP.run(code, inputVal, config);
      outEl.textContent = (output.length ? output : '(কোনো আউটপুট নেই)') +
        '\n\n--- ✅ প্রোগ্রাম শেষ হয়েছে, exit code: ' + exitCode + ' ---';
    } catch (e) {
      outEl.classList.add('error');
      const msg = (e && e.message) ? e.message : String(e);
      if (/type (struct|union|enum)\b.*is not defined/i.test(msg)) {
        outEl.textContent = '⚠️ এই কোডটা সম্পূর্ণ সঠিক! কিন্তু আমরা যে ব্রাউজার-ভিত্তিক C ইন্টারপ্রেটার ব্যবহার করছি, সেটাতে struct/union/enum টাইপ এখনো সরাসরি রান করার সাপোর্ট নেই (এটা ওই লাইব্রেরিরই একটা সীমাবদ্ধতা, তোমার কোডের ভুল না)। কোডটা পড়ে-বুঝে শেখাই এখানে মূল লক্ষ্য।';
      } else {
        outEl.textContent = '😅 আরে! কোডে একটা ছোট্ট গণ্ডগোল হয়েছে:\n' + msg +
          '\n\nচিন্তা নেই, রাইয়ানও প্রথমবার ভুল করত। কোডটা একটু দেখে আবার চেষ্টা করো, অথবা "রিসেট" চেপে মূল কোডে ফিরে যাও।';
      }
    }
  }, 150);
}

/* ============================================================
   CONFETTI IN FINALE
   ============================================================ */
function spawnConfetti(){
  const wrap = document.getElementById('confetti-wrap');
  const emojis = ['🎉','⭐','🎈','✨','🏆','🔥'];
  for (let i = 0; i < 26; i++) {
    const span = document.createElement('span');
    span.className = 'confetti';
    span.textContent = emojis[Math.floor(Math.random()*emojis.length)];
    span.style.left = Math.random()*100 + '%';
    span.style.animationDuration = (4 + Math.random()*4) + 's';
    span.style.animationDelay = (Math.random()*5) + 's';
    wrap.appendChild(span);
  }
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', function(){
  initAllEditors();
  updateDayBar();
  spawnConfetti();
});
