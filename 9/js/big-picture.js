import {isEscEvent} from './util.js';

const bigPicture = document.querySelector('.big-picture');
const closeBigPictureButton = bigPicture.querySelector('.cancel');
const bigPictureImage = bigPicture.querySelector('.big-picture__img').querySelector('img');
const likesCount = bigPicture.querySelector('.likes-count');
const commentsCount = bigPicture.querySelector('.comments-count');
const socialComments = bigPicture.querySelector('.social__comments');
const socialCommentsCount = bigPicture.querySelector('.social__comment-count');
const commentsLoader = bigPicture.querySelector('.comments-loader');

const NUMBER_UPLOADED_COMMENTS = 5;
let commentsNumber = NUMBER_UPLOADED_COMMENTS;

const renderPopup = (data) => {

  for (let counter = socialComments.children.length - 1 ; counter >= 0 ; counter--) {
    const comment = socialComments.children[counter];
    comment.parentElement.removeChild(comment);
  }

  bigPicture.classList.remove('hidden');
  bigPictureImage.setAttribute('src', data.url);
  likesCount.textContent = data.likes;
  commentsCount.textContent = data.comments.length;
  document.body.classList.add('modal-open');

  const getSocialComments = () => {
    for (let counter = data.comments.length - 1 ; counter >= 0 ; counter--) {
      const socialComment = document.createElement('li');
      const socialPicture = document.createElement('img');
      const socialText = document.createElement('p');

      socialComment.classList.add('social__comment');
      socialComment.classList.add('hidden');

      socialPicture.classList.add('social__picture');
      socialPicture.setAttribute('width', '35');
      socialPicture.setAttribute('height', '35');
      socialPicture.setAttribute('src', data.comments[counter].avatar);
      socialPicture.setAttribute('alt', data.comments[counter].name);

      socialText.classList.add('social_text');
      socialText.textContent = data.comments[counter].message;

      socialComment.appendChild(socialPicture);
      socialComment.appendChild(socialText);

      socialComments.appendChild(socialComment);
    }
  };

  const showCommets = () => {
    const socialCommentsArray = Array.from(socialComments.children);

    let visibleCommentsCouter = 0;

    socialCommentsArray.forEach((element) => {
      if (element.classList.contains('hidden')) {
        visibleCommentsCouter++;
      }
    });

    if (visibleCommentsCouter < NUMBER_UPLOADED_COMMENTS) {
      socialCommentsCount.innerHTML = `${data.comments.length} из <span class="comments-count">${data.comments.length}</span> комментариев`;
      for (let counter = socialCommentsArray.length - 1; counter >= 0 ; counter--) {
        socialCommentsArray[counter].classList.remove('hidden');
      }
      commentsLoader.classList.add('hidden');
    } else {
      socialCommentsCount.innerHTML = `${commentsNumber} из <span class="comments-count">${data.comments.length}</span> комментариев`;
      for (let counter = 0; counter <= commentsNumber - 1 ; counter++) {
        if (socialCommentsArray.length <= commentsNumber) {
          commentsLoader.classList.add('hidden');
          socialCommentsCount.innerHTML = `${data.comments.length} из <span class="comments-count">${data.comments.length}</span> комментариев`;
        }
        socialCommentsArray[counter].classList.remove('hidden');
      }
    }
  };

  const onCommentsLoaderClick = () => {
    commentsNumber += NUMBER_UPLOADED_COMMENTS;
    showCommets();
  };

  const onCloseBigPicturePopup = (evt) => {

    const closeBigPicturePopup = () => {
      evt.preventDefault();
      document.body.classList.remove('modal-open');
      bigPicture.classList.add('hidden');
      bigPictureImage.setAttribute('src', '');
      likesCount.textContent = '';
      commentsCount.textContent = '';
      commentsLoader.classList.remove('hidden');

      for (let counter = Array.from(socialComments.children).length - 1 ; counter >= 0 ; counter--) {
        socialComments.removeChild(Array.from(socialComments.children)[counter]);
      }

      commentsNumber = NUMBER_UPLOADED_COMMENTS;

      commentsLoader.removeEventListener('click', onCommentsLoaderClick);
      closeBigPictureButton.removeEventListener('click', onCloseBigPicturePopup);
      document.removeEventListener('keydown', onCloseBigPicturePopup);
    };

    if(evt.type === 'click') {
      closeBigPicturePopup();
    } else if(isEscEvent(evt)) {
      closeBigPicturePopup();
    }
  };

  getSocialComments();
  showCommets();

  commentsLoader.addEventListener('click', onCommentsLoaderClick);

  closeBigPictureButton.addEventListener('click', onCloseBigPicturePopup);

  document.addEventListener('keydown', onCloseBigPicturePopup);
};

export {renderPopup};
