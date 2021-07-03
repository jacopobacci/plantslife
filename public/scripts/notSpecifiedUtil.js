const plantNotes = document.querySelectorAll('.plant-notes');
const tds = document.querySelectorAll('td');

plantNotes.forEach((p) => {
  if (p.innerText === '') p.innerText = 'N/S';
});

tds.forEach((t) => {
  if (t.innerText === '' || t.innerText === 'Choose...') t.innerText = 'N/S';
});
