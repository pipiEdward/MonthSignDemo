const signInList = [
    ['金币', 10], ['金币', 10], ['道具1', 1], ['金币', 10], ['体力', 10],
    ['金币', 10], ['金币', 10], ['道具2', 1], ['金币', 10], ['体力', 15],
    ['金币', 15], ['金币', 15], ['道具3', 1], ['金币', 15], ['体力', 15],
    ['金币', 15], ['金币', 15], ['道具4', 1], ['金币', 15], ['体力', 20],
    ['金币', 20], ['金币', 20], ['道具5', 1], ['金币', 20], ['体力', 20],
    ['金币', 20], ['金币', 20], ['道具6', 1], ['金币', 20], ['体力', 30],
    ['体力', 50],
];

cc.Class({
    extends: cc.Component,

    properties: {
        daylb: cc.Label,//签到日期文字
        seriselb: cc.Label,//累计签到文字
        rewardBtn: cc.Node,      //奖励按钮
        checkInBtn: cc.Node,     //补签按钮
        cancleBtn: cc.Node,      //取消补签按钮
        coinCheckIn: cc.Node,    //花钱补签按钮
        checkScroll: cc.ScrollView, //签到层scro
        costLb: cc.Label,            //补签花费
        rewardLb: cc.Node,
        content: cc.Node,
    },

    // use this for initialization
    onLoad() {
        
    },

    onEnable() {
        this.rewardLb.active = false;
        this.checkMonth();
        this.refreshUI();
        this.scrollToPercent();
    },

    //检测是否是当月
    checkMonth() {
        let date = new Date(getGameLocal('CheckMonth'));
        let curDate = pp.getDate();
        if (date.getFullYear() != curDate.getFullYear() ||
            date.getMonth() != curDate.getMonth()) {
            setGameLocal('MonthCkDay', []);
            setGameLocal('CheckMonth', curDate.getTime());
        }
        this.init();
    },

    init() {
        let date = new Date(getGameLocal('CheckMonth'));
        let month = date.getMonth() + 1;
        let days = pp.getMonthCountDays();
        this.dayCount = days;
        this.month = month;

        let arr = this.content.children;
        for (let i = 0; i < arr.length; i++) {
            let btn = arr[i];
            btn.tag = i;
            if (i + 1 > days) {
                btn.active = false;
                continue;
            }
            this.initBtn(btn);
        }
        this.today = pp.getDate().getDate() - 1;
        this.daylb.string = this.today + 1;//日期显示
    },

    initBtn(btn) {
        let tag = btn.tag;
        let lb = btn.getChildByName('lb').getComponent(cc.Label);
        let namelb = btn.getChildByName('sp').getComponent(cc.Label);
        //let sp = btn.getChildByName('sp').getComponent(cc.Sprite);
        let numlb = btn.getChildByName('numlb').getComponent(cc.Label);
        let data = signInList[tag];
        lb.string = '第' + (tag + 1) + '天';
        namelb.string = data[0];
        // sp.spritFrame = ...图片
        numlb.string = data[1];
    },

    //刷新界面
    refreshUI() {
        this.bqState = false;//补签状态
        this.bqList = [];    //补签列表

        this.cleanAll();
        this.seriselb.string = this.month + '月累计签到' + getGameLocal('MonthCkDay').length + '天';
        //显示补签,领取奖励
        this.checkInBtn.active = true;
        this.rewardBtn.active = true;
        this.setBtnItct(this.checkInBtn, false);
        this.setBtnItct(this.rewardBtn, false);

        for (let i = 0; i < this.dayCount; i++) {
            let btn = this.content.children[i];
            this.checkBtn(btn);
        }
    },

    //刷新补签界面
    refreshBqUI() {
        this.bqState = true;
        this.cleanAll();
        //显示取消.花钱补签按钮
        this.cancleBtn.active = true;
        this.coinCheckIn.active = true;
        this.setBtnItct(this.coinCheckIn, false);
        this.costLb.string = 0;

        let monthDays = getGameLocal('MonthCkDay');

        for (let i = 0; i < pp.getMonthCountDays(); i++) {
            let btn = this.content.children[i];
            let tag = btn.tag;
            let zzsp = btn.getChildByName('zzsp');
            if (tag >= this.today || monthDays.indexOf(tag + 1) >= 0) {//日期大于等于今天或者已经签过的日期,不可补签
                zzsp.active = true;
            } else {
                zzsp.active = false;
            }
        }
    },

    checkBtn(btn) {
        let tag = btn.tag;
        let qdlb = btn.getChildByName('qdlb');
        let zzsp = btn.getChildByName('zzsp');
        let suresp = btn.getChildByName('suresp');
        let monthDays = getGameLocal('MonthCkDay');
        suresp.active = false;
        if (tag > this.today) {//时间还没到
            zzsp.active = false;
            return;
        }
        if (monthDays.indexOf(tag + 1) >= 0) {//已签到
            zzsp.active = true;
            qdlb.active = true;
            return;
        }
        if (tag == this.today) {//今日可以签到
            zzsp.active = false;
            suresp.active = true;
            this.setBtnItct(this.rewardBtn, true);
            return;
        }
        zzsp.active = true;
        this.setBtnItct(this.checkInBtn, true);//存在未签到则激活补签
    },

    cleanAll() {
        this.checkInBtn.active = false;
        this.rewardBtn.active = false;
        this.cancleBtn.active = false;
        this.coinCheckIn.active = false;
    },
    //点击补签
    showBq() {
        this.refreshBqUI();
    },
    //取消补签
    cancleBq() {
        this.refreshUI();
    },
    //领取今日奖励
    getReward() {
        let btn = this.content.children[this.today];

        //存储
        this.pushToMonthDays(this.today + 1);
        this.qdAction(btn);
        this.showRewardLb();
        this.refreshUI();
    },
    //花钱补签
    doBq() {
        //扣钱,检测钱是否足够
        let arr = [];
        for (let i = 0; i < this.bqList.length; i++) {
            let tag = this.bqList[i];
            let btn = this.content.children[tag];
            //显示已签到
            this.qdAction(btn);
            //存入签到数组
            this.pushToMonthDays(tag + 1);
        }
        //显示获得相应奖励
        this.showRewardLb();
        //刷新ui
        this.refreshUI();
    },


    //点击块回调
    blockCallback(event) {
        let target = event.currentTarget;
        let tag = target.tag;
        if (this.bqState) {//补签状态下
            if (target.getChildByName('zzsp').active) return;//如果不可补签
            let suresp = target.getChildByName('suresp');
            suresp.active = !suresp.active;
            suresp.active ? this.bqList.push(tag) : this.removeFromArray(this.bqList, tag);
            let count = this.bqList.length;
            this.setBtnItct(this.coinCheckIn, count > 0);
            this.costLb.string = count * 10;
        } else {
        }
    },

    //设置按钮是否可用
    setBtnItct(node, bool) {
        node.getComponent(cc.Button).interactable = bool;
    },


    //已获得相应奖励
    showRewardLb() {
        this.rewardLb.active = true;
        this.rewardLb.opacity = 255;
        this.rewardLb.runAction(cc.sequence(cc.delayTime(1), cc.fadeOut(0.5), cc.callFunc(function (data) {
            data.active = false;
        })));
    },

    //已签到动作
    qdAction(btn) {
        let qdlb = btn.getChildByName('qdlb');
        qdlb.active = true;
        qdlb.runAction(cc.sequence(cc.scaleTo(0, 1.2), cc.scaleTo(0.5, 1)));
    },

    //存入已签到数组
    pushToMonthDays(day) {
        let monthDays = getGameLocal('MonthCkDay').slice();
        monthDays.push(day);
        setGameLocal('MonthCkDay', monthDays);
    },

    //移动到当前日
    scrollToPercent() {
        let percent = Math.floor(this.today / 5) / 6;
        this.checkScroll.scrollToPercentVertical(1 - percent, 0.2);
    },

    removeFromArray(arr,value){
        let idx = arr.indexOf(value);
        if(idx>=0){
            arr.splice(idx,1);
        }
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
