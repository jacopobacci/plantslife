const searchPlantImg = document.querySelector('.create-plant__search-input');
const searchPlantImgBtn = document.querySelector('.create-plant__search-btn');
const plantName = document.getElementById('plant-name');

window.addEventListener('load', (e) => {
  if (!disabledInput.value.includes('cloudinary')) {
    searchPlantImg.setAttribute('value', plantName.value);
    searchPlantImgBtn.click();
  }
});
