// Функция, возвращающая случайное целое число

const getRandomPositiveInteger = (min, max) => {
  const lower = Math.ceil(Math.min(Math.abs(min), Math.abs(max)));
  const upper = Math.floor(Math.max(Math.abs(min), Math.abs(max)));
  const result = Math.random() * (upper - lower + 1) + lower;
  return Math.floor(result);
};

//Функция для проверки максимальной длины строки

const checkMaxStringLength = (testString, maxLength) => testString.length <= maxLength;

// Функция для получения случайного элемента массива

const getRandomArrayElement = (elements) => elements[getRandomPositiveInteger(0, elements.length - 1)];

export {getRandomPositiveInteger, checkMaxStringLength, getRandomArrayElement};
