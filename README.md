# adminlite-plus
关于其具体实现可参考：https://zhuanlan.zhihu.com/p/37796924
## 如何使用
对于使用者来说不需要过多关注上边的具体实现，下载项目后添加新的模块只要按照下面的饿步骤即可：

项目目录结构如下：
![Image](https://pic3.zhimg.com/80/v2-22e0099d826644d6dcf846249c18a8e7_hd.jpg)

我们需要添加的模块位于templates目录，其下按照业务模块划分，js/css/html文件都在一个目录。现在我要添加一个新的模块test:

### 1，在templates下新建test目录和文件test.js/test.css/test.html

### 2，在主模块main.js中添加相应的模块定义
![Image](https://pic4.zhimg.com/80/v2-bcf6f5ec0c11b2d8d83067ab19a4f136_hd.jpg)

注意：html文件模板后面的后缀要填写

### 3，编辑控制器模块test.js

define(['dialog', 'common', 'knockout', 'knockout-mapping', 'jquery', 'gotoTop'], function (dialog, common, ko, mapping, $) {
    ko.mapping = mapping;

    function test() {
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

    return new test();
});
模块实现部分按照上边的模式进行编写即可,init主要是定义模型数据，afterRender则是发送请求获取数据然后通过ko进行数据的绑定。

### 4，页面编写

在test.html编写HTML代码即可

## 总结
这个后端开发框架只是传统的基于jQuery和knockout进行数据双向绑定，提供简单的路由视图切换功能。使用者只需按照固定的模式添加功能模块即可。因为使用require进行模块管理，也便于对系统进行模块划分和功能复用。

除了提供一个脚手架的开发框架之后，系统还默认继承了诸多的jquery插件，并对require进行试了适配，具体的相关库如下：

datatables
highcharts
highcharts-map
jquery.treegrid
jquery.fileupload
jquery.storageapi
jquery.mCustomScrollbar
jquery.imgareaselect
icheck
select2
ztree
