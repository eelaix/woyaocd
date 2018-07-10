var xnplugin = requirePlugin("xnplugin");
App({
    onLaunch: function (options) {
        //xnalugin.setSomeThing('');
    },

    //以下代码是***充电主程序***用的，与插件无关，也充电业务无关
    //这里的app.globalData.userInfo与插件中vserInfo不相同，
    //虽然两者都指向同一个微信使用者，但两者的openid不相同,所属的appid不同，请勿混淆
    getUserInfo: function (cb) {
        if (this.globalData.userInfo) {
            var that = this;
            wx.checkSession({
                success: function () {
                    typeof cb == "function" && cb(that.globalData.userInfo)
                },
                fail: function () {
                    that.dologin(cb);
                }
            });
        } else {
            this.dologin(cb);
        }
    },
    dologin: function (cb) {
        var that = this;
        ///////////////////////////////////////////////////////////start login
        wx.login({
            success: function (loginres) {
                var code = loginres.code;
                wx.getUserInfo({
                    withCredentials: true,
                    success: function (ures) {
                        typeof cb == 'function' && cb(ures.userInfo);
                    }
                })
            }
        });
        ///////////////////////////////////////////////////////////end login
    },
    globalData: {
        userInfo: null
    }
})