module.exports = {

  date: () => {
    let now = new Date();
    let nowUtc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
    let date = `${(nowUtc.getMonth()+1)}/${nowUtc.getDate()}/${nowUtc.getFullYear()}`;
    let time = `${nowUtc.getHours()}:${nowUtc.getMinutes()}:${nowUtc.getSeconds()}`;
    return `${time} ${date}`;
  },

  /**
   * @argument :: (obj: Response, as: Argument Seperator, vs: Value Seperator)
   */
  createDelimitedString: (obj, as, vs) => {
    let key;
    let concat = as;

    for(key in obj) {
      if (obj.hasOwnProperty(key)) { concat += key + vs + obj[key] + as; }
    }

    return concat;
  },

  addToFrontOfString: function(string, value, sep) {
    return `${value}${sep}${string}`
  },

};