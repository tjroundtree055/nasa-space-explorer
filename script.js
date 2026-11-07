'use strict';
const $ = id => document.getElementById(id);
const DAY = 86400000;
const facts = ['Sunlight takes about eight minutes to reach Earth.', 'Venus takes longer to rotate once than it takes to orbit the Sun.', 'Jupiter is the largest planet in our solar system.', 'The Milky Way is the galaxy that contains our solar system.', 'The Moon’s gravity causes most of Earth’s ocean tides.'];
$('fact').textContent = facts[Math.floor(Math.random() * facts.length)];
const iso = date => date.toISOString().slice(0, 10);
const today = iso(new Date());
for (const input of [$('start'), $('end')]) { input.min = '1995-06-16'; input.max = today; }
$('end').value = today;
$('start').value = iso(new Date(Date.parse(today) - 8 * DAY));
const formatDate = date => new Intl.DateTimeFormat('en-US', {month:'long', day:'numeric', year:'numeric', timeZone:'UTC'}).format(new Date(date + 'T12:00:00Z'));
function safeUrl(value) { try { const url = new URL(value); return url.protocol === 'https:' ? url.href : null; } catch { return null; } }
function image(url, title) { const img = document.createElement('img'); img.src = url; img.alt = title; img.loading = 'lazy'; img.addEventListener('error', () => { img.replaceWith(document.createTextNode('Preview unavailable — open details to view original media.')); }); return img; }
function openDetails(item) {
  $('media').replaceChildren();
  const url = safeUrl(item.hdurl) || safeUrl(item.url);
  if (item.media_type === 'image' && url) $('media').append(image(url, item.title));
  else { const message = document.createElement('p'); message.className = 'details'; message.textContent = 'This APOD entry is a video. Use the link below to watch it on the original provider.'; $('media').append(message); }
  $('modal-title').textContent = item.title;
  $('modal-date').textContent = formatDate(item.date);
  $('explanation').textContent = item.explanation || 'No explanation supplied.';
  $('credit').textContent = item.copyright ? 'Image credit: ' + item.copyright : 'Source: NASA Astronomy Picture of the Day';
  $('original').hidden = !url;
  if (url) $('original').href = url;
  $('modal').showModal();
}
$('close').addEventListener('click', () => $('modal').close());
$('modal').addEventListener('click', event => { if (event.target === $('modal')) { const box = $('modal').getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) $('modal').close(); } });
function render(items) {
  const cards = items.map(item => {
    const card = document.createElement('button'); card.type = 'button'; card.className = 'card'; card.setAttribute('aria-label', 'View ' + item.title);
    const visual = document.createElement('span'); visual.className = 'visual';
    const preview = safeUrl(item.media_type === 'image' ? item.url : item.thumbnail_url);
    if (preview) visual.append(image(preview, item.title));
    else { const label = document.createElement('span'); label.className = 'video-label'; label.textContent = item.media_type === 'video' ? '▶ Watch space video' : 'Open space discovery'; visual.append(label); }
    const text = document.createElement('span'); text.className = 'card-text';
    const date = document.createElement('small'); date.textContent = formatDate(item.date) + (item.media_type === 'video' ? ' · VIDEO' : '');
    const title = document.createElement('h3'); title.textContent = item.title;
    text.append(date, title); card.append(visual, text); card.addEventListener('click', () => openDetails(item)); return card;
  });
  $('gallery').replaceChildren(...cards); $('count').textContent = items.length + ' discoveries';
}
async function load(event) {
  if (event) event.preventDefault();
  $('error').hidden = true;
  const start = $('start').value, end = $('end').value;
  if (!start || !end || start < '1995-06-16' || end > today || Date.parse(end) - Date.parse(start) !== 8 * DAY) { $('error').textContent = 'Select exactly 9 consecutive days, including both dates, between June 16, 1995 and today.'; $('error').hidden = false; return; }
  $('loading').hidden = false; $('submit').disabled = true; $('gallery').setAttribute('aria-busy', 'true'); $('gallery').replaceChildren(); $('count').textContent = 'Exploring…';
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const params = new URLSearchParams({api_key:'DEMO_KEY', start_date:start, end_date:end, thumbs:'true'});
    const response = await fetch('https://api.nasa.gov/planetary/apod?' + params, {signal:controller.signal});
    if (!response.ok) throw new Error(response.status === 429 ? 'NASA’s demo API limit was reached. Please try again later.' : 'NASA could not return this date range (HTTP ' + response.status + '). Please try again.');
    const data = await response.json();
    if (!Array.isArray(data) || data.length !== 9) throw new Error('NASA did not return all 9 entries. Please try an earlier nine-day range.');
    data.sort((a,b) => a.date.localeCompare(b.date));
    if (data.some((item,i) => item.date !== iso(new Date(Date.parse(start) + i * DAY)))) throw new Error('NASA returned an incomplete date sequence. Please try again.');
    render(data);
  } catch (error) { $('error').textContent = error.name === 'AbortError' ? 'The request timed out. Please try again.' : error instanceof TypeError ? 'Could not connect to NASA. Check your connection and try again.' : error.message; $('error').hidden = false; $('count').textContent = 'Try another search'; }
  finally { clearTimeout(timeout); $('loading').hidden = true; $('submit').disabled = false; $('gallery').setAttribute('aria-busy', 'false'); }
}
$('search').addEventListener('submit', load);
load();
