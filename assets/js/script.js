// STB Electrical Services dynamic content script
(function() {
  const DATA_URL = 'data.json';
  const aboutContentEl = document.getElementById('aboutContent');
  const servicesListEl = document.getElementById('servicesList');
  const galleryGridEl = document.getElementById('galleryGrid');
  const galleryFiltersEl = document.getElementById('galleryFilters');
  const contactContentEl = document.getElementById('contactContent');
  const yearEl = document.getElementById('year');
  const form = document.getElementById('contactForm');
  const formStatusEl = document.getElementById('formStatus');

  yearEl.textContent = new Date().getFullYear();

  // Mobile nav toggle
  const navToggleBtn = document.querySelector('.nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  navToggleBtn?.addEventListener('click', () => {
    const expanded = navToggleBtn.getAttribute('aria-expanded') === 'true';
    navToggleBtn.setAttribute('aria-expanded', String(!expanded));
    navMenu.classList.toggle('open');
  });

  async function loadData() {
    try {
      const res = await fetch(DATA_URL, { cache: 'no-store' });
      if(!res.ok) throw new Error('Failed to load data.json');
      const data = await res.json();
      populate(data);
    } catch (err) {
      console.error(err);
  aboutContentEl.innerHTML = '<p style="color:#ffe600">Content failed to load. Please ensure data.json is present.</p>';
    }
  }

  function populate(data) {
    buildAbout(data.about);
    buildServices(data.services);
    buildGallery(data.gallery);
    buildContact(data.contact);
    updateSchema(data);
  }

  function buildAbout(about) {
    if(!about) return;
    let html = '';
    if(about.paragraphs && Array.isArray(about.paragraphs)) {
      html += about.paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('');
    }
    if(about.points && about.points.length) {
      html += '<ul>' + about.points.map(pt => `<li>${escapeHtml(pt)}</li>`).join('') + '</ul>';
    }
    if(about.licenses && about.licenses.length) {
      html += '<div class="licenses"><strong>Licenses & Accreditations:</strong><ul>' + about.licenses.map(l => `<li>${escapeHtml(l)}</li>`).join('') + '</ul></div>';
    }
    aboutContentEl.innerHTML = html;
  }

  function buildServices(services) {
    if(!Array.isArray(services)) return;
    servicesListEl.innerHTML = services.map(s => `
      <li>
        <h3>${escapeHtml(s.title)}</h3>
        ${s.description ? `<p>${escapeHtml(s.description)}</p>` : ''}
      </li>`).join('');
  }

  function buildGallery(gallery) {
    if(!gallery || !Array.isArray(gallery.items)) return;
    const categories = Array.from(new Set(gallery.items.map(i => i.category).filter(Boolean)));
    galleryFiltersEl.innerHTML = '<button data-filter="all" class="active">All</button>' + categories.map(c => `<button data-filter="${escapeAttr(c)}">${escapeHtml(c)}</button>`).join('');
    galleryFiltersEl.addEventListener('click', e => {
      const btn = e.target.closest('button');
      if(!btn) return;
      document.querySelectorAll('.gallery-filters button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      renderGalleryItems(gallery.items, filter);
    });
    renderGalleryItems(gallery.items, 'all');
  }

  function renderGalleryItems(items, filter) {
    galleryGridEl.innerHTML = items.filter(i => filter === 'all' || i.category === filter).map(i => `
      <figure class="gallery-item">
        <img src="${escapeAttr(i.src)}" alt="${escapeAttr(i.alt || i.caption || 'Work sample')}" loading="lazy" data-caption="${escapeAttr(i.caption || '')}" />
        ${i.caption ? `<figcaption class="caption">${escapeHtml(i.caption)}</figcaption>` : ''}
      </figure>`).join('');
    bindLightboxEvents();
  }

  function buildContact(contact) {
    if(!contact) return;
    let html = '';
    if(contact.phone) html += `<div><strong>Phone:</strong> <a href="tel:${escapeAttr(contact.phone)}">${escapeHtml(contact.phone)}</a></div>`;
    if(contact.email) html += `<div><strong>Email:</strong> <a href="mailto:${escapeAttr(contact.email)}">${escapeHtml(contact.email)}</a></div>`;
    if(contact.address && contact.address.full) html += `<div><strong>Address:</strong> ${escapeHtml(contact.address.full)}</div>`;
    if(contact.emergencyHours) html += `<div><strong>Emergency Service:</strong> ${escapeHtml(contact.emergencyHours)}</div>`;
    if(contact.serviceAreas && contact.serviceAreas.length) html += `<div><strong>Service Areas:</strong> ${contact.serviceAreas.map(a => escapeHtml(a)).join(', ')}</div>`;
    contactContentEl.innerHTML = html;
  }

  function updateSchema(data) {
    try {
      const scriptEl = document.getElementById('structured-data');
      const schema = JSON.parse(scriptEl.textContent);
      if(data.business) {
        schema.name = data.business.name || schema.name;
        if(data.business.telephone) schema.telephone = data.business.telephone;
        if(data.business.url) schema.url = data.business.url;
        if(data.business.address) {
          schema.address.streetAddress = data.business.address.streetAddress || '';
          schema.address.addressLocality = data.business.address.locality || '';
          schema.address.postalCode = data.business.address.postalCode || '';
          if(data.business.geo) {
            schema.geo.latitude = data.business.geo.lat || '';
            schema.geo.longitude = data.business.geo.lng || '';
          }
        }
        if(Array.isArray(data.business.openingHours)) {
          schema.openingHoursSpecification = data.business.openingHours.map(h => ({
            '@type': 'OpeningHoursSpecification',
            'dayOfWeek': h.days,
            'opens': h.opens,
            'closes': h.closes
          }));
        }
      }
      scriptEl.textContent = JSON.stringify(schema, null, 2);
    } catch(e) { console.warn('Schema update failed', e); }
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>'"]/g, s => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[s]));
  }
  function escapeAttr(str) { return escapeHtml(str).replace(/"/g, '&quot;'); }

  // Simple mock submit (no backend) - adapt later
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    formStatusEl.textContent = '';
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get('name')||'').trim(),
      email: String(formData.get('email')||'').trim(),
      phone: String(formData.get('phone')||'').trim(),
      message: String(formData.get('message')||'').trim(),
      honeypot: String(formData.get('honeypot')||'').trim()
    };
    if(!payload.name || !payload.email || !payload.message) {
      formStatusEl.textContent = 'Please fill required fields.';
      formStatusEl.style.color = '#d40000';
      return;
    }
    formStatusEl.textContent = 'Sending…';
    formStatusEl.style.color = '#111';
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if(res.ok && data.ok) {
        formStatusEl.textContent = 'Thank you — your request has been sent.';
        formStatusEl.style.color = '#0a7128';
        form.reset();
      } else {
        throw new Error(data.error || 'Failed to send');
      }
    } catch(err) {
      console.error(err);
      formStatusEl.textContent = 'Error sending request. Please try again later.';
      formStatusEl.style.color = '#d40000';
    }
  });

  // Kick off
  loadData();
})();

// Lightbox logic
function bindLightboxEvents() {
  const grid = document.getElementById('galleryGrid');
  const lb = document.getElementById('lightbox');
  if(!grid || !lb) return;
  const imgEl = document.getElementById('lightboxImg');
  const capEl = document.getElementById('lightboxCaption');
  const closeBtn = document.querySelector('.lightbox-close');

  grid.querySelectorAll('img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => openLightbox(img));
    img.addEventListener('keydown', e => { if(e.key === 'Enter') openLightbox(img); });
    img.setAttribute('tabindex','0');
  });

  function openLightbox(srcImg) {
    imgEl.src = srcImg.src;
    imgEl.alt = srcImg.alt;
    capEl.textContent = srcImg.getAttribute('data-caption') || srcImg.alt || '';
    lb.classList.remove('hidden');
    previousFocus = document.activeElement;
    closeBtn.focus();
    trapFocus(lb);
  }

  function closeLightbox() {
    lb.classList.add('hidden');
    imgEl.src = '';
    capEl.textContent = '';
    if(previousFocus && previousFocus.focus) previousFocus.focus();
  }

  let previousFocus = null;
  closeBtn.addEventListener('click', closeLightbox);
  lb.addEventListener('click', e => { if(e.target === lb) closeLightbox(); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && !lb.classList.contains('hidden')) closeLightbox(); });
}

function trapFocus(container) {
  const focusable = container.querySelectorAll('button, [href], input, textarea, [tabindex]:not([tabindex="-1"])');
  if(!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length -1];
  container.addEventListener('keydown', e => {
    if(e.key !== 'Tab') return;
    if(e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
}
