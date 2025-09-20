import { renderPopup } from './big-picture.js';

const picturesContainer = document.querySelector('.pictures');
const pictureTemplate = document.querySelector('#picture').content.querySelector('.picture');

const pictureListFragment = document.createDocumentFragment();

const getPicturesContainer = (data) => {
  data.forEach(({url, likes, comments}) => {
    const pictureElement = pictureTemplate.cloneNode(true);
    pictureElement.querySelector('.picture__img').setAttribute('src', url);
    pictureElement.querySelector('.picture__likes').textContent = likes;
    pictureElement.querySelector('.picture__comments').textContent = comments.length;

    pictureElement.addEventListener('click', () => {
      document.body.classList.add('modal-open');
      renderPopup({url, likes, comments});
    });

    pictureListFragment.appendChild(pictureElement);
  });

  if(picturesContainer.children.length > 2) {
    const pictureList = picturesContainer.querySelectorAll('.picture');
    for (let counter = Array.from(pictureList).length - 1 ; counter >= 0 ; counter--) {
      picturesContainer.removeChild(pictureList[counter]);
    }
  }

  picturesContainer.appendChild(pictureListFragment);
};

export { getPicturesContainer };
