const getRandomInteger = (firstInteger, lastInteger) => {
  const lower = Math.ceil(Math.min(Math.abs(firstInteger), Math.abs(lastInteger)));
  const upper = Math.floor(Math.max(Math.abs(firstInteger), Math.abs(lastInteger)));

  const result = Math.random() * (upper - lower + 1) + lower;
  return Math.floor(result);
};

const checkStringLength = (string, maxLength) => string.length <= maxLength;

const isEscEvent = (evt) => evt.key === 'Escape' || evt.key === 'Esc';

export {getRandomInteger, isEscEvent, checkStringLength};
