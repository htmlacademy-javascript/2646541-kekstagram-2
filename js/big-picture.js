import {isEscEvent} from './utils.js';

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
      socialPicture.width = 35;
      socialPicture.height = 35;
      socialPicture.src = data.comments[counter].avatar;
      socialPicture.alt = data.comments[counter].name;

      socialText.classList.add('social_text');
      socialText.textContent = data.comments[counter].message;

      socialComment.appendChild(socialPicture);
      socialComment.appendChild(socialText);

      socialComments.appendChild(socialComment);
    }
  };

  const showComments = () => {
    const socialCommentsArray = Array.from(socialComments.children);
    const totalComments = data.comments.length;

    for (let i = 0; i < Math.min(commentsNumber, totalComments); i++) {
      socialCommentsArray[i].classList.remove('hidden');
    }

    socialCommentsCount.innerHTML = `${Math.min(commentsNumber, totalComments)} из <span class="comments-count">${totalComments}</span> комментариев`;

    if (commentsNumber >= totalComments) {
      commentsLoader.classList.add('hidden');
    }
  };

  const onCommentsLoaderClick = () => {
    commentsNumber += NUMBER_UPLOADED_COMMENTS;
    showComments();
  };

  const onCloseBigPictureButtonClick = (evt) => {
    evt.preventDefault();
    closeBigPicture();
  };

  const onDocumentKeydown = (evt) => {
    if (isEscEvent(evt)) {
      closeBigPicture();
    }
  };

  function closeBigPicture () {
    document.body.classList.remove('modal-open');
    bigPicture.classList.add('hidden');
    bigPictureImage.setAttribute('src', '');
    likesCount.textContent = '';
    commentsCount.textContent = '';
    commentsLoader.classList.remove('hidden');

    Array.from(socialComments.children).forEach((comment) => comment.remove());

    commentsNumber = NUMBER_UPLOADED_COMMENTS;

    commentsLoader.removeEventListener('click', onCommentsLoaderClick);
    closeBigPictureButton.removeEventListener('click', onCloseBigPictureButtonClick);
    document.removeEventListener('keydown', onDocumentKeydown);
  }

  getSocialComments();
  showComments();

  commentsLoader.addEventListener('click', onCommentsLoaderClick);

  closeBigPictureButton.addEventListener('click', onCloseBigPictureButtonClick);

  document.addEventListener('keydown', onDocumentKeydown);
};

export {renderPopup};
