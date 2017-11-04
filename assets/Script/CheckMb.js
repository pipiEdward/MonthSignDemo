//签到面板
cc.Class({
    extends: cc.Component,

    properties: {
        titleLb: cc.Label,       //几月签到标题
        checkInlayer: cc.Node,
        heapLb: cc.Label,        //累积签到
        rewardBtn: cc.Node,      //奖励按钮
        checkInBtn: cc.Node,     //补签按钮
        cancleBtn: cc.Node,      //取消补签按钮
        coinCheckIn: cc.Node,    //花钱补签按钮
        checkScroll: cc.ScrollView, //签到层scro
        costLb: cc.Label,            //补签花费
        // bxLayer: cc.Node,
        // daysPro: cc.ProgressBar,
        rewardLb: cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        this.gameMng = pp.getCanvasComponent('GameMng');
        this.init();
    },

    onEnable: function () {
        this.checkMonth();
        this.refreshUI();
        this.scrollToPercent();
    },

    //检测是否是当月
    checkMonth: function () {
        var date = new Date(getGameLocal('CheckMonth'));
        var curDate = pp.getDate();
        if (date.getFullYear() != curDate.getFullYear() ||
            date.getMonth() != curDate.getMonth()) {
            setGameLocal('MonthCkDay', []);
            setGameLocal('CheckMonth', curDate.getTime());
            // setGameLocal('BoxNum', 0);
            this.init();
        }
    },

    init: function () {
        var date = new Date(getGameLocal('CheckMonth'));
        var month = date.getMonth() + 1;
        var day = pp.getMonthCountDays();

        this.month = month;

        var ckList = getConstData('mCheckList');
        this.ckList = ckList;
        var arr = this.checkInlayer.children;
        for (var i = 0; i < arr.length; i++) {
            var btn = arr[i];
            btn.tag = i;
            btn.name = ckList[i][0];
            if (i + 1 > day) {
                btn.active = false;
                break;
            }
            this.initBtn(btn)
        }
        this.today = pp.getDate().getDate() - 1;
        this.titleLb.string = this.today + 1;//日期显示
    },

    initBtn: function (btn) {
        var tag = btn.tag;
        var lb = btn.getChildByName('lb').getComponent(cc.Label);
        var sp = btn.getChildByName('sp').getComponent(cc.Sprite);
        var data = getRewardTypeStr(btn.name);
        var numlb = btn.getChildByName('numlb').getComponent(cc.Label);
        lb.string = pp.replaceStr(getLanData('t13'), '%d', tag + 1);
        sp.spriteFrame = data.spFrame;
        pp.doFix(40, 40, sp.node);
        numlb.string = this.ckList[tag][1];
    },
    checkBtn: function (btn) {
        var tag = btn.tag;
        var qdlb = btn.getChildByName('qdlb');
        var zzsp = btn.getChildByName('zzsp');
        var suresp = btn.getChildByName('suresp');
        var monthDays = getGameLocal('MonthCkDay');
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

    //刷新界面
    refreshUI: function () {
        this.bqState = false;//补签状态
        this.bqList = [];    //补签列表

        this.cleanAll();
        var str = getLanData('t14');
        str = pp.replaceStr(str, '%d1', this.month);
        str = pp.replaceStr(str, '%d2', getGameLocal('MonthCkDay').length);
        this.heapLb.string = str;
        //显示补签,领取奖励
        this.checkInBtn.active = true;
        this.rewardBtn.active = true;
        this.setBtnItct(this.checkInBtn, false);
        this.setBtnItct(this.rewardBtn, false);

        var daysCount = pp.getMonthCountDays();
        for (var i = 0; i < daysCount; i++) {
            var btn = this.checkInlayer.children[i];
            this.checkBtn(btn);
        }

        //刷新宝箱
        // var bxNum = getGameLocal('BoxNum');
        // for(var i = 0;i<this.bxLayer.children;i++){
        //     var box = this.bxLayer.children[i];
        //     this.setBtnItct(box,i<bxNum);
        // }
        //刷新进度条
        //this.daysPro.progess = getGameLocal('MonthCkDay').length/daysCount;
    },

    //刷新补签界面
    refreshBqUI: function () {
        this.bqState = true;
        this.cleanAll();
        //显示取消.花钱补签按钮
        this.cancleBtn.active = true;
        this.coinCheckIn.active = true;
        this.setBtnItct(this.coinCheckIn, false);
        this.costLb.string = 0;

        var monthDays = getGameLocal('MonthCkDay');

        for (var i = 0; i < pp.getMonthCountDays(); i++) {
            var btn = this.checkInlayer.children[i];
            var tag = btn.tag;
            var zzsp = btn.getChildByName('zzsp');
            if (tag >= this.today || monthDays.indexOf(tag + 1) >= 0) {//日期大于等于今天或者已经签过的日期,不可补签
                zzsp.active = true;
            } else {
                zzsp.active = false;
            }
        }
    },


    cleanAll: function () {
        this.checkInBtn.active = false;
        this.rewardBtn.active = false;
        this.cancleBtn.active = false;
        this.coinCheckIn.active = false;
    },

    //点击补签
    showBq: function () {
        this.refreshBqUI();
    },
    //取消补签
    cancleBq: function () {
        this.refreshUI();
    },

    //领取今日奖励
    getReward: function () {
        var btn = this.checkInlayer.children[this.today];
        //领取今日相应奖励
        var name = btn.name;
        var num = this.ckList[btn.tag][1];
        this.showRewardMb([this.checkReward(name,num)]);
        
        //存储
        this.pushToMonthDays(this.today + 1);
        this.qdAction(btn);
        //this.showRewardLb();
        this.refreshUI();
    },

    checkReward: function (name, num) {
        if (name == 'random') {
            var cltlist = getGameLocal('ColtList');
            var obj = pp.getRandFromArr(cltlist);
            name = obj[0];
        }
        return {name:name,num:num};
    },

    showRewardMb:function(arr){
        this.gameMng.getRewardMb(arr);
    },
    //花钱补签
    doBq: function () {
        //扣钱,检测钱是否足够
        if (!this.gameMng.refreshCoin(-Number(this.costLb.string))) {
            return;
        };
        var arr = [];
        for (var i = 0; i < this.bqList.length; i++) {
            var tag = this.bqList[i];
            var btn = this.checkInlayer.children[tag];
            var name = btn.name;
            var num = this.ckList[tag][1];
            //分配奖励
            arr.push(this.checkReward(name, num));
            //显示已签到
            this.qdAction(btn);
            //存入签到数组
            this.pushToMonthDays(tag + 1);
        }
        //显示获得相应奖励
        this.showRewardMb(arr);
        //刷新ui
        this.refreshUI();
    },

    //已获得相应奖励
    showRewardLb: function () {
        this.rewardLb.active = true;
        this.rewardLb.opacity = 255;
        this.rewardLb.runAction(cc.sequence(cc.delayTime(1), cc.fadeOut(0.5), cc.callFunc(function (data) {
            data.active = false;
        })));
    },

    //已签到动作
    qdAction: function (btn) {
        var qdlb = btn.getChildByName('qdlb');
        qdlb.active = true;
        qdlb.runAction(cc.sequence(cc.scaleTo(0, 1.2), cc.scaleTo(0.5, 1)));
    },

    //存入已签到数组
    pushToMonthDays: function (day) {
        var monthDays = getGameLocal('MonthCkDay').slice();
        monthDays.push(day);
        setGameLocal('MonthCkDay', monthDays);
    },

    //按钮回调
    btnCallback: function (event) {
        var target = event.currentTarget;
        var tag = target.tag;
        var name = target.name;
        if (this.bqState) {//补签状态下
            if (target.getChildByName('zzsp').active) return;//如果不可补签
            var suresp = target.getChildByName('suresp');
            suresp.active = !suresp.active;
            suresp.active ? this.bqList.push(tag) : pp.removeFromArray(this.bqList, tag);
            var count = this.bqList.length;
            this.setBtnItct(this.coinCheckIn, count > 0);
            this.costLb.string = count * getConstData('bqCost');
        } else {
            this.gameMng.popTip(TipType.BagIntro, { name: name, showUse: 0 });
        }
    },

    //设置按钮是否可用
    setBtnItct: function (node, bool) {
        node.getComponent(cc.Button).interactable = bool;
    },

    //移动到当前日
    scrollToPercent: function () {
        var percent = Math.floor(this.today / 5) / 6;
        this.checkScroll.scrollToPercentVertical(1 - percent, 0.2);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
