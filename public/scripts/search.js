const searchBtn = document.querySelector('.create-plant__search-btn');
const searchInput = document.querySelector('.create-plant__search-input');
const card = document.querySelector('.create-plant__cards');
const carouselImgs = document.getElementById('carousel-imgs');
const searchResults = document.querySelector('.create-plant__search-img');
const nameInput = document.querySelector('.name-input');
const selectImgBtn = document.getElementById('select-img-btn');
const disabledInput = document.getElementById('disabled-input');

searchBtn.addEventListener('click', (e) => {
  e.preventDefault();
  carouselImgs.innerHTML = '';
  getPlantImage(searchInput.value);
  if (searchInput.value === '') nameInput.value = searchInput.value;
  searchInput.value = '';
});

const getPlantImage = async (input) => {
  try {
    const res = await axios.get(`/api/image/${input}`);
    const data = res.data.hits;
    for (let i = 0; i < data.length; i++) {
      carouselImgs.insertAdjacentHTML(
        'beforeend',
        `
                  <div class="carousel-item ${i === 0 && 'active'}">
                    <img
                      src="${data[i].largeImageURL}"
                      class="d-block w-100 rounded carousel-img"
                      alt="${data[i].tags}"
                      id="${data[i].id}-plant-img"
                    />
                  </div>
          `
      );
    }

    searchResults.style.display = 'flex';
  } catch (e) {
    console.log('Error!', e.message);
  }
};

selectImgBtn.addEventListener('click', () => {
  showAlert();
  const active = document.querySelector('.carousel-item.active img');
  let imgSrc = active.getAttribute('src');
  disabledInput.value = imgSrc;
});

const showAlert = () => {
  card.insertAdjacentHTML(
    'beforeend',
    `
  <div class="alert alert-msg alert-success alert-dismissible fade show col-md-4 col-6 m-3 bottom-0 end-0 p-3" role="alert" style='position:fixed'>
    Image selected!
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  </div>
  `
  );
  const toast = document.querySelector('.alert-msg');
  setTimeout(() => {
    toast.style.opacity = '0';
  }, 2500);
  setTimeout(() => {
    toast.remove();
  }, 3000);
};
