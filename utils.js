Date.prototype.yyyymmdd = function() {
  var yyyy = this.getFullYear().toString();
  var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
  var dd  = this.getDate().toString();
  return yyyy + (mm[1]?mm:"0"+mm[0]) + (dd[1]?dd:"0"+dd[0]); // padding
};

const capitalNums = ['零', '一', '二', '三', '四', '五', '六', '七', '八','九','十','十一','十二']

export const getCapitalNum = num => {
  return capitalNums[num];
}

export const isNative = () => {
  if (!navigator | !navigator.userAgent) return true;
  return isAndroid() | isIos() | isDebugger();
}

export const isDebugger = () => {
  return /ReactNativeDebugger/i.test(navigator.userAgent)
}

export const isAndroid = () => {
  return /android/i.test(navigator.userAgent);
}

export const isIos = () => {
  return /ios|iphone|ipad/i.test(navigator.userAgent);
}

export const useProxy = (target) => {
  const localProxy = '/proxy/';

  return localProxy + encodeURIComponent(target);
}

export const yesterday = date => {
  const regex = /^(\d{4})(\d{2})(\d{2})$/;
  const arr = regex.exec(date);
  let [year, month, day] = [arr[1], arr[2], arr[3]]
  if (parseInt(arr[3]) > 1) {
    return date - 1;
  }

  day--;
  month--;

  return new Date(year, month, day).yyyymmdd();
}

export const getRGBA = (hex, a) => {
  let r = parseInt(hex.substring(2,4), 16);
  let g = parseInt(hex.substring(4,6), 16);
  let b = parseInt(hex.substring(6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export default {};