import { getRandomInteger } from './utils.js';
import {getPicturesContainer} from './draw-thumbnails.js';
import {debounce} from './utils/debounce.js';

const RERENDER_DELAY = 500;
const NUMBER_RANDOM_IMAGES = 10;
const buttonConteiner = document.querySelector('.img-filters__form');
const buttons = Array.from(buttonConteiner.children);

const removeFiltersHidden = () => {
  const filters = document.querySelector('.img-filters');
  filters.classList.remove('img-filters--inactive');
};

const assignAnActiveClass = (activeButton) => {
  buttons.forEach((element) => {
    element.className = 'img-filters__button';
  });
  activeButton.classList.add('img-filters__button--active');
};

const onFiltersClick = (images) => {

  buttonConteiner.addEventListener('click', debounce((evt) => {
    const clickedButton = evt.target;

    if (clickedButton.classList.contains('img-filters__button--active')) {
      return;
    }

    assignAnActiveClass(evt.target);

    if(evt.target.id === 'filter-default') {
      getPicturesContainer(images);
    } else if (evt.target.id === 'filter-random') {
      const randomImages = [];
      let imagesArray = images.slice();

      while(randomImages.length < NUMBER_RANDOM_IMAGES) {
        const randomIndex = getRandomInteger(0, imagesArray.length - 1);
        randomImages.push(imagesArray[randomIndex]);

        imagesArray = imagesArray.filter((element) => imagesArray.indexOf(element) !== randomIndex);
      }

      getPicturesContainer(randomImages);
    } else if (evt.target.id === 'filter-discussed') {
      const theMistDiscussedImages = images.slice();

      const compareTheNumberOfComments = (imagesA, imagesB) => imagesB.comments.length - imagesA.comments.length;

      theMistDiscussedImages.sort(compareTheNumberOfComments);
      getPicturesContainer(theMistDiscussedImages);
    }
  }), RERENDER_DELAY);
};

export {removeFiltersHidden, onFiltersClick};
