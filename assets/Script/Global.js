
window.testTime = '2017/5/29';

window.pp = {};

//获得当天时间对象
pp.getDate = function () {
    return new Date();
    //return new Date(testTime);
};

//获得当天时间戳
pp.getTime = function () {
    return this.getDate().getTime();
};

//获得当月有多少天
pp.getMonthCountDays = function () {
    var date = this.getDate();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    return new Date(year, month, 0).getDate();
};

//求和当天的时间差
pp.betweenDays = function (d) {
    var days = this.getTime() - new Date(d).getTime();
    return parseInt(days / (1000 * 60 * 60 * 24));
};

//求两个时间的时间差(秒)
pp.getDurationWithTwo = function (lTime, fTime) {
    return parseInt((lTime.getTime() - fTime.getTime())) / 1000;
};

//将时间转换为时:分:秒格式字符串
pp.transtionTime = function (value, bool) {
    if (value <= 0) {
        if (bool) return '00:00：00';
        return '00:00';
    }
    var hour = parseInt(value / 3600);
    var minute = parseInt((value - hour * 3600) / 60);
    var second = parseInt(value % 60);
    var hourStr = hour < 10 ? '0' + hour : hour;
    var minuteStr = minute < 10 ? '0' + minute : minute;
    var secondStr = second < 10 ? '0' + second : second;
    if (bool) return hourStr + ':' + minuteStr + ':' + secondStr;
    return minuteStr + ':' + secondStr;
};

pp.LsGet = function (key) {
    return cc.sys.localStorage.getItem(key);
};
pp.LsSet = function (key, value) {
    return cc.sys.localStorage.setItem(key, value);
};

//Json对象转字符串
pp.jsonToString = function (jsonObj) {
    return JSON.stringify(jsonObj);
};
//字符串转Json对象
pp.stringToJson = function (jsonStr) {
    return JSON.parse(jsonStr);
};


//Data
window.GameLocal = {//本地存储的数据
    Money: 1000, //金币
    CheckMonth: pp.getTime(),   //存储年月
    MonthCkDay: [],                     //存储日
};

window.getGameLocal = function (key) {
    return pp.stringToJson(pp.LsGet(key));
};
window.setGameLocal = function (key, value) {
    var dataobj = getGameLocal(key);
    dataobj = value;
    var dataStr = pp.jsonToString(dataobj);
    pp.LsSet(key, dataStr);
};