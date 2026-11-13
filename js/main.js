/**
 * ACID & GRAIN CAFE — Core Scripts
 * Vanilla ES6+ client interactions
 */

(function () {
  'use strict';

  // State Management
  let initialCart = [];
  try {
    initialCart = JSON.parse(sessionStorage.getItem('ag_cart') || '[]');
  } catch (e) {
    initialCart = [];
  }

  const state = {
    cart: initialCart,
    roastMode: localStorage.getItem('ag_roast_mode') === 'true'
  };

  function saveCart() {
    try {
      sessionStorage.setItem('ag_cart', JSON.stringify(state.cart));
    } catch (e) {}
    updateNavSlipBadge();
  }

  function updateNavSlipBadge() {
    const badges = document.querySelectorAll('#nav-slip-count, .nav-slip-badge');
    const totalQty = state.cart.reduce((sum, i) => sum + i.qty, 0);
    badges.forEach(badge => {
      if (totalQty > 0) {
        badge.textContent = `(${totalQty})`;
        badge.style.display = 'inline-flex';
        badge.classList.remove('pulse');
        void badge.offsetWidth;
        badge.classList.add('pulse');
      } else {
        badge.style.display = 'none';
      }
    });
  }

  /* ==========================================================================
     01. THEME ROAST / INVERSION MODE (Brown / Cream / Green 3-Tone Formula)
     ========================================================================== */
  function applyTheme() {
    if (state.roastMode) {
      document.body.classList.add('roast-mode');
    } else {
      document.body.classList.remove('roast-mode');
    }
    
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      const textSpan = themeBtn.querySelector('.theme-text');
      if (textSpan) {
        textSpan.textContent = state.roastMode ? 'LIGHT LINEN' : 'DARK ROAST';
      } else {
        themeBtn.innerHTML = state.roastMode 
          ? '<span class="toggle-indicator-dot"></span> LIGHT LINEN' 
          : '<span class="toggle-indicator-dot"></span> DARK ROAST';
      }
    }
  }

  function toggleTheme() {
    state.roastMode = !state.roastMode;
    localStorage.setItem('ag_roast_mode', state.roastMode);
    applyTheme();
    showToast(state.roastMode ? 'INVERSION: DARK ROAST ENGAGED' : 'INVERSION: UNBLEACHED LINEN ENGAGED');
  }

  /* ==========================================================================
     03. EDITORIAL CROSSHAIR CURSOR
     ========================================================================== */
  function setupCustomCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let cursor = document.querySelector('.custom-cursor');
    if (!cursor) {
      cursor = document.createElement('div');
      cursor.className = 'custom-cursor';
      document.body.appendChild(cursor);
    }

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function renderCursor() {
      currentX += (mouseX - currentX) * 0.25;
      currentY += (mouseY - currentY) * 0.25;
      cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(renderCursor);
    }
    renderCursor();

    const interactives = 'a, button, input, textarea, .extraction-card, .menu-row, .cat-btn, [data-cursor]';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactives)) {
        cursor.classList.add('active');
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactives)) {
        cursor.classList.remove('active');
      }
    });
  }

  /* ==========================================================================
     04. HOVER IMAGE PREVIEWS (Editorial Visual Reveal)
     ========================================================================== */
  function setupHoverPreviews() {
    const previewBox = document.createElement('div');
    previewBox.className = 'floating-preview';
    const previewImg = document.createElement('img');
    previewBox.appendChild(previewImg);
    document.body.appendChild(previewBox);

    let active = false;

    document.querySelectorAll('[data-preview-img]').forEach(el => {
      el.addEventListener('mouseenter', () => {
        const src = el.getAttribute('data-preview-img');
        if (src) {
          previewImg.src = src;
          previewBox.classList.add('visible');
          active = true;
        }
      });

      el.addEventListener('mousemove', (e) => {
        if (!active) return;
        previewBox.style.left = `${e.clientX}px`;
        previewBox.style.top = `${e.clientY}px`;
      });

      el.addEventListener('mouseleave', () => {
        previewBox.classList.remove('visible');
        active = false;
      });
    });
  }

  /* ==========================================================================
     05. SCROLL-REACTIVE MARQUEE TICKER
     ========================================================================== */
  function setupMarqueeScroll() {
    const tickers = document.querySelectorAll('.ticker');
    if (!tickers.length) return;

    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;
    let timeoutId = null;

    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      const delta = Math.abs(currentScrollY - lastScrollY);
      scrollVelocity = Math.min(delta * 0.05, 3);
      lastScrollY = currentScrollY;

      tickers.forEach(t => {
        t.style.animationDuration = `${Math.max(8, 28 - scrollVelocity * 8)}s`;
      });

      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        tickers.forEach(t => {
          t.style.animationDuration = '28s';
        });
      }, 150);
    }, { passive: true });
  }

  /* ==========================================================================
     06. LIVE STATUS TICKER & LOCAL METRICS
     ========================================================================== */
  function updateLiveTelemetry() {
    const clockEl = document.getElementById('live-clock');
    const statusTextEl = document.getElementById('roastery-status');

    function tick() {
      const now = new Date();
      if (clockEl) {
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        clockEl.textContent = `${hours}:${minutes}:${seconds} HRS`;
      }

      if (statusTextEl) {
        const hour = now.getHours();
        // Roastery operates 07:00 - 22:00
        if (hour >= 7 && hour < 22) {
          statusTextEl.innerHTML = '<span class="status-dot"></span> EXTRACTION LIVE [ACTIVE]';
        } else {
          statusTextEl.innerHTML = '<span class="status-dot" style="background: var(--clay); box-shadow: 0 0 8px var(--clay);"></span> NIGHT BATCHING [CLOSED TO PUBLIC]';
        }
      }
    }

    tick();
    setInterval(tick, 1000);
  }

  /* ==========================================================================
     07. RECEIPT / TARIFF ORDER SLIP SYSTEM (Menu Page)
     ========================================================================== */
  function setupReceiptSystem() {
    const listContainer = document.getElementById('receipt-items');
    const subtotalEl = document.getElementById('receipt-subtotal');
    const taxEl = document.getElementById('receipt-tax');
    const totalEl = document.getElementById('receipt-total');
    const printBtn = document.getElementById('print-receipt');
    const clearBtn = document.getElementById('clear-receipt');

    if (!listContainer) return; // Not on menu page

    function renderReceipt() {
      if (state.cart.length === 0) {
        listContainer.innerHTML = '<div class="receipt-empty">// SLIP IS CURRENTLY VOID.<br>SELECT ITEMS FROM TARIFF.</div>';
        if (subtotalEl) subtotalEl.textContent = '$0.00';
        if (taxEl) taxEl.textContent = '$0.00';
        if (totalEl) totalEl.textContent = '$0.00';
        return;
      }

      listContainer.innerHTML = '';
      let subtotal = 0;

      state.cart.forEach((item, index) => {
        subtotal += item.price * item.qty;
        const row = document.createElement('div');
        row.className = 'receipt-line-item';
        row.innerHTML = `
          <div class="receipt-line-name">${item.qty}x ${item.name}</div>
          <div>
            $${(item.price * item.qty).toFixed(2)}
            <span class="receipt-delete-btn" data-index="${index}" title="Remove">×</span>
          </div>
        `;
        listContainer.appendChild(row);
      });

      const tax = subtotal * 0.08;
      const total = subtotal + tax;

      if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
      if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
      if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;

      saveCart();

      // Attach delete handlers
      listContainer.querySelectorAll('.receipt-delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.getAttribute('data-index'), 10);
          state.cart.splice(idx, 1);
          renderReceipt();
          saveCart();
        });
      });
    }

    // Attach click events to menu rows and add buttons
    document.querySelectorAll('.menu-row, .btn-add-item').forEach(el => {
      el.addEventListener('click', (e) => {
        // Prevent double fires
        const row = el.closest('.menu-row') || el;
        const name = row.getAttribute('data-name');
        const price = parseFloat(row.getAttribute('data-price') || '0');

        if (!name || isNaN(price)) return;

        const existing = state.cart.find(i => i.name === name);
        if (existing) {
          existing.qty += 1;
        } else {
          state.cart.push({ name, price, qty: 1 });
        }

        renderReceipt();
        showToast(`LOGGED TO SLIP: ${name.toUpperCase()}`);
      });
    });

    if (printBtn) {
      printBtn.addEventListener('click', () => {
        if (state.cart.length === 0) {
          showToast('SLIP EMPTY: ADD ITEMS FIRST');
          return;
        }
        window.print();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        state.cart = [];
        renderReceipt();
        saveCart();
        showToast('SLIP EMPTIED');
      });
    }

    // Smooth Category Tabs Filtering with Fluid Cross-fade
    const tabs = document.querySelectorAll('.cat-btn');
    const sections = document.querySelectorAll('.menu-section');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        if (tab.classList.contains('active')) return;
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const targetCat = tab.getAttribute('data-category');
        
        // Smoothly fade out visible sections
        sections.forEach(sec => {
          sec.classList.add('menu-fade-out');
          sec.classList.remove('menu-fade-in');
        });

        setTimeout(() => {
          sections.forEach(sec => {
            const matches = targetCat === 'all' || sec.getAttribute('data-category') === targetCat;
            if (matches) {
              sec.style.display = 'block';
              // Force reflow
              void sec.offsetWidth;
              sec.classList.remove('menu-fade-out');
              sec.classList.add('menu-fade-in');
            } else {
              sec.style.display = 'none';
            }
          });
        }, 160);
      });
    });

    renderReceipt();
  }

  /* ==========================================================================
     08. BRUTALIST TOAST MESSENGER
     ========================================================================== */
  let toastTimer = null;
  function showToast(message) {
    let toast = document.querySelector('.toast-notice');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }

    toast.innerHTML = `<span>■</span> <span>${message}</span>`;
    toast.classList.add('show');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  /* ==========================================================================
     09. FORM DISPATCH ENGINE (Contact Page)
     ========================================================================== */
  function setupContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('c-name')?.value || 'ANONYMOUS';
      const email = document.getElementById('c-email')?.value || 'N/A';
      const message = document.getElementById('c-msg')?.value || '';

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'TRANSMITTING DISPATCH...';
      }

      setTimeout(() => {
        form.innerHTML = `
          <div style="padding: 40px; border: var(--border-thick); background: var(--bg); text-align: left;">
            <div class="stamp" style="margin-bottom: 16px;">DISPATCH FILED // 200 OK</div>
            <h3 style="font-family: var(--font-display); font-size: 2rem; margin-bottom: 12px;">TRANSMISSION RECEIVED.</h3>
            <p style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-muted); margin-bottom: 24px;">
              DISPATCH REF: #AG-${Math.floor(1000 + Math.random() * 9000)}<br>
              RESPONDENT: ${name.toUpperCase()} &lt;${email}&gt;<br>
              ESTIMATED RESPONSE TIMEFRAME: &lt; 4 SOLAR HOURS.
            </p>
            <button onclick="location.reload()" class="btn-brutal">FILE ANOTHER TRANSMISSION</button>
          </div>
        `;
        showToast('TRANSMISSION SUCCESSFUL');
      }, 700);
    });
  }

  /* ==========================================================================
     10. SMOOTH PAGE TRANSITIONS
     ========================================================================== */
  function setupPageTransitions() {
    // Reveal page smoothly
    requestAnimationFrame(() => {
      document.body.classList.add('page-ready');
    });

    // Intercept internal page navigations for buttery smooth departure
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (href && (href.endsWith('.html') || href === './') && !href.startsWith('http') && !href.startsWith('#') && !link.target) {
        link.addEventListener('click', (e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey) return;
          e.preventDefault();
          document.body.classList.add('is-leaving');
          setTimeout(() => {
            window.location.href = href;
          }, 180);
        });
      }
    });
  }

  function setupHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > 24) {
            header.classList.add('scrolled');
          } else {
            header.classList.remove('scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ==========================================================================
     11. INITIALIZATION
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    setupPageTransitions();
    setupHeaderScroll();
    applyTheme();
    updateNavSlipBadge();
    setupCustomCursor();
    setupHoverPreviews();
    setupMarqueeScroll();
    updateLiveTelemetry();
    setupReceiptSystem();
    setupContactForm();

    // Theme toggle
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', toggleTheme);
    }
  });

})();

