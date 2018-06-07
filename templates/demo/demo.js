define(['dialog', 'common', 'knockout', 'knockout-mapping', 'jquery', 'gotoTop'], function (dialog, common, ko, mapping, $) {
    ko.mapping = mapping;

    function demo() {
        //数据初始化和KO绑定
        this.init = function () {

        };
        this.initUI = function () {
            this.initEvent();

        };
        this.initEvent = function () {

        };
        //渲染UI
        this.afterRender = function () {
            this.initUI()
        };
    };

    return new demo();
});