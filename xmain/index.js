var app = getApp();
var xnplugin = requirePlugin("xnplugin");
var isindex = false;
function compareVersion(v1, v2) {
    v1 = v1.split('.')
    v2 = v2.split('.')
    var len = Math.max(v1.length, v2.length)
    while (v1.length < len) {
        v1.push('0')
    }
    while (v2.length < len) {
        v2.push('0')
    }
    for (var i = 0; i < len; i++) {
        var num1 = parseInt(v1[i])
        var num2 = parseInt(v2[i])
        if (num1 > num2) {
            return 1
        } else if (num1 < num2) {
            return -1
        }
    }
    return 0
}

Page({
    data: {
        oldversion: false,
        currentimgid: 0,
        gpsclosed: false,
        allimages: [
            'http://file.woniuev.cn/sito/wx9b4eea8d83f3fa30/banner0.png',
            'http://file.woniuev.cn/sito/wx9b4eea8d83f3fa30/banner1.png',
            'http://file.woniuev.cn/sito/wx9b4eea8d83f3fa30/banner2.png',
            'http://file.woniuev.cn/sito/wx9b4eea8d83f3fa30/banner3.png',
            'http://file.woniuev.cn/sito/wx9b4eea8d83f3fa30/banner4.png',
            'http://file.woniuev.cn/sito/wx9b4eea8d83f3fa30/banner5.png'
        ],
        plugin_userInfo: false
    },
    onLoad: function(options) {
        try {
            var res = wx.getSystemInfoSync();
            var sdkversion = res.SDKVersion;
            var result = compareVersion(sdkversion, '2.1.0');
            if (result==-1){
                this.setData({ oldversion: true });
            }
        } catch (e) {
        }
    },

    reload: function(){
        var tmpid = this.data.currentimgid + 1;
        if (tmpid > 5) {
            tmpid = 0;
        }
        var uInfo = xnplugin.getVserInfo();
        this.setData({
            currentimgid: tmpid,
            plugin_userInfo: uInfo
        });
        if (isindex){
            setTimeout(this.reload, 2000);
        }
    },

    onReady: function() {
        var that = this;
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userLocation'] == false) {
                    that.setData({ gpsclosed: true });
                }
                if (res.authSetting['scope.userInfo'] == false) {
                    xnplugin.setVserInfo(false);
                }
            }
        })
    },

    onShow: function() {
        var uInfo = xnplugin.getVserInfo();
        this.setData({
            plugin_userInfo: uInfo
        });
        isindex = true;
        setTimeout(this.reload, 2000);
    },
    onHide: function() {
        isindex = false;
    },

    onUnload: function() {
        isindex = false;
    },

    scannow: function() {
        var that = this;
        wx.scanCode({
            success: function(res) {
                console.log(res);
                if (res && res.errMsg && res.errMsg.indexOf('ok') > 0) {
                    var path = res.path;
                    if (path) {
                        if (path.indexOf('xmain/biker') > -1 ||
                            path.indexOf('xmain/evcar') > -1 ||
                            path.indexOf('xmain/dccar') > -1 ) {
                            if (path.indexOf('/') > 0){
                                path = '/' + path;
                            }
                            wx.navigateTo({ url: path });
                        } else {
                            wx.showToast({
                                title: '未知二维码'
                            });
                        }
                    } else {
                        wx.showToast({
                            title: '无法识别'
                        });
                    }
                } else {
                    wx.showToast({
                        title: '扫码失败'
                    });
                }
            }
        });
    },

    onShareAppMessage: function () {
        return {
            title: '回家充电，从家出发',
            path: '/xmain/index',
            success: function (res) {}
        }
    }
})