cc.Class({
    extends: cc.Component,

    properties: {
        signInMb: cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        this.initData();
        this.checkSignIn();
    },

    initData() {
        if (!pp.LsGet('gameinit1')) {//本地数据，只初始化一次
            pp.LsSet('gameinit1', 'true');

            for (let name in GameLocal) {
                let obj = GameLocal[name];
                pp.LsSet(name, pp.jsonToString(obj));
                cc.log(obj, name);
            }
        }
    },

    //检测签到
    checkSignIn() {
        this.signInMb.active = false;
        //检测今天是否已经签到过
        let md = getGameLocal('MonthCkDay');
        cc.log(md);
        let today = pp.getDate().getDate();
        if (md.indexOf(today) >= 0) {//已签到
            return;
        }
        this.showSignInMb();
    },

    //显示签到面板
    showSignInMb() {
        this.signInMb.active = true;
        this.signInMb.opacity = 0;
        this.signInMb.runAction(cc.fadeIn(0.5));
    },

    hideSignMb() {
        this.signInMb.runAction(cc.sequence(cc.fadeOut(0.5),cc.callFunc((data)=>{
            data.active = false;
        })));
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
