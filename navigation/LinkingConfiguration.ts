import * as Linking from 'expo-linking';

export default {
  prefixes: [Linking.makeUrl('/')],
  config: {
    screens: {
      List: 'list',
      Detail: 'detail/:id',
      NotFound: '*',
    },
  },
};
