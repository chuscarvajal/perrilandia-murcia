/*
   Perrilandia Campamento Perruno — Interactive Client Logic
   Guardería Canina Respetuosa en Murcia
*/

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. Navigation & Theme Toggle
  // ==========================================
  const navbar = document.querySelector('.navbar');
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const themeToggle = document.querySelector('.theme-toggle');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });

  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-theme',
    (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) ? 'dark' : 'light'
  );

  themeToggle.addEventListener('click', () => {
    const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });

  // ==========================================
  // 2. Before / After Image Slider
  // ==========================================
  const sliderContainer = document.querySelector('.comparison-slider');
  const afterImage = document.querySelector('.image-after');
  const handle = document.querySelector('.slider-handle');

  if (sliderContainer && afterImage && handle) {
    let isDragging = false;
    const moveSlider = (clientX) => {
      const rect = sliderContainer.getBoundingClientRect();
      let pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
      afterImage.style.clipPath = `polygon(0 0, ${pct}% 0, ${pct}% 100%, 0 100%)`;
      handle.style.left = `${pct}%`;
    };
    sliderContainer.addEventListener('mousedown', (e) => { isDragging = true; moveSlider(e.clientX); });
    window.addEventListener('mouseup', () => { isDragging = false; });
    sliderContainer.addEventListener('mousemove', (e) => { if (isDragging) moveSlider(e.clientX); });
    sliderContainer.addEventListener('touchstart', (e) => { isDragging = true; if (e.touches[0]) moveSlider(e.touches[0].clientX); });
    window.addEventListener('touchend', () => { isDragging = false; });
    sliderContainer.addEventListener('touchmove', (e) => { if (isDragging && e.touches[0]) moveSlider(e.touches[0].clientX); });
  }

  // ==========================================
  // 3. Needs Assessment Quiz
  // ==========================================
  const quizData = [
    {
      question: "¿Cuál es la principal necesidad de tu perro ahora mismo?",
      options: [
        { text: "Necesita compañía y cuidado durante el día mientras trabajo", score: "guarderia" },
        { text: "Quiero que aprenda a comportarse mejor y mejorar nuestra comunicación", score: "educacion" },
        { text: "Busco guardería con recogida a domicilio — no tengo cómo llevarlo", score: "recogida" },
        { text: "Todo a la vez — guardería + educación + comodidad máxima", score: "recogida" }
      ]
    },
    {
      question: "¿Cuántas horas al día suele quedarse tu perro solo en casa?",
      options: [
        { text: "Más de 6 horas — le noto ansioso o destructivo", score: "guarderia" },
        { text: "Entre 3 y 6 horas — se apaña pero me preocupa", score: "guarderia" },
        { text: "Pocas horas — el problema es su comportamiento, no la soledad", score: "educacion" },
        { text: "Casi no está solo — pero quiero que socialice más con otros perros", score: "guarderia" }
      ]
    },
    {
      question: "¿Cómo se relaciona tu perro con otros perros?",
      options: [
        { text: "Muy bien — le encanta jugar con otros perros", score: "guarderia" },
        { text: "Con algunos sí, con otros no — depende del perro", score: "guarderia" },
        { text: "Tiene problemas de reactividad o miedo con otros perros", score: "educacion" },
        { text: "No lo sé — apenas ha tenido contacto con otros perros", score: "educacion" }
      ]
    },
    {
      question: "¿Con qué frecuencia necesitarías el servicio?",
      options: [
        { text: "Todos los días laborables — de lunes a viernes", score: "guarderia" },
        { text: "Algunos días por semana — según mi horario", score: "guarderia" },
        { text: "Ocasionalmente — cuando lo necesite por trabajo o viajes", score: "recogida" },
        { text: "Busco un bono mensual para tener cobertura continua", score: "guarderia" }
      ]
    }
  ];

  let currentStep = 0;
  const userAnswers = [];
  const quizStep = document.getElementById('quiz-step');
  const quizQuestion = document.getElementById('quiz-question');
  const quizOptions = document.getElementById('quiz-options');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const progressFill = document.getElementById('progress-fill');
  const stepCount = document.getElementById('step-count');
  const quizResult = document.getElementById('quiz-result');
  const resultTitle = document.getElementById('result-title');
  const resultDesc = document.getElementById('result-desc');
  const recDesc = document.getElementById('rec-desc');
  const btnRestart = document.getElementById('btn-restart');
  const btnSelectResultPackage = document.getElementById('btn-select-result-package');

  function initQuiz() {
    if (!quizStep) return;
    currentStep = 0;
    userAnswers.length = 0;
    quizResult.classList.remove('active');
    quizStep.classList.add('active');
    btnPrev.style.visibility = 'hidden';
    btnNext.innerText = 'Siguiente';
    showQuestion();
  }

  function showQuestion() {
    const q = quizData[currentStep];
    quizQuestion.innerText = q.question;
    quizOptions.innerHTML = '';
    progressFill.style.width = `${(currentStep / quizData.length) * 100}%`;
    stepCount.innerText = `Paso ${currentStep + 1} de ${quizData.length}`;

    q.options.forEach((opt, idx) => {
      const el = document.createElement('div');
      el.classList.add('quiz-option');
      if (userAnswers[currentStep] === idx) el.classList.add('selected');
      el.innerHTML = `<div class="quiz-radio"></div><div class="quiz-option-text">${opt.text}</div>`;
      el.addEventListener('click', () => {
        document.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
        el.classList.add('selected');
        userAnswers[currentStep] = idx;
        btnNext.disabled = false;
      });
      quizOptions.appendChild(el);
    });

    btnNext.disabled = userAnswers[currentStep] === undefined;
    btnPrev.style.visibility = currentStep === 0 ? 'hidden' : 'visible';
    btnNext.innerText = currentStep === quizData.length - 1 ? 'Ver Resultado' : 'Siguiente';
  }

  if (btnNext) btnNext.addEventListener('click', () => {
    if (currentStep < quizData.length - 1) { currentStep++; showQuestion(); } else { showResults(); }
  });
  if (btnPrev) btnPrev.addEventListener('click', () => { if (currentStep > 0) { currentStep--; showQuestion(); } });
  if (btnRestart) btnRestart.addEventListener('click', initQuiz);

  function showResults() {
    quizStep.classList.remove('active');
    quizResult.classList.add('active');
    progressFill.style.width = '100%';
    stepCount.innerText = 'Resultado';

    const scores = { guarderia: 0, educacion: 0, recogida: 0 };
    userAnswers.forEach((ansIdx, qIdx) => { scores[quizData[qIdx].options[ansIdx].score]++; });

    let rec = 'guarderia';
    if (scores.educacion >= scores.guarderia && scores.educacion >= scores.recogida) rec = 'educacion';
    else if (scores.recogida >= scores.guarderia && scores.recogida >= scores.educacion) rec = 'recogida';

    const results = {
      guarderia: {
        title: "Guardería Diurna — lo que tu perro necesita",
        desc: "Tu perro necesita compañía, estimulación y un entorno seguro mientras tú trabajas. La guardería de Perrilandia es la solución perfecta.",
        rec: "Tu peludo pasará el día jugando con otros perros en un ambiente familiar, sin jaulas y con todo el cariño de Patricia. Actualizaciones en Instagram para que siempre sepas cómo está."
      },
      educacion: {
        title: "Educación Canina — construye una relación mejor",
        desc: "Tu perro y tú necesitáis trabajar la comunicación y el comportamiento. Las clases con Patricia os darán las herramientas para entenderos de verdad.",
        rec: "Trabajaréis la obediencia, el paseo, la socialización y cualquier conducta problemática con un enfoque respetuoso y basado en el refuerzo positivo."
      },
      recogida: {
        title: "Guardería + Recogida a Domicilio — máxima comodidad",
        desc: "Quieres la guardería pero también la comodidad de que Patricia vaya a buscar y traer a tu perro. El pack completo.",
        rec: "Patricia recoge a tu perro en casa, pasa el día en Perrilandia y lo devuelve al terminar. Cero estrés para ti y máximo bienestar para tu peludo."
      }
    };

    resultTitle.innerText = results[rec].title;
    resultDesc.innerText = results[rec].desc;
    recDesc.innerText = results[rec].rec;
    btnSelectResultPackage.setAttribute('data-target-package', rec);
  }

  if (btnSelectResultPackage) {
    btnSelectResultPackage.addEventListener('click', () => {
      selectPackage(btnSelectResultPackage.getAttribute('data-target-package'));
      document.getElementById('calculator').scrollIntoView({ behavior: 'smooth' });
    });
  }

  initQuiz();

  // ==========================================
  // 4. Pricing Calculator
  // ==========================================
  const pkgGuarderia = document.getElementById('pkg-guarderia');
  const pkgEducacion = document.getElementById('pkg-educacion');
  const pkgRecogida = document.getElementById('pkg-recogida');
  const rangeSessions = document.getElementById('range-sessions');
  const sessionCountVal = document.getElementById('session-count-val');
  const sessionsLabel = document.getElementById('sessions-label');
  const addonHome = document.getElementById('addon-home');
  const addonSupport = document.getElementById('addon-support');
  const addonMaterials = document.getElementById('addon-materials');
  const summaryPackageName = document.getElementById('summary-package-name');
  const summaryPackagePrice = document.getElementById('summary-package-price');
  const summarySessionsCount = document.getElementById('summary-sessions-count');
  const summarySessionsPrice = document.getElementById('summary-sessions-price');
  const summaryAddonsList = document.getElementById('summary-addons-list');
  const summaryAddonsPrice = document.getElementById('summary-addons-price');
  const summaryTotalPrice = document.getElementById('summary-total-price');
  const btnBookSession = document.getElementById('btn-book-session');

  const packages = {
    guarderia: { name: "Guardería Diurna",        unitPrice: 0, unitLabel: "días",     sliderMin:1, sliderMax:20, sliderDefault:5,  priceLabel:"Consultar", sessionLabel:"2. Número de Días" },
    educacion: { name: "Educación Canina",         unitPrice: 0, unitLabel: "sesiones", sliderMin:1, sliderMax:10, sliderDefault:3,  priceLabel:"Consultar", sessionLabel:"2. Número de Sesiones" },
    recogida:  { name: "Guardería + Recogida",     unitPrice: 0, unitLabel: "días",     sliderMin:1, sliderMax:20, sliderDefault:5,  priceLabel:"Consultar", sessionLabel:"2. Número de Días" }
  };

  let activePackage = 'guarderia';

  function selectPackage(pkgKey) {
    if (!packages[pkgKey]) return;
    activePackage = pkgKey;
    [pkgGuarderia, pkgEducacion, pkgRecogida].forEach(el => { if (el) el.classList.remove('selected'); });
    const targetEl = document.getElementById(`pkg-${pkgKey}`);
    if (targetEl) targetEl.classList.add('selected');
    const pkg = packages[pkgKey];
    rangeSessions.min = pkg.sliderMin;
    rangeSessions.max = pkg.sliderMax;
    rangeSessions.value = pkg.sliderDefault;
    sessionCountVal.innerText = pkg.sliderDefault;
    if (sessionsLabel) sessionsLabel.innerText = pkg.sessionLabel;
    calculateCosts();
  }

  function setupCalculatorEvents() {
    if (!pkgGuarderia) return;
    pkgGuarderia.addEventListener('click', () => selectPackage('guarderia'));
    pkgEducacion.addEventListener('click', () => selectPackage('educacion'));
    pkgRecogida.addEventListener('click', () => selectPackage('recogida'));
    rangeSessions.addEventListener('input', (e) => { sessionCountVal.innerText = e.target.value; calculateCosts(); });
    [addonHome, addonSupport, addonMaterials].forEach(addon => {
      if (addon) addon.addEventListener('click', () => { addon.classList.toggle('selected'); calculateCosts(); });
    });
    if (btnBookSession) {
      btnBookSession.addEventListener('click', () => {
        const pkg = packages[activePackage];
        const qty = rangeSessions.value;
        const msg = `Hola Patricia, me gustaría información sobre: *${pkg.name}* — ${qty} ${pkg.unitLabel}.`;
        const contactMessage = document.getElementById('message');
        if (contactMessage) contactMessage.value = msg;
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
      });
    }
  }

  function calculateCosts() {
    if (!rangeSessions || !summaryPackageName) return;
    const pkg = packages[activePackage];
    const qty = parseInt(rangeSessions.value);
    summaryPackageName.innerText = pkg.name;
    summaryPackagePrice.innerText = pkg.priceLabel;
    summarySessionsCount.innerText = `${qty} ${pkg.unitLabel}`;
    summarySessionsPrice.innerText = 'Consultar';
    summaryAddonsList.innerText = 'Ninguno';
    summaryAddonsPrice.innerText = '+0€';
    summaryTotalPrice.classList.remove('pulse');
    void summaryTotalPrice.offsetWidth;
    summaryTotalPrice.classList.add('pulse');
    summaryTotalPrice.innerText = 'Consultar';
  }

  setupCalculatorEvents();
  calculateCosts();

  // ==========================================
  // 5. Testimonial Carousel
  // ==========================================
  const track = document.querySelector('.reviews-track');
  const slides = Array.from(document.querySelectorAll('.review-slide'));
  const dotsContainer = document.querySelector('.reviews-nav');

  if (track && slides.length > 0 && dotsContainer) {
    let currentSlideIdx = 0;
    slides.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.classList.add('review-dot');
      if (idx === 0) dot.classList.add('active');
      dot.addEventListener('click', () => { goToSlide(idx); clearInterval(autoPlayInterval); });
      dotsContainer.appendChild(dot);
    });
    const dots = Array.from(document.querySelectorAll('.review-dot'));
    function goToSlide(idx) {
      currentSlideIdx = idx;
      track.style.transform = `translateX(-${idx * 100}%)`;
      dots.forEach(d => d.classList.remove('active'));
      dots[idx].classList.add('active');
    }
    let autoPlayInterval = setInterval(() => { goToSlide((currentSlideIdx + 1) % slides.length); }, 5000);
  }

  // ==========================================
  // 6. FAQ Accordion
  // ==========================================
  document.querySelectorAll('.faq-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const isActive = item.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(el => {
        el.classList.remove('active');
        el.querySelector('.faq-body').style.maxHeight = null;
      });
      if (!isActive) {
        item.classList.add('active');
        const body = item.querySelector('.faq-body');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });

  // ==========================================
  // 7. Contact Form
  // ==========================================
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();
      if (!name || !email || !message) {
        formStatus.innerText = "Por favor, rellena los campos obligatorios (Nombre, Email y Mensaje).";
        formStatus.className = "form-status error";
        return;
      }
      formStatus.innerText = "¡Gracias por contactar con Perrilandia! Patricia te responderá lo antes posible.";
      formStatus.className = "form-status success";
      contactForm.reset();
      setTimeout(() => { formStatus.style.display = 'none'; }, 5000);
    });
  }

});
