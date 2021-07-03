const repotting = document.querySelector('input[name="repotting"]');
const fertilizer = document.querySelector('input[name="fertilizer"]');

const datePicker = (input) => {
  new Datepicker(input, {
    buttonClass: 'btn',
    autohide: 'true',
    format: 'dd/mm/yyyy',
  });
};

datePicker(repotting);
datePicker(fertilizer);
