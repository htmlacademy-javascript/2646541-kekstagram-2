//Модуль который отвечает за отрисовку окна с полноразмерным изображением

import {isEscEvent} from './util.js';

const bigPicture = document.querySelector('.big-picture');
const bigPictureImg = document.querySelector('.big-picture__img img');
const likesCount = document.querySelector('.likes-count');
const commentsCount = document.querySelector('.comments-count');
const socialCommentsList = document.querySelector('.social__comments');
const descriptionPicture = document.querySelector('.social__caption');
const buttonClose = document.querySelector('.big-picture__cancel');
const socialCommentCount = document.querySelector('.social__comment-count');
const uploadNewPictire = document.querySelector('.comments-loader');
const body = document.querySelector('body');
const commentTemplate = bigPicture.querySelector('.social__comment');

const closePictureEsc = (evt) => {
  if (isEscEvent(evt)){
    evt.preventDefault();
    bigPicture.classList.add('hidden');
    body.classList.remove('modal-open');
  }
};

function openPicture () {
  bigPicture.classList.remove('hidden');
  body.classList.add('modal-open');
  socialCommentCount.classList.add('hidden');
  uploadNewPictire.classList.add('hidden');
  document.addEventListener('keydown', closePictureEsc);
}

function closePicture () {
  bigPicture.classList.add('hidden');
  body.classList.remove('modal-open');
  document.addEventListener('keydown', closePictureEsc);
}

buttonClose.addEventListener ('click', () => {
  closePicture();
});

const generatedComments = (comments) => {
  for (let index = 0; index <= comments.length - 1; index++) {
    const {avatar, name, message} = comments[index];
    const commentElement = commentTemplate.cloneNode(true);
    commentElement.querySelector('.social__picture').src = avatar;
    commentElement.querySelector('.social__picture').alt = name;
    commentElement.querySelector('.social__text').textContent = message;
    socialCommentsList.appendChild(commentElement);
  }
};

export const renderBigPicture = (data) => {
  const {url, likes, comments, description} = data;
  openPicture();
  bigPictureImg.src = url;
  likesCount.textContent = likes;
  commentsCount.textContent = comments.length;
  descriptionPicture.textContent = description;
  socialCommentsList.innerHTML = '';
  generatedComments(comments);
};
