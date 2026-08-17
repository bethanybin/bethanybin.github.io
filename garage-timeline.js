const timelineStart = new Date('2015-01-01T00:00:00');
const now = new Date();
const timelineEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
const timelineEndValue = `${timelineEnd.getFullYear()}-${String(timelineEnd.getMonth() + 1).padStart(2, '0')}`;

const garageCars = [
  { name: '2014 Subaru XV Crosstrek', start: '2015-04', end: '2018-06', gaps: [{ start: '2016-09', end: '2017-07' }], miles: '~18k', kicker: 'car 01 · details coming soon', story: 'The story of this Crosstrek will go here. We can add how it entered the garage, memorable drives, modifications, and why it was time to move on.', tags: ['Subaru', 'XV Crosstrek'], color: '#cce8f8', images: [
    { src: 'assets/cars/subaru-xv-crosstrek/subaru-xv-01.jpg', alt: 'White 2014 Subaru XV Crosstrek parked outside a house', caption: '' },
    { src: 'assets/cars/subaru-xv-crosstrek/subaru-xv-02.jpg', alt: 'Subie the dog looking out of the passenger window of the white Subaru XV Crosstrek', caption: 'my dog subie in a subie' }
  ] },
  { name: '2018 Subaru WRX', start: '2018-06', end: '2020-05', miles: '~9k', kicker: 'car 02 · details coming soon', story: 'The story of this WRX will go here. Its ownership begins exactly when the Crosstrek ends, so the two bars meet without overlapping.', tags: ['Subaru', 'WRX'], color: '#79bce8', images: [
    { src: 'assets/cars/subaru-wrx/subaru-wrx-01.jpg', alt: 'Bethany standing beside her blue 2018 Subaru WRX', caption: '' },
    { src: 'assets/cars/subaru-wrx/subaru-wrx-02.jpg', alt: 'Front view of the blue 2018 Subaru WRX', caption: '' }
  ] },
  { name: '2005 Honda S2000', start: '2020-02', end: '2021-11', miles: '~5k', kicker: 'car 03 · details coming soon', story: 'The story of the first S2000 will go here, including what made this particular ownership chapter memorable.', tags: ['Honda', 'S2000'], color: '#d9d5cb' },
  { name: '2019 Honda Civic Type R', start: '2020-05', end: '2024-06', miles: '~52k', kicker: 'car 04 · details coming soon', story: 'The story of the 2019 Civic Type R will go here. Its bar begins exactly when the WRX ends, without a same-month overlap.', tags: ['Honda', 'Civic Type R'], color: '#98c9e9' },
  { name: '2022 Mazda MX-5', start: '2022-08', end: '2023-08', miles: '~5k', kicker: 'car 05 · details coming soon', story: 'The story of the MX-5 will go here. We can add ownership notes, favorite drives, photos, and the details that set it apart.', tags: ['Mazda', 'MX-5'], color: '#bfc8ae' },
  { name: '2005 Honda S2000', start: '2023-10', end: '2026-03', miles: '~7k', kicker: 'car 06 · the return', story: 'The story of the second 2005 S2000 will go here—and, especially, what brought you back to the same model for another chapter.', tags: ['Honda', 'S2000'], color: '#a7d4ee' },
  { name: '1997 Honda Civic Type R', start: '2024-04', end: null, miles: 'to be added', kicker: 'car 07 · currently owned', story: 'The ongoing story of the 1997 Civic Type R will go here. This entry remains open-ended on the timeline because it is still in the garage.', tags: ['Honda', 'Civic Type R', 'current'], color: '#d6e9f4' },
  { name: '2024 Honda Civic Type R', start: '2024-06', end: '2024-09', miles: '~3k', kicker: 'car 08 · details coming soon', story: 'The story of the 2024 Civic Type R will go here. This shorter ownership period is drawn proportionally on the timeline.', tags: ['Honda', 'Civic Type R'], color: '#79bce8' },
  { name: '2021 Honda Civic Type R', start: '2024-09', end: '2025-10', miles: '~16k', kicker: 'car 09 · details coming soon', story: 'The story of the 2021 Civic Type R will go here. Its bar begins exactly when the 2024 model ends, with no same-month overlap.', tags: ['Honda', 'Civic Type R'], color: '#cbd5d9' },
  { name: '2011 BMW 335d', start: '2025-07', end: '2026-07', miles: '~15k', kicker: 'car 10 · details coming soon', story: 'The story of the BMW 335d will go here. Its July 2026 endpoint meets the Civic Hybrid start without overlapping.', tags: ['BMW', '335d'], color: '#9ed4f5' },
  { name: '2005 Lotus Elise', start: '2025-08', end: '2025-10', miles: '<50', kicker: 'car 11 · a short chapter', story: 'The story of the Lotus Elise will go here. Its brief ownership period appears as a compact bar while remaining selectable.', tags: ['Lotus', 'Elise'], color: '#d8ccb7' },
  { name: '2011 Subaru Impreza WRX STi', start: '2025-11', end: null, miles: 'to be added', kicker: 'car 12 · currently owned', story: 'The ongoing story of the Subaru Impreza WRX STi will go here. This entry remains open-ended because it is still in the garage.', tags: ['Subaru', 'WRX STi', 'current'], color: '#9ecce9' },
  { name: '1991 Acura NSX', start: '2026-01', end: null, miles: 'to be added', kicker: 'car 13 · currently owned', story: 'The ongoing story of the Acura NSX will go here. This entry remains open-ended because it is still in the garage.', tags: ['Acura', 'NSX', 'current'], color: '#79bce8' },
  { name: '2026 Honda Civic Hybrid', start: '2026-07', end: null, miles: 'to be added', kicker: 'car 14 · currently owned', story: 'The ongoing story of the Civic Hybrid will go here. Its timeline begins as the BMW 335d chapter ends.', tags: ['Honda', 'Civic Hybrid', 'current'], color: '#cce8f8' }
];

const brandColors = {
  Subaru: '#9ecce9',
  'Honda / Acura': '#cce8f8',
  Mazda: '#d8ccb7',
  BMW: '#c9d0d4',
  Lotus: '#d7ddad'
};

const brandFor = (carName) => {
  if (carName.includes('Honda') || carName.includes('Acura')) return 'Honda / Acura';
  return Object.keys(brandColors).find((brand) => carName.includes(brand));
};

const monthDifference = (from, to) => {
  const start = new Date(`${from}-01T00:00:00`);
  const end = typeof to === 'string' ? new Date(`${to}-01T00:00:00`) : to;
  return (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth();
};

const totalMonths = monthDifference('2015-01', timelineEnd);
const formatMonth = (value) => {
  if (!value) return 'present';
  return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(new Date(`${value}-01T00:00:00`));
};

const canvas = document.querySelector('[data-timeline-canvas]');
const rows = document.querySelector('[data-timeline-rows]');
const years = document.querySelector('[data-timeline-years]');
const grid = document.querySelector('[data-timeline-grid]');
const viewport = document.querySelector('[data-timeline-viewport]');
const progress = document.querySelector('[data-scroll-progress]');
const brandLegend = document.querySelector('[data-brand-legend]');
let selectedIndex = 0;
let selectedImageIndex = 0;

function renderTimeline() {
  if (!canvas || !rows || !years || !grid) return;

  canvas.style.width = `${Math.max(totalMonths * 22, 1800)}px`;

  if (brandLegend) {
    const usedBrands = Object.keys(brandColors).filter((brand) => garageCars.some((car) => brandFor(car.name) === brand));
    brandLegend.innerHTML = `${usedBrands.map((brand) => `<span><i style="--legend-color: ${brandColors[brand]}"></i>${brand}</span>`).join('')}<span><i class="current-key"></i>current</span>`;
  }

  for (let monthOffset = 0; monthOffset <= totalMonths; monthOffset += 1) {
    const date = new Date(timelineStart.getFullYear(), timelineStart.getMonth() + monthOffset, 1);
    const month = date.getMonth();
    const left = (monthOffset / totalMonths) * 100;

    if (month === 0) {
      const yearLabel = document.createElement('span');
      yearLabel.className = 'year-label';
      yearLabel.style.left = `${left}%`;
      yearLabel.textContent = date.getFullYear();
      years.append(yearLabel);

      const gridLine = document.createElement('span');
      gridLine.className = 'year-line';
      gridLine.style.left = `${left}%`;
      grid.append(gridLine);
    } else if ([3, 6, 9].includes(month)) {
      const monthLabel = document.createElement('span');
      monthLabel.className = 'month-label';
      monthLabel.style.left = `${left}%`;
      monthLabel.textContent = new Intl.DateTimeFormat('en', { month: 'short' }).format(date);
      years.append(monthLabel);

      const gridLine = document.createElement('span');
      gridLine.className = 'quarter-line';
      gridLine.style.left = `${left}%`;
      grid.append(gridLine);
    }
  }

  garageCars.forEach((car, index) => {
    const startOffset = monthDifference('2015-01', car.start);
    const endDate = car.end || timelineEndValue;
    const duration = Math.max(monthDifference(car.start, endDate), 1);
    const row = document.createElement('div');
    row.className = 'timeline-row';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'car-period';
    button.style.left = `${(startOffset / totalMonths) * 100}%`;
    button.style.width = `${(duration / totalMonths) * 100}%`;
    button.style.setProperty('--car-color', brandColors[brandFor(car.name)] || car.color);
    button.dataset.carIndex = index;
    button.dataset.startRatio = startOffset / totalMonths;
    if (!car.end) button.classList.add('is-current');
    button.setAttribute('aria-pressed', index === selectedIndex ? 'true' : 'false');
    button.setAttribute('aria-label', `${car.name}, owned ${formatMonth(car.start)} to ${formatMonth(car.end)}`);
    const gapMarkup = (car.gaps || []).map((gap) => {
      const gapStart = monthDifference(car.start, gap.start);
      const gapDuration = monthDifference(gap.start, gap.end);
      return `<span class="ownership-gap" style="left: ${(gapStart / duration) * 100}%; width: ${(gapDuration / duration) * 100}%" aria-hidden="true"></span>`;
    }).join('');
    button.innerHTML = `<span class="period-number">${String(index + 1).padStart(2, '0')}</span><strong>${car.name}</strong>${gapMarkup}`;
    button.addEventListener('click', () => selectCar(index));
    row.append(button);
    rows.append(row);
  });

  selectCar(garageCars.length - 1, false);
  requestAnimationFrame(() => {
    updateCompactStates();
    viewport.scrollLeft = viewport.scrollWidth - viewport.clientWidth;
    updateProgress();
  });
}

function updateCompactStates() {
  const buttons = document.querySelectorAll('.car-period');

  buttons.forEach((button) => button.classList.remove('is-compact', 'label-before'));

  buttons.forEach((button) => {
    const name = button.querySelector('strong');
    const nameWidth = name.scrollWidth + 30;

    if (button.clientWidth < nameWidth) {
      button.classList.add('is-compact');
      if (Number(button.dataset.startRatio) > .82) button.classList.add('label-before');
    }
  });
}

function selectCar(index, scroll = true) {
  selectedIndex = (index + garageCars.length) % garageCars.length;
  const car = garageCars[selectedIndex];
  const buttons = document.querySelectorAll('.car-period');

  buttons.forEach((button, buttonIndex) => {
    button.setAttribute('aria-pressed', buttonIndex === selectedIndex ? 'true' : 'false');
  });

  document.querySelector('[data-selected-car-index]').textContent = String(selectedIndex + 1).padStart(2, '0');
  document.querySelector('[data-car-total]').textContent = garageCars.length;
  document.querySelector('[data-car-name]').textContent = car.name;
  document.querySelector('[data-car-kicker]').textContent = car.kicker;
  const gapMonths = (car.gaps || []).reduce((total, gap) => total + monthDifference(gap.start, gap.end), 0);
  document.querySelector('[data-car-owned]').textContent = `${formatMonth(car.start)}—${formatMonth(car.end)}${gapMonths ? ` · ${gapMonths}-mo gap` : ''}`;
  document.querySelector('[data-car-miles]').textContent = car.miles;
  document.querySelector('[data-car-status]').textContent = car.end ? 'sold' : 'currently owned';
  document.querySelector('[data-car-story]').textContent = car.story;
  document.querySelector('[data-car-monogram]').textContent = car.name.split(' ').slice(-2).map((word) => word[0]).join('');
  document.querySelector('[data-car-color]').style.setProperty('--selected-car-color', car.color);
  document.querySelector('[data-car-tags]').innerHTML = car.tags.map((tag) => `<span>${tag}</span>`).join('');
  selectedImageIndex = 0;
  renderGallery(car);

  if (scroll && buttons[selectedIndex]) {
    const selectedButton = buttons[selectedIndex];
    const left = selectedButton.offsetLeft - (viewport.clientWidth / 2) + (selectedButton.offsetWidth / 2);
    viewport.scrollTo({ left, behavior: 'smooth' });
  }
}

function renderGallery(car) {
  const gallery = document.querySelector('[data-car-color]');
  const image = document.querySelector('[data-gallery-image]');
  const controls = document.querySelector('[data-gallery-controls]');
  const caption = document.querySelector('[data-car-photo-caption]');
  const photos = car.images || [];

  gallery.classList.toggle('has-images', photos.length > 0);
  image.hidden = photos.length === 0;
  controls.hidden = photos.length < 2;

  if (photos.length === 0) {
    image.removeAttribute('src');
    image.alt = '';
    caption.hidden = false;
    caption.textContent = 'replace with your photo';
    return;
  }

  selectedImageIndex = (selectedImageIndex + photos.length) % photos.length;
  const photo = photos[selectedImageIndex];
  image.src = photo.src;
  image.alt = photo.alt || `${car.name}, photo ${selectedImageIndex + 1}`;
  const captionText = photo.caption ?? car.name;
  caption.textContent = captionText;
  caption.hidden = captionText.length === 0;
  document.querySelector('[data-gallery-index]').textContent = selectedImageIndex + 1;
  document.querySelector('[data-gallery-total]').textContent = photos.length;
}

function updateProgress() {
  if (!viewport || !progress) return;
  const scrollable = viewport.scrollWidth - viewport.clientWidth;
  const ratio = scrollable > 0 ? viewport.scrollLeft / scrollable : 0;
  progress.style.transform = `translateX(${ratio * 400}%)`;
}

function activeOwnershipMonths(car) {
  const calendarMonths = monthDifference(car.start, car.end || timelineEndValue);
  const gapMonths = (car.gaps || []).reduce((total, gap) => total + monthDifference(gap.start, gap.end), 0);
  return calendarMonths - gapMonths;
}

function mileageValue(value) {
  if (!value || value === 'to be added') return null;
  const amount = Number(value.match(/[\d.]+/)?.[0]);
  if (!Number.isFinite(amount)) return null;
  return { miles: value.toLowerCase().includes('k') ? amount * 1000 : amount, bounded: value.startsWith('<') };
}

function formatMileageTotal(cars) {
  const values = cars.map((car) => mileageValue(car.miles)).filter(Boolean);
  if (values.length === 0) return '—';
  const total = values.reduce((sum, value) => sum + value.miles, 0);
  if (total < 1000) return values.every((value) => value.bounded) ? `<${Math.round(total)}` : `~${Math.round(total)}`;
  return `~${Math.round(total / 1000)}k`;
}

function formatMonthAverage(value) {
  if (!Number.isFinite(value)) return '—';
  return `${Number.isInteger(value) ? value : value.toFixed(1)} mo`;
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function peakConcurrentOwnership() {
  const firstMonth = timelineStart.getFullYear() * 12 + timelineStart.getMonth();
  const lastMonth = timelineEnd.getFullYear() * 12 + timelineEnd.getMonth();
  let peak = 0;

  for (let month = firstMonth; month < lastMonth; month += 1) {
    const active = garageCars.filter((car) => {
      const start = new Date(`${car.start}-01T00:00:00`);
      const end = new Date(`${car.end || timelineEndValue}-01T00:00:00`);
      const startsBefore = start.getFullYear() * 12 + start.getMonth() <= month;
      const endsAfter = month < end.getFullYear() * 12 + end.getMonth();
      const inGap = (car.gaps || []).some((gap) => {
        const gapStart = new Date(`${gap.start}-01T00:00:00`);
        const gapEnd = new Date(`${gap.end}-01T00:00:00`);
        return gapStart.getFullYear() * 12 + gapStart.getMonth() <= month && month < gapEnd.getFullYear() * 12 + gapEnd.getMonth();
      });
      return startsBefore && endsAfter && !inGap;
    }).length;
    peak = Math.max(peak, active);
  }

  return peak;
}

function renderStats() {
  const summary = document.querySelector('[data-stats-summary]');
  const brandRows = document.querySelector('[data-brand-stats]');
  const highlights = document.querySelector('[data-stats-highlights]');
  if (!summary || !brandRows || !highlights) return;

  const completed = garageCars.filter((car) => car.end);
  const current = garageCars.filter((car) => !car.end);
  const civicCount = garageCars.filter((car) => /\bCivic\b/i.test(car.name)).length;
  const completedDurations = completed.map(activeOwnershipMonths);

  document.querySelector('[data-stats-title-count]').textContent = garageCars.length;
  summary.innerHTML = [
    ['total cars', garageCars.length],
    ['currently owned', current.length],
    ['Civics owned', civicCount],
    ['known miles added', formatMileageTotal(garageCars)]
  ].map(([label, value]) => `<article><p>${label}</p><strong>${value}</strong></article>`).join('');

  const brandGroups = Object.keys(brandColors).map((brand) => {
    const cars = garageCars.filter((car) => brandFor(car.name) === brand);
    const elapsedAverage = cars.map(activeOwnershipMonths).reduce((sum, value) => sum + value, 0) / cars.length;
    return { brand, cars, elapsedAverage };
  });

  const allElapsedAverage = garageCars.map(activeOwnershipMonths).reduce((sum, value) => sum + value, 0) / garageCars.length;
  brandRows.innerHTML = `${brandGroups.map((group) => `<tr><th>${group.brand}</th><td>${group.cars.length}</td><td>${formatMonthAverage(group.elapsedAverage)}</td><td>${formatMileageTotal(group.cars)}</td></tr>`).join('')}<tr class="total-row"><th>overall</th><td>${garageCars.length}</td><td>${formatMonthAverage(allElapsedAverage)}</td><td>${formatMileageTotal(garageCars)}</td></tr>`;

  const longest = completed.reduce((best, car) => activeOwnershipMonths(car) > activeOwnershipMonths(best) ? car : best);
  const shortest = completed.reduce((best, car) => activeOwnershipMonths(car) < activeOwnershipMonths(best) ? car : best);
  const carsWithMileage = garageCars.filter((car) => mileageValue(car.miles));
  const mostMiles = carsWithMileage.reduce((best, car) => mileageValue(car.miles).miles > mileageValue(best.miles).miles ? car : best);
  const hondaCount = garageCars.filter((car) => brandFor(car.name) === 'Honda / Acura').length;
  const notable = [
    ['longest ownership', longest.name, `${activeOwnershipMonths(longest)} months`],
    ['shortest ownership', shortest.name, `${activeOwnershipMonths(shortest)} months`],
    ['most miles added', mostMiles.name, mostMiles.miles],
    ['median completed ownership', 'across 10 completed cars', formatMonthAverage(median(completedDurations))],
    ['peak garage', 'simultaneously owned', `${peakConcurrentOwnership()} cars`],
    ['Honda / Acura share', `${hondaCount} of ${garageCars.length} cars`, `${Math.round(hondaCount / garageCars.length * 100)}%`]
  ];
  highlights.innerHTML = notable.map(([label, name, value]) => `<article><p>${label}</p><h3>${name}</h3><strong>${value}</strong></article>`).join('');
}

const garageTabs = document.querySelectorAll('[data-garage-tab]');
const garagePanels = document.querySelectorAll('[data-garage-panel]');

function activateGarageView(view) {
  garageTabs.forEach((tab) => {
    const selected = tab.dataset.garageTab === view;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  garagePanels.forEach((panel) => { panel.hidden = panel.dataset.garagePanel !== view; });
  if (view === 'stats') renderStats();
  if (view === 'timeline') requestAnimationFrame(updateCompactStates);
}

garageTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateGarageView(tab.dataset.garageTab));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextTab = garageTabs[(index + direction + garageTabs.length) % garageTabs.length];
    activateGarageView(nextTab.dataset.garageTab);
    nextTab.focus();
  });
});

document.querySelectorAll('[data-scroll-timeline]').forEach((button) => {
  button.addEventListener('click', () => {
    const direction = button.dataset.scrollTimeline === 'forward' ? 1 : -1;
    viewport.scrollBy({ left: viewport.clientWidth * .7 * direction, behavior: 'smooth' });
  });
});

document.querySelectorAll('[data-jump-timeline]').forEach((button) => {
  button.addEventListener('click', () => {
    const atPresent = button.dataset.jumpTimeline === 'present';
    viewport.scrollTo({ left: atPresent ? viewport.scrollWidth : 0, behavior: 'smooth' });
  });
});

document.querySelector('[data-select-car="previous"]')?.addEventListener('click', () => selectCar(selectedIndex - 1));
document.querySelector('[data-select-car="next"]')?.addEventListener('click', () => selectCar(selectedIndex + 1));
document.querySelectorAll('[data-gallery-direction]').forEach((button) => {
  button.addEventListener('click', () => {
    selectedImageIndex += button.dataset.galleryDirection === 'next' ? 1 : -1;
    renderGallery(garageCars[selectedIndex]);
  });
});
viewport?.addEventListener('scroll', updateProgress, { passive: true });
window.addEventListener('resize', updateCompactStates);
document.fonts?.ready.then(updateCompactStates);

renderTimeline();
updateProgress();
