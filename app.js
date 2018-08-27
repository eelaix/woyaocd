var xnplugin = requirePlugin("xnplugin");
App({
    onLaunch: function (options) {
        //xnalugin.setSomeThing('');

        //以下代码是***充电主程序***用的，与插件无关，与充电业务无关
        //这里的app.globalData.userInfo与插件中vserInfo不相同，
        //虽然两者都指向同一个微信使用者，但两者的openid不相同,
        //所属的appid不同，请勿混淆
        wx.login({
            success: res => {
                // 发送 res.code 到后台换取 openId, sessionKey, unionId
            }
        })
        // 获取用户信息
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    wx.getUserInfo({
                        success: res => {
                            // 可以将 res 发送给后台解码出 unionId
                            this.globalData.userInfo = res.userInfo

                            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                            // 所以此处加入 callback 以防止这种情况
                            if (this.userInfoReadyCallback) {
                                this.userInfoReadyCallback(res)
                            }
                        }
                    })
                }
            }
        })
    },
    globalData: {
        userInfo: null
    }
})