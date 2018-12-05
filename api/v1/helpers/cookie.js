/**
 * @description DECODES Cookie From String To Object.
 */
const cookie = {
  decode: async (s) => {

    let o = {};
    s.split('; ').forEach((i) => {
      o[i.slice(0, i.indexOf('='))] = i.slice(i.indexOf('=') + 1, i.length);
    });

    return o;
  },
};

module.exports = cookie;