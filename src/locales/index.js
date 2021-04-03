import i18next from 'i18next';
import ru from './ru';

i18next.init({
  lng: 'ru',
  debug: false,
  resources: {
    ru,
  },
});

export default (key) => i18next.t(key);
