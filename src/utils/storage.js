/**
 * 本地存储管理类
 * https://crxdoc-zh.appspot.com/extensions/storage
 * TODO: 如何测试?需要完整的浏览器支持!
 */
export const config = {
  /**
   * 读取本地存储所有信息
   * @returns {Promise}
   */
  getAll() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get((result) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }

        return resolve(result);
      });
    });
  },
  /**
   * 读取配置信息
   * @returns {Promise}
   */
  getConfig() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(['config'], (result) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }

        return resolve(result);
      });
    });
  },
  /**
   * 写入配置信息,在写入配置前,需要先读取配置对象外部修改
   * @param item
   * @returns {Promise}
   */
  setConfig(item) {
    console.log(item);
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set({config: item}, () => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }

        return resolve(null);
      })
    });
  },
  /**
   * 删除配置信息的某个KEY
   * @param key
   * @returns {Promise}
   */
  removeKey(key) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get('config', (result) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        
        delete result[key];
        
        chrome.storage.sync.set({config: result}, () => {
          if (chrome.runtime.lastError) {
            return reject(chrome.runtime.lastError);
          }

          return resolve(null);
        });
      });
    });
  },

  /**
   * 删除配置信息
   * @returns {Promise}
   */
  removeConfig() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.remove(['config'], () => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }

        return resolve(null);
      });
    });
  },

  /**
   * 清空整个本地存储
   * @returns {Promise}
   */
  clear() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.clear(() => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }

        return resolve(null);
      });
    });
  },

  /**
   * 获取本地存储已占用空间,返回字节数
   * @returns {Promise}
   */
  getUsed() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.getBytesInUse(null, (bytesSize) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }

        return resolve(bytesSize);
      });
    });
  }
};