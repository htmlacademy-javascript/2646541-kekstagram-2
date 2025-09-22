import {checkStringLength} from './utils.js';
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

const MAX_COMMENT_LENGTH = 140;
const SCALE_MIN_VALUE = 25;
const SCALE_MAX_VALUE = 100;
const SCALE_CHANGE_VALUE = 25;
const MAX_HASHTAGS_QUANTITY = 5;
const MAX_HASHTAG_LENGTH = 20;
const ALERT_SHOW_TIME = 5000;
const VALID_HASHTAG = /^#[a-zа-яё0-9]{1,}$/i;

const SLIDER_OPTIONS = {
  'chrome': {
    range: {
      min: 0,
      max: 1,
    },
    step: 0.1,
    start: 1,
  },
  'sepia': {
    range: {
      min: 0,
      max: 1,
    },
    step: 0.1,
    start: 1,
  },
  'marvin': {
    range: {
      min: 0,
      max: 100,
    },
    step: 1,
    start: 100,
  },
  'phobos': {
    range: {
      min: 0,
      max: 3,
    },
    step: 0.1,
    start: 3,
  },
  'heat': {
    range: {
      min: 1,
      max: 3,
    },
    step: 0.1,
    start: 3,
  },
};

const createSlider = () => {
  noUiSlider.create(slider, {
    range: {
      min: 0,
      max: 100,
    },
    start: 100,
    step: 1,
    format: {
      to: function (value) {
        if (Number.isInteger(value)) {
          return value.toFixed(0);
        }
        return value.toFixed(1);
      },
      from: function (value) {
        return parseFloat(value);
      },
    },
  });

  effectValueInput.value = 100;
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
    case 'chrome':
      picturePreview.style.filter = `grayscale(${value})`;
      break;
    case 'sepia':
      picturePreview.style.filter = `sepia(${value})`;
      break;
    case 'marvin':
      picturePreview.style.filter = `invert(${value}%)`;
      break;
    case 'phobos':
      picturePreview.style.filter = `blur(${value}px)`;
      break;
    case 'heat':
      picturePreview.style.filter = `brightness(${value})`;
      break;
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

const ErrorMessages = {
  HASHTAG_SUM: `Нельзя указать больше ${MAX_HASHTAGS_QUANTITY} хэш-тегов!`,
  HASHTAG_REPEAT: 'Хэштеги не должны повторяться!',
  HASHTAG_INVALID: 'После решётки допустимы только буквы и числа!',
  HASHTAG_ONLY: 'Хэштег не может состоять только из символа #!',
  HASHTAG_LENGTH: `Максимальная длина хэштега ${MAX_HASHTAG_LENGTH} символов!`,
  HASHTAG_SEPARATOR: 'Хэштеги должны быть разделены пробелами, без запятых!',
  COMMENT_LENGTH: `Длина комментария не должна быть больше ${MAX_COMMENT_LENGTH} символов!`
};
Object.freeze(ErrorMessages);

const zoomIn = (value) => {
  if (value < SCALE_MAX_VALUE) {
    const scaleValue = value + SCALE_CHANGE_VALUE;
    scaleControlValue.value = `${scaleValue}%`;
    picturePreview.style.transform = `scale(${(scaleValue) / 100})`;
  }
};

const zoomOut = (value) => {
  if (value > SCALE_MIN_VALUE) {
    const scaleValue = value - SCALE_CHANGE_VALUE;
    scaleControlValue.value = `${scaleValue}%`;
    picturePreview.style.transform = `scale(${(scaleValue) / 100})`;
  }
};

const onChangePictureScale = ({ target }) => {
  const value = parseInt(scaleControlValue.value, 10);
  if (target === smallScaleControl) {
    zoomOut(value);
  } else if (target === bigScaleControl) {
    zoomIn(value);
  }
};

const onGetHashtags = (evt) => {
  const input = evt.target;
  const value = input.value.trim();
  const hashtags = value.split(/\s+/);
  const lowercasedTags = [];
  let errorMessage = '';

  if (!value) {
    errorMessage = '';
  } else if (value.includes(',')) {
    errorMessage = ErrorMessages.HASHTAG_SEPARATOR;
  } else if (hashtags.length > MAX_HASHTAGS_QUANTITY) {
    errorMessage = ErrorMessages.HASHTAG_SUM;
  } else {
    for (const hashtag of hashtags) {
      const lowerCaseHashtag = hashtag.toLowerCase();

      if (hashtag === '#') {
        errorMessage = ErrorMessages.HASHTAG_ONLY;
        break;
      }

      if (hashtag.slice(1).includes('#')) {
        errorMessage = ErrorMessages.HASHTAG_SEPARATOR;
        break;
      }

      if (hashtag.length > MAX_HASHTAG_LENGTH) {
        errorMessage = ErrorMessages.HASHTAG_LENGTH;
        break;
      }

      if (!VALID_HASHTAG.test(hashtag.trim())) {
        errorMessage = ErrorMessages.HASHTAG_INVALID;
        break;
      }

      if (lowercasedTags.includes(lowerCaseHashtag)) {
        errorMessage = ErrorMessages.HASHTAG_REPEAT;
        break;
      }

      lowercasedTags.push(lowerCaseHashtag);
    }
  }

  input.setCustomValidity(errorMessage);
  input.reportValidity();
};

const onInputFocused = (evt) => evt.stopPropagation();

const onCheckComment = ({ target: { value } }) => {
  commentInput.setCustomValidity(checkStringLength(value, MAX_COMMENT_LENGTH) ? '' : commentInput.setCustomValidity(ErrorMessages.COMMENT_LENGTH));
  commentInput.reportValidity();
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

const alertTemplate = document.querySelector('#error')
  .content
  .querySelector('.error');
const successTemplate = document.querySelector('#success')
  .content
  .querySelector('.success');

const showAlert = (message) => {
  const alertElement = alertTemplate.cloneNode(true);
  const title = alertElement.querySelector('.error__title');
  title.style.lineHeight = '1em';
  title.textContent = message;
  alertElement.querySelector('.error__button').remove();
  document.body.appendChild(alertElement);

  setTimeout(() => {
    alertElement.remove();
  }, ALERT_SHOW_TIME);
};

const onCloseSuccessModal = () => {
  const successModal = document.querySelector('.success');
  successModal.remove();
};

const closeErrorModal = () => {
  const errorModal = document.querySelector('.error');
  errorModal.remove();
};

const onEscButtonForErrorModal = ({keyCode}) => {
  if (keyCode === 27) {
    document.removeEventListener('keydown', onEscButtonForErrorModal);
    closeErrorModal();
  }
};

const onEscButtonForSuccessModal = ({keyCode}) => {
  if (keyCode === 27) {
    document.removeEventListener('keydown', onEscButtonForSuccessModal);
    onCloseSuccessModal();
  }
};

const showErrorModal = () => {
  const errorModalElement = alertTemplate.cloneNode(true);
  const closeButton = errorModalElement.querySelector('.error__button');
  document.body.appendChild(errorModalElement);
  closeButton.addEventListener('click', closeErrorModal);
  document.addEventListener('keydown', onEscButtonForErrorModal);
};

const showSuccess = () => {
  const successElement = successTemplate.cloneNode(true);
  const closeButton = successElement.querySelector('.success__button');
  document.body.appendChild(successElement);
  closeButton.addEventListener('click', onCloseSuccessModal);
  document.addEventListener('keydown', onEscButtonForSuccessModal);
};

const onEscButton = (evt) => {
  if (evt.keyCode === 27) {
    onCloseEditPictureForm();
    document.removeEventListener('keydown', onEscButton);
  }
};

const onSetFormSubmit = (evt) => {
  evt.preventDefault();
  document.removeEventListener('keydown', onEscButton);
  sendData(
    () => {
      onCloseEditPictureForm();
      showSuccess();
    },
    () => {
      showErrorModal();
    },
    new FormData(evt.target),
  );
};

const showEditPictureForm = () => {
  editPictureModal.classList.remove('hidden');
  document.body.classList.add('modal-open');
  scaleControlValue.value = '100%';
  editPictureCancelButton.addEventListener('click', onCloseEditPictureForm);
  hashtagsInput.addEventListener('input', onGetHashtags);
  hashtagsInput.addEventListener('keydown', onInputFocused);
  commentInput.addEventListener('input', onCheckComment);
  commentInput.addEventListener('keydown', onInputFocused);
  document.addEventListener('keydown', onEscButton);
  smallScaleControl.addEventListener('click', onChangePictureScale);
  bigScaleControl.addEventListener('click', onChangePictureScale);
  effectPictureControl.addEventListener('click', onEffectClick);
  createSlider();
  editPictureForm.addEventListener('submit', onSetFormSubmit);
};

uploadPictureInput.addEventListener('change', () => {
  if (uploadPictureInput.value) {
    showEditPictureForm(uploadPictureInput.value);
  }
});

export {showAlert};
