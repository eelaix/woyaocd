var app = getApp();
var xnplugin = requirePlugin("xnplugin");

Page({

    /**
     * 页面的初始数据
     */
    data: {
        navbarData: {
            showCapsule: 1,
            title: '单车充电',
        },
        pages: 0,
        height: app.globalData.height * 2 + 20,
        optchargerid: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        wx.setNavigationBarTitle({title: this.data.navbarData.title});
        if (options.q) {
            var qcode = decodeURIComponent(options.q);
            qcode = qcode.split('/');
            if (qcode.length == 7) {
                this.setData({ optchargerid: qcode[6] });
            }
        } else {
            var theid = options.scene || options.chgid;
            if (theid) {
                this.setData({ optchargerid: theid });
            }
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {
        this.setData({ pages: getCurrentPages().length });
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {
        
    }
})