export default {
  get() {
    return new Promise((resolve, reject) => {
      reject(new Error('storage.get error: unimplemented browser.'));
    });
  },

  set() {
    return new Promise((resolve, reject) => {
      reject(new Error('storage.set error: unimplemented browser.'));
    });
  },
};
