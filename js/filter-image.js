import { getRandomInteger } from './utils.js';
import {getPicturesContainer} from './draw-thumbnails.js';
import {debounce} from './utils/debounce.js';

const RERENDER_DELAY = 500;
const NUMBER_RANDOM_IMAGES = 10;

const buttonConteiner = document.querySelector('.img-filters__form');
let currentActiveButton = document.querySelector('.img-filters__button--active');

const removeFiltersHidden = () => {
  const filters = document.querySelector('.img-filters');
  filters.classList.remove('img-filters--inactive');
};

const assignAnActiveClass = (activeButton) => {
  if (currentActiveButton) {
    currentActiveButton.classList.remove('img-filters__button--active');
  }
  activeButton.classList.add('img-filters__button--active');
  currentActiveButton = activeButton;
};

const filterDefault = (images) => images.slice();

const filterRandom = (images) => {
  const randomImages = [];
  let imagesArray = images.slice();

  while(randomImages.length < NUMBER_RANDOM_IMAGES) {
    const randomIndex = getRandomInteger(0, imagesArray.length - 1);
    randomImages.push(imagesArray[randomIndex]);
    imagesArray = imagesArray.filter((_, index) => index !== randomIndex);
  }

  return randomImages;
};

const filterDiscussed = (images) => {
  const discussedImages = images.slice();
  discussedImages.sort((a, b) => b.comments.length - a.comments.length);
  return discussedImages;
};

const initFilters = (images) => {
  buttonConteiner.addEventListener('click', debounce((evt) => {
    const clickedButton = evt.target;

    if (!clickedButton.classList.contains('img-filters__button')) {
      return;
    }

    if (clickedButton.classList.contains('img-filters__button--active')) {
      return;
    }

    assignAnActiveClass(clickedButton);

    let filteredImages;
    switch (clickedButton.id) {
      case 'filter-default':
        filteredImages = filterDefault(images);
        break;
      case 'filter-random':
        filteredImages = filterRandom(images);
        break;
      case 'filter-discussed':
        filteredImages = filterDiscussed(images);
        break;
      default:
        filteredImages = images;
    }

    getPicturesContainer(filteredImages);
  }), RERENDER_DELAY);
};


export {removeFiltersHidden, initFilters};
