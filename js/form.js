import { checkStringLength } from './utils.js';
import { sendData } from './api.js';

const sliderContainer = document.querySelector('.img-upload__effect-level');
const slider = document.querySelector('.effect-level__slider');
const effectValueInput = document.querySelector('.effect-level__value');
const picturePreview = document.querySelector('.img-upload__preview img');
const uploadPictureInput = document.querySelector('#upload-file');
const editPictureModal = document.querySelector('.img-upload__overlay');
const editPictureCancelButton = editPictureModal.querySelector('#upload-cancel');
const hashtagsInput = editPictureModal.querySelector('.text__hashtags');
const commentInput = editPictureModal.querySelector('.text__description');
const smallScaleControl = editPictureModal.querySelector('.scale__control--smaller');
const bigScaleControl = editPictureModal.querySelector('.scale__control--bigger');
const scaleControlValue = editPictureModal.querySelector('.scale__control--value');
const effectPictureControl = document.querySelector('.effects__list');
const editPictureForm = document.querySelector('.img-upload__form');
const alertTemplate = document.querySelector('#error').content.querySelector('.error');
const successTemplate = document.querySelector('#success').content.querySelector('.success');

const MAX_COMMENT_LENGTH = 140;
const MAX_HASHTAGS_QUANTITY = 5;
const MAX_HASHTAG_LENGTH = 20;
const ALERT_SHOW_TIME = 5000;
const VALID_HASHTAG = /^#[a-zа-яё0-9]{1,}$/i;
const SCALE_MIN_VALUE = 25;
const SCALE_MAX_VALUE = 100;
const SCALE_CHANGE_VALUE = 25;
const SCALE_DEFAULT_VALUE = 100;

let pristine = null;

const hashtagValidationRules = [
  { rule: (hashtags) => hashtags.every((h) => h.startsWith('#')), message: 'Хэштег должен начинаться с символа #' },
  { rule: (hashtags) => hashtags.every((h) => h.length > 1), message: 'Хэштег не может состоять только из символа #' },
  { rule: (hashtags) => hashtags.every((h) => !h.slice(1).includes('#')), message: 'Хэштеги должны быть разделены пробелами' },
  { rule: (hashtags) => hashtags.every((h) => VALID_HASHTAG.test(h)), message: 'После решётки допустимы только буквы и числа' },
  { rule: (hashtags) => hashtags.every((h) => h.length <= MAX_HASHTAG_LENGTH), message: `Максимальная длина хэштега ${MAX_HASHTAG_LENGTH} символов` },
  { rule: (hashtags) => new Set(hashtags.map((h) => h.toLowerCase())).size === hashtags.length, message: 'Хэштеги не должны повторяться' },
  { rule: (hashtags) => hashtags.length <= MAX_HASHTAGS_QUANTITY, message: `Нельзя указать больше ${MAX_HASHTAGS_QUANTITY} хэш-тегов` }
];

const configPristine = {
  classTo: 'img-upload__field-wrapper',
  errorTextParent: 'img-upload__field-wrapper',
  errorTextClass: 'img-upload__field-wrapper--error',
};

const SLIDER_OPTIONS = {
  chrome: { range: { min: 0, max: 1 }, step: 0.1, start: 1 },
  sepia: { range: { min: 0, max: 1 }, step: 0.1, start: 1 },
  marvin: { range: { min: 0, max: 100 }, step: 1, start: 100 },
  phobos: { range: { min: 0, max: 3 }, step: 0.1, start: 3 },
  heat: { range: { min: 1, max: 3 }, step: 0.1, start: 3 }
};

const createSlider = () => {
  noUiSlider.create(slider, {
    range: { min: 0, max: 100 },
    start: SCALE_DEFAULT_VALUE,
    step: 1,
    format: {
      to: (value) => Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1),
      from: (value) => parseFloat(value)
    }
  });
  effectValueInput.value = SCALE_DEFAULT_VALUE;
  sliderContainer.classList.add('hidden');
};

const removeEffectOfPicture = () => {
  picturePreview.removeAttribute('class');
  picturePreview.style.removeProperty('filter');
  effectValueInput.value = '';
  sliderContainer.classList.add('hidden');
};

const addPictureFilterStyle = (effect, value) => {
  switch (effect) {
    case 'chrome': picturePreview.style.filter = `grayscale(${value})`; break;
    case 'sepia': picturePreview.style.filter = `sepia(${value})`; break;
    case 'marvin': picturePreview.style.filter = `invert(${value}%)`; break;
    case 'phobos': picturePreview.style.filter = `blur(${value}px)`; break;
    case 'heat': picturePreview.style.filter = `brightness(${value})`; break;
  }
};

const addEffect = (effectName) => {
  if (effectName in SLIDER_OPTIONS) {
    sliderContainer.classList.remove('hidden');
    slider.noUiSlider.off('update');
    slider.noUiSlider.updateOptions(SLIDER_OPTIONS[effectName]);
    slider.noUiSlider.on('update', (values, handle) => {
      effectValueInput.value = `${values[handle]}`;
      addPictureFilterStyle(effectName, values[handle]);
    });
  } else {
    removeEffectOfPicture();
  }
};

const onEffectClick = ({ target: { value, type } }) => {
  if (type === 'radio') {
    picturePreview.className = `effects__preview--${value}`;
    addEffect(value);
  }
};

const changeScale = (direction) => {
  let value = parseInt(scaleControlValue.value, 10);
  if (direction === 'up' && value < SCALE_MAX_VALUE) {
    value += SCALE_CHANGE_VALUE;
  }
  if (direction === 'down' && value > SCALE_MIN_VALUE) {
    value -= SCALE_CHANGE_VALUE;
  }
  scaleControlValue.value = `${value}%`;
  picturePreview.style.transform = `scale(${value / 100})`;
};

const onChangePictureScale = ({ target }) => {
  if (target === smallScaleControl) {
    changeScale('down');
  }
  if (target === bigScaleControl) {
    changeScale('up');
  }
};

const initPristine = () => {
  if (!pristine) {
    pristine = new Pristine(editPictureForm, configPristine);

    let hashtagErrorMessage = '';
    const getHashtagErrorMessage = () => hashtagErrorMessage;

    const checkHashtags = (value) => {
      if (!value.trim()) {
        return true;
      }
      const hashtags = value.trim().split(/\s+/);
      for (const { rule, message } of hashtagValidationRules) {
        if (!rule(hashtags)) {
          hashtagErrorMessage = message;
          return false;
        }
      }
      return true;
    };

    pristine.addValidator(hashtagsInput, checkHashtags, getHashtagErrorMessage);
    hashtagsInput.addEventListener('input', () => pristine.validateField(hashtagsInput));

    pristine.addValidator(
      commentInput,
      (value) => checkStringLength(value, MAX_COMMENT_LENGTH),
      `Максимальная длина комментария ${MAX_COMMENT_LENGTH} символов`
    );
    commentInput.addEventListener('input', () => pristine.validateField(commentInput));
  }
};

const resetFormValues = () => {
  uploadPictureInput.value = '';
  picturePreview.style.transform = 'scale(1)';
  effectPictureControl.children[0].querySelector('input[type="radio"]').checked = true;
  hashtagsInput.value = '';
  commentInput.value = '';
};

const onCloseEditPictureForm = () => {
  resetFormValues();
  removeEffectOfPicture();
  editPictureModal.classList.add('hidden');
  document.body.classList.remove('modal-open');
  slider.noUiSlider.destroy();
};

const showAlert = (message) => {
  const alertElement = alertTemplate.cloneNode(true);
  alertElement.querySelector('.error__title').textContent = message;
  alertElement.querySelector('.error__button').remove();
  document.body.appendChild(alertElement);
  setTimeout(() => alertElement.remove(), ALERT_SHOW_TIME);
};

const closeErrorModal = () => document.querySelector('.error')?.remove();
const onCloseSuccessModal = () => document.querySelector('.success')?.remove();

const onEscButton = (evt) => {
  if (evt.key !== 'Escape') {
    return;
  }
  const errorModal = document.querySelector('.error');
  const successModal = document.querySelector('.success');
  if (errorModal) {
    return closeErrorModal();
  }
  if (successModal) {
    return onCloseSuccessModal();
  }
  if (!editPictureModal.classList.contains('hidden')) {
    onCloseEditPictureForm();
  }
};

const showErrorModal = () => {
  const errorModalElement = alertTemplate.cloneNode(true);
  errorModalElement.querySelector('.error__button').addEventListener('click', closeErrorModal);
  document.body.appendChild(errorModalElement);
  document.addEventListener('keydown', onEscButton);
};

const showSuccess = () => {
  const successElement = successTemplate.cloneNode(true);
  successElement.querySelector('.success__button').addEventListener('click', onCloseSuccessModal);
  document.body.appendChild(successElement);
  document.addEventListener('keydown', onEscButton);
};

const onSetFormSubmit = (evt) => {
  evt.preventDefault();
  document.removeEventListener('keydown', onEscButton);

  if (!pristine.validate()) {
    return;
  }

  sendData(
    () => {
      onCloseEditPictureForm();
      showSuccess();
    },
    () => {
      showErrorModal();
    },
    new FormData(evt.target)
  );
};

const showEditPictureForm = () => {
  editPictureModal.classList.remove('hidden');
  document.body.classList.add('modal-open');
  scaleControlValue.value = `${SCALE_DEFAULT_VALUE}%`;

  initPristine();

  editPictureCancelButton.addEventListener('click', onCloseEditPictureForm);
  smallScaleControl.addEventListener('click', onChangePictureScale);
  bigScaleControl.addEventListener('click', onChangePictureScale);
  effectPictureControl.addEventListener('click', onEffectClick);
  createSlider();

  editPictureForm.addEventListener('submit', onSetFormSubmit);
};

uploadPictureInput.addEventListener('change', () => {
  if (uploadPictureInput.value) {
    showEditPictureForm();
  }
});

export { showAlert };
