(function () {

  /* ==========================================
     Grain texture (generated canvas noise)
     ========================================== */

  (function () {
    var c = document.createElement('canvas');
    var ctx = c.getContext('2d');
    c.width = 150;
    c.height = 150;
    var d = ctx.createImageData(150, 150);
    for (var i = 0; i < d.data.length; i += 4) {
      var v = Math.random() * 255;
      d.data[i] = v;
      d.data[i + 1] = v;
      d.data[i + 2] = v;
      d.data[i + 3] = 18;
    }
    ctx.putImageData(d, 0, 0);
    var el = document.querySelector('.grain');
    if (el) el.style.backgroundImage = 'url(' + c.toDataURL('image/png') + ')';
  })();

  /* ==========================================
     Ember particles (CSS-animated divs)
     ========================================== */

  (function () {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    var count = 32;
    for (var i = 0; i < count; i++) {
      var e = document.createElement('div');
      e.className = 'ember';
      e.style.left = Math.random() * 100 + '%';
      var dur = Math.random() * 8 + 6;
      e.style.setProperty('--duration', dur + 's');
      e.style.setProperty('--drift-duration', (Math.random() * 5 + 3) + 's');
      // Negative delay so particles are already mid-flight on load
      e.style.animationDelay = -(Math.random() * dur) + 's';
      var size = Math.random() * 2.5 + 0.8;
      e.style.width = size + 'px';
      e.style.height = size + 'px';
      // Larger particles get a glow
      if (size > 2) {
        e.style.boxShadow = '0 0 ' + (size * 3) + 'px rgba(232,148,58,0.35)';
      }
      hero.appendChild(e);
    }
  })();

  /* ==========================================
     Stats
     ========================================== */

  var countries = new Set(
    LOCATIONS.map(function (loc) { return loc.name.split(',').pop().trim(); })
  );

  document.querySelectorAll('.stat-number').forEach(function (el) {
    if (el.dataset.stat === 'locations') el.dataset.target = LOCATIONS.length;
    if (el.dataset.stat === 'countries') el.dataset.target = countries.size;
  });

  /* ==========================================
     Map
     ========================================== */

  var bounds = L.latLngBounds(LOCATIONS.map(function (loc) { return loc.coords; }));

  var map = L.map('map', {
    zoomControl: true,
    scrollWheelZoom: false
  }).fitBounds(bounds.pad(0.5));

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
  }).addTo(map);

  // Journey line connecting sightings
  if (LOCATIONS.length > 1) {
    L.polyline(
      LOCATIONS.map(function (loc) { return loc.coords; }),
      {
        color: '#E8943A',
        weight: 1.5,
        opacity: 0.18,
        dashArray: '5 10',
        lineCap: 'round'
      }
    ).addTo(map);
  }

  // Flame marker with pulsing glow
  var markerHtml = [
    '<div class="marker-inner">',
    '<div class="marker-glow"></div>',
    '<svg width="22" height="30" viewBox="0 0 22 30" xmlns="http://www.w3.org/2000/svg">',
    '<path d="M11 0C11 0 1 11 1 19C1 24.5 5.5 29 11 29C16.5 29 21 24.5 21 19C21 11 11 0 11 0Z" fill="#E8943A"/>',
    '<path d="M11 9C11 9 6 15 6 19C6 21.8 8.2 24 11 24C13.8 24 16 21.8 16 19C16 15 11 9 11 9Z" fill="#FBBF24"/>',
    '</svg>',
    '</div>'
  ].join('');

  var flameIcon = L.divIcon({
    className: 'flame-marker',
    html: markerHtml,
    iconSize: [48, 48],
    iconAnchor: [24, 36],
    popupAnchor: [0, -38]
  });

  // Place markers
  LOCATIONS.forEach(function (loc, i) {
    var marker = L.marker(loc.coords, {
      icon: flameIcon,
      opacity: 0
    }).addTo(map);

    var html = '<div class="popup-name">' + loc.name + '</div>';
    if (loc.date) {
      html += '<div class="popup-date">' + formatDate(loc.date) + '</div>';
    }
    if (loc.socialUrl && loc.username) {
      html += '<a href="' + loc.socialUrl + '" target="_blank" rel="noopener" class="popup-link">@' + loc.username + '</a>';
    } else if (loc.socialUrl) {
      html += '<a href="' + loc.socialUrl + '" target="_blank" rel="noopener" class="popup-link">View post</a>';
    }
    marker.bindPopup(html);

    // Staggered fade-in
    setTimeout(function () {
      marker.setOpacity(1);
    }, 600 + i * 280);

    marker.on('click', function () {
      map.flyTo(loc.coords, 10, { duration: 1.2 });
    });
  });

  // Enable scroll zoom on first click
  map.once('click', function () {
    map.scrollWheelZoom.enable();
  });

  /* ==========================================
     Counter animation
     ========================================== */

  function animateCounters() {
    document.querySelectorAll('.stat-number').forEach(function (el) {
      var target = parseInt(el.dataset.target, 10);
      if (!target || target <= 0) return;

      // Don't animate small numbers — just show them
      if (target < 10) {
        el.textContent = target;
        return;
      }

      var duration = 1500;
      var start = performance.now();

      function tick(now) {
        var progress = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 4);
        el.textContent = Math.round(target * eased);
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  /* ==========================================
     Scroll reveal (Intersection Observer)
     ========================================== */

  var counterTriggered = false;
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');

        if (entry.target.classList.contains('stats') && !counterTriggered) {
          counterTriggered = true;
          animateCounters();
        }

        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(function (el) {
    observer.observe(el);
  });

  /* ==========================================
     Helpers
     ========================================== */

  function formatDate(dateStr) {
    var d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

})();
