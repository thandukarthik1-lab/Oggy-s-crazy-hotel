const roomData = {
  suite: {
    name: "Oggy's Royal Suite",
    price: 8000,
    description: 'Our grandest hideaway, with a cloud-soft king bed, a private balcony, and plenty of room to keep your snacks safely under watch.',
    features: ['King-size bed', 'Private balcony', 'Premium interior', 'Up to 2 guests'],
    art: 'linear-gradient(180deg,#c8e9ff 0 58%,#f2dfbe 58%)'
  },
  party: {
    name: "Joey's Party Room",
    price: 5000,
    description: 'A colorful, party-ready escape with an entertainment system, stylish furniture, and a dance floor (also known as the rug).',
    features: ['Party decorations', 'Entertainment system', 'Stylish furniture', 'Up to 2 guests'],
    art: 'linear-gradient(160deg,#6154b5,#e582a0 70%,#ffc26a)'
  },
  food: {
    name: "Dee Dee's Food Lover Room",
    price: 4000,
    description: 'A modern, cozy room with its own mini refrigerator and complimentary snacks. We recommend guarding the fridge.',
    features: ['Modern interior', 'Mini refrigerator', 'Complimentary snacks', 'Up to 2 guests'],
    art: 'linear-gradient(180deg,#d9f0e2 0 58%,#f5deb8 58%)'
  },
  adventure: {
    name: "Marky's Adventure Room",
    price: 3500,
    description: 'Adventure-inspired decor, a ready-to-play gaming setup, and comfortable beds for recharging between quests.',
    features: ['Adventure decor', 'Gaming setup', 'Comfortable beds', 'Up to 2 guests'],
    art: 'linear-gradient(180deg,#bae5f2 0 60%,#d1ba8c 60%)'
  }
};

const form = document.querySelector('#booking-form');
const roomSelect = form.elements.room;
const checkin = form.elements.checkin;
const checkout = form.elements.checkout;
const estimateTotal = document.querySelector('#estimate-total');
const estimateHelp = document.querySelector('#estimate small');
const result = document.querySelector('#booking-result');
const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

function localDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function updateCheckoutMinimum() {
  const start = checkin.value;
  checkout.min = start || localDateString(new Date());
  if (checkout.value && start && checkout.value <= start) checkout.value = '';
  updateEstimate();
}

function updateEstimate() {
  const selectedRoom = roomData[roomSelect.value];
  const start = checkin.value ? new Date(`${checkin.value}T00:00:00`) : null;
  const end = checkout.value ? new Date(`${checkout.value}T00:00:00`) : null;
  if (!selectedRoom || !start || !end || end <= start) {
    estimateTotal.textContent = '—';
    estimateHelp.textContent = 'Choose a room and dates to calculate';
    return;
  }
  const nights = Math.round((end - start) / 86400000);
  estimateTotal.textContent = money.format(selectedRoom.price * nights);
  estimateHelp.textContent = `${nights} ${nights === 1 ? 'night' : 'nights'} × ${money.format(selectedRoom.price)} per night`;
}

checkin.min = localDateString(new Date());
checkout.min = checkin.min;
checkin.addEventListener('change', updateCheckoutMinimum);
checkout.addEventListener('change', updateEstimate);
roomSelect.addEventListener('change', updateEstimate);

form.addEventListener('input', () => {
  result.hidden = true;
  result.textContent = '';
});

form.addEventListener('submit', event => {
  event.preventDefault();
  result.hidden = true;
  if (!form.reportValidity()) return;

  const start = new Date(`${checkin.value}T00:00:00`);
  const end = new Date(`${checkout.value}T00:00:00`);
  if (end <= start) {
    checkout.setCustomValidity('Check-out must be at least one night after check-in.');
    checkout.reportValidity();
    checkout.setCustomValidity('');
    return;
  }
  const selectedRoom = roomData[roomSelect.value];
  const nights = Math.round((end - start) / 86400000);
  if (!selectedRoom) return;

  result.innerHTML = `<strong>You're on the guest list, ${escapeHTML(form.elements.name.value.trim())}!</strong><br>Your ${escapeHTML(selectedRoom.name)} request is in for ${nights} ${nights === 1 ? 'night' : 'nights'} (${money.format(selectedRoom.price * nights)} estimated). We can't wait to see you!`;
  result.hidden = false;
});

function escapeHTML(value) {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

document.querySelectorAll('[data-select-room]').forEach(link => {
  link.addEventListener('click', () => {
    const room = link.dataset.selectRoom;
    if (roomData[room]) {
      roomSelect.value = room;
      updateEstimate();
    }
  });
});

const dialog = document.querySelector('#room-dialog');
document.querySelectorAll('.details-button').forEach(button => {
  button.addEventListener('click', () => {
    const room = roomData[button.dataset.room];
    if (!room) return;
    document.querySelector('#dialog-title').textContent = room.name;
    document.querySelector('#dialog-description').textContent = room.description;
    document.querySelector('#dialog-price').textContent = `${money.format(room.price)} / night`;
    document.querySelector('#dialog-art').style.background = room.art;
    const features = document.querySelector('#dialog-features');
    features.replaceChildren(...room.features.map(feature => {
      const item = document.createElement('li');
      item.textContent = feature;
      return item;
    }));
    document.querySelector('#dialog-book').href = `#booking`;
    document.querySelector('#dialog-book').dataset.selectRoom = button.dataset.room;
    dialog.showModal();
  });
});
dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target === dialog) dialog.close();
});
document.querySelector('#dialog-book').addEventListener('click', event => {
  roomSelect.value = event.currentTarget.dataset.selectRoom;
  updateEstimate();
  dialog.close();
});

const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#primary-nav');
menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation menu' : 'Close navigation menu');
  navigation.classList.toggle('is-open', !isOpen);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  navigation.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation menu');
}));

const track = document.querySelector('.reviews-track');
let reviewIndex = 0;
function moveReviews(direction) {
  const cards = [...track.children];
  const visible = window.innerWidth <= 700 ? 1 : window.innerWidth <= 1000 ? 2 : 3;
  const maxIndex = Math.max(0, cards.length - visible);
  reviewIndex = Math.min(maxIndex, Math.max(0, reviewIndex + direction));
  const gap = parseFloat(getComputedStyle(track).gap) || 0;
  const cardWidth = cards[0].getBoundingClientRect().width;
  track.style.transform = `translateX(-${reviewIndex * (cardWidth + gap)}px)`;
}
document.querySelector('.review-prev').addEventListener('click', () => moveReviews(-1));
document.querySelector('.review-next').addEventListener('click', () => moveReviews(1));
window.addEventListener('resize', () => moveReviews(0));

function updateCountdown() {
  const now = new Date();
  const daysUntilSaturday = (6 - now.getDay() + 7) % 7 || 7;
  const nextWeekend = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSaturday);
  nextWeekend.setHours(0, 0, 0, 0);
  const remaining = Math.max(0, nextWeekend - now);
  const values = {
    'count-days': Math.floor(remaining / 86400000),
    'count-hours': Math.floor((remaining % 86400000) / 3600000),
    'count-minutes': Math.floor((remaining % 3600000) / 60000),
    'count-seconds': Math.floor((remaining % 60000) / 1000)
  };
  Object.entries(values).forEach(([id, value]) => {
    document.getElementById(id).textContent = String(value).padStart(2, '0');
  });
}
updateCountdown();
window.setInterval(updateCountdown, 1000);

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
} else {
  document.querySelectorAll('.reveal').forEach(element => element.classList.add('is-visible'));
}
