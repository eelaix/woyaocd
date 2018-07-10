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

    onReady: function() {},

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

    testdev: function(e) {
        var uinfo = {};
        uinfo.needpay = 0;
        uinfo.chgcnts = 0;
        uinfo.utype = 8;
        uinfo.openid = 'odWYM0ZtU1tbZTSSIAE70vwlR4gA';
        uinfo.nickname = '测试才哥';
        uinfo.usermobile = '13502865534';
        uinfo.headimgurl = 'https://wx.qlogo.cn/mmopen/vi_32/AZq6fh2gwBmyGtDhb9Jfh7yYDGkdqRmPmzoS6QbtnKARDibYUX4rSBQ3Aib4zmiadL2nfLp6CpBrgGK6lwCvcU8Sg/132';
        uinfo.sex = 1;
        uinfo.scheduledchar = 1;
        uinfo.wxnotify = 1;
        uinfo.balance = '5.11';
        uinfo.balanum = 5.11;
        uinfo.chargerids = '';
        uinfo.pakingid = 0;
        uinfo.reghours = 190;
        this.setData({
            plugin_userInfo: uinfo
        });
        xnplugin.setVserInfo(uinfo);
    },
    scannow: function() {
        var that = this;
        wx.scanCode({
            success: function(res) {
                console.log(res);
                if (res && res.errMsg && res.errMsg.indexOf('ok') > 0) {
                    var path = res.path;
                    if (path) {
                        if (path.indexOf('pages/biker') > -1 ||
                            path.indexOf('pages/evcar') > -1 ||
                            path.indexOf('pages/dccar') > -1 ) {
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
    }
})