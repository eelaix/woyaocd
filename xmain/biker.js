var xnplugin = requirePlugin("xnplugin");

Page({

    /**
     * 页面的初始数据
     */
    data: {
        optchargerid: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var theid = options.scene || options.chgid;
        if (theid){
            this.setData({ optchargerid: theid});
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        xnplugin.makeLoading(true);
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {
        xnplugin.makeLoading(false);
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {
        xnplugin.makeLoading(false);
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