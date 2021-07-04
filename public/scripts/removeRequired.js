const uploadImageUrl = document.getElementById('uploadImageUrl');
const readonlyInput = document.getElementById('disabled-input');

uploadImageUrl.addEventListener('click', () => {
  readonlyInput.removeAttribute('required');
});
