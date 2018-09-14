define(['jquery', 'jquery.blockui'], function ($) {
    var tab = {};
    var isFullScreen = false;

    function getViewPort() {
        var e = window,
            a = 'inner';
        if (!('innerWidth' in window)) {
            a = 'client';
            e = document.documentElement || document.body;
        }

        return {
            width: e[a + 'Width'],
            height: e[a + 'Height']
        };
    }

    //初始化iframe内容页高度
    var handleTabContent = function () {
        var ht = $(window).height();//获取浏览器窗口的整体高度；

        var $footer = $(".main-footer");
        var $header = $(".main-header");
        var $tabs = $(".content-tabs");

        var height = getViewPort().height - $footer.outerHeight() - $header.outerHeight();
        if ($tabs.is(":visible")) {
            height = height - $tabs.outerHeight();
        }

        $(".tab_iframe").css({
            height: height,
            width: "100%"
        });

        //var width = getViewPort().width- $(".page-sidebar-menu").width();
        /*$(".tab_iframe").css({
         });*/
    };

    function fixTabCotent() {
        setTimeout(function () {
            //_runResizeHandlers();
            handleTabContent();
        }, 50);
    };
    var requestFullScreen = function () {
        var de = document.documentElement;

        if (de.requestFullscreen) {
            de.requestFullscreen();
        } else if (de.mozRequestFullScreen) {
            de.mozRequestFullScreen();
        } else if (de.webkitRequestFullScreen) {
            de.webkitRequestFullScreen();
        }
        else {
            alert("该浏览器不支持全屏！");
        }

    };
//退出全屏 判断浏览器种类
    var exitFull = function () {
        // 判断各种浏览器，找到正确的方法
        var exitMethod = document.exitFullscreen || //W3C
            document.mozCancelFullScreen ||    //Chrome等
            document.webkitExitFullscreen || //FireFox
            document.webkitExitFullscreen; //IE11
        if (exitMethod) {
            exitMethod.call(document);
        }
        else if (typeof window.ActiveXObject !== "undefined") {//for Internet Explorer
            var wscript = new ActiveXObject("WScript.Shell");
            if (wscript !== null) {
                wscript.SendKeys("{F11}");
            }
        }
    };

    var handleFullScreen = function () {
        if (isFullScreen) {
            exitFull();
            isFullScreen = false;
        } else {
            requestFullScreen();
            isFullScreen = true;
        }
    }
//保存页面id的field
    var pageIdField = "data-pageId";

    function getPageId(element) {
        if (element instanceof jQuery) {
            return element.attr(pageIdField);
        } else {
            return $(element).attr(pageIdField);
        }
    }

    function findTabTitle(pageId) {
        var $ele = null;
        $(".page-tabs-content").find("a.menu_tab").each(function () {
            var $a = $(this);
            if ($a.attr(pageIdField) == pageId) {
                $ele = $a;
                return false;//退出循环
            }
        });
        return $ele;
    }

    function findTabPanel(pageId) {
        var $ele = null;
        $("#tab-content").find("div.tab-pane").each(function () {
            var $div = $(this);
            if ($div.attr(pageIdField) == pageId) {
                $ele = $div;
                return false;//退出循环
            }
        });
        return $ele;
    }

    function findTabById(pageId) {
        return findTabPanel(pageId).children("iframe");
    }

    function getActivePageId() {
        var $a = $('.page-tabs-content').find('.active');
        return getPageId($a);
    }

    function canRemoveTab(pageId) {
        return findTabTitle(pageId).find('.fa-remove').size() > 0;
    }

    // wrApper function to  block element(indicate loading)
    function blockUI(options) {
        options = $.extend(true, {}, options);
        var html = '';
        if (options.animate) {
            html = '<div class="loading-message ' + (options.boxed ? 'loading-message-boxed' : '') + '">' + '<div class="block-spinner-bar"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>' + '</div>';
        } else if (options.iconOnly) {
            html = '<div class="loading-message ' + (options.boxed ? 'loading-message-boxed' : '') + '"><img src="' + baseUrl + '/image/loading-spinner-grey.gif" align=""></div>';
        } else if (options.textOnly) {
            html = '<div class="loading-message ' + (options.boxed ? 'loading-message-boxed' : '') + '"><span>&nbsp;&nbsp;' + (options.message ? options.message : 'LOADING...') + '</span></div>';
        } else {
            html = '<div class="loading-message ' + (options.boxed ? 'loading-message-boxed' : '') + '"><img src="' + baseUrl + '/image/loading-spinner-grey.gif" align=""><span>&nbsp;&nbsp;' + (options.message ? options.message : 'LOADING...') + '</span></div>';
        }

        if (options.target) { // element blocking
            var el = $(options.target);
            if (el.height() <= ($(window).height())) {
                options.cenrerY = true;
            }
            el.block({
                message: html,
                baseZ: options.zIndex ? options.zIndex : 1000,
                centerY: options.cenrerY !== undefined ? options.cenrerY : false,
                css: {
                    top: '10%',
                    border: '0',
                    padding: '0',
                    backgroundColor: 'none'
                },
                overlayCSS: {
                    backgroundColor: options.overlayColor ? options.overlayColor : '#555',
                    opacity: options.boxed ? 0.05 : 0.1,
                    cursor: 'wait'
                }
            });
        } else { // page blocking
            $.blockUI({
                message: html,
                baseZ: options.zIndex ? options.zIndex : 1000,
                css: {
                    border: '0',
                    padding: '0',
                    backgroundColor: 'none'
                },
                overlayCSS: {
                    backgroundColor: options.overlayColor ? options.overlayColor : '#555',
                    opacity: options.boxed ? 0.05 : 0.1,
                    cursor: 'wait'
                }
            });
        }
    };

    // wrApper function to  un-block element(finish loading)
    function unblockUI(target) {
        if (target) {
            $(target).unblock({
                onUnblock: function () {
                    $(target).css('position', '');
                    $(target).css('zoom', '');

                }
            });
        } else {
            $.unblockUI();
        }
    };
    var optionsList = [];
    //添加tab
    tab.addTabs = function (optionsIn) {
        var defaultTabOptions = {
            id: Math.random() * 200,
            urlType: "relative",
            title: "新页面"
        };

        var options = $.extend(true, defaultTabOptions, optionsIn);
        var hasOp = false;
        for (var i = 0; i < optionsList.length; i++) {
            if (optionsList[i].id == options.id) {
                hasOp = true;
                break;
            }
        }
        if (!hasOp) optionsList.push(options);
        if (options.urlType === "relative") {
            // var url = window.location.protocol + '//' + window.location.host + "/";
            var basePath = window.location.pathname + "/../";
            options.url = basePath + options.url;
        }

        var pageId = options.id;

        //判断这个id的tab是否已经存在,不存在就新建一个
        if (findTabPanel(pageId) === null) {

            //创建新TAB的title
            var $title = $('<a href="javascript:void(0);"></a>').attr(pageIdField, pageId).addClass("menu_tab");

            var $text = $("<span class='page_tab_title'></span>").text(options.title).appendTo($title);

            //是否允许关闭
            if (options.close) {
                var $i = $("<i class='fa fa-remove page_tab_close' style='cursor: pointer'></i>").attr(pageIdField, pageId).appendTo($title);
            }

            //加入TABS
            $(".page-tabs-content").append($title);


            var $tabPanel = $('<div role="tabpanel" class="tab-pane"> <div data-model="' + options.modelId + '"></div></div>').attr(pageIdField, pageId);

            if (!options.isIframe) {
                //是否指定TAB内容
                if (options.content) {
                    $tabPanel.children().eq(0).append(options.content);
                    if (options.callback) options.callback();
                }
                //加载远程请求返回的页面
                if (options.url) {
                    $.get(options.url, function (response) {
                        $tabPanel.children().eq(0).append(response);
                        if (options.callback) options.callback();
                    });
                }
            } else {
                //没有内容，使用IFRAME打开链接
                blockUI({
                    target: '#tab-content',
                    boxed: true,
                    message: '加载中......'//,
                    // animate: true
                });

                var $iframe = $("<iframe></iframe>").attr("src", options.url).css("width", "100%").attr("frameborder", "no").attr("id", "iframe_" + pageId).addClass("tab_iframe").attr(pageIdField, pageId);
                //iframe 加载完成事件
                $iframe.load(function () {
                    unblockUI('#tab-content');//解锁界面
                    fixTabCotent();//修正高度
                    if (options.callback) options.callback();
                });

                $tabPanel.append($iframe);

            }

            // $tab = $(content);
            $("#tab-content").append($tabPanel);
            activeTabByPageId(pageId);
        } else {
            refreshTabById(pageId);
            activeTabByPageId(pageId);
        }


    };

    //关闭tab
    tab.closeTab = function (item) {
        //item可以是a标签,也可以是i标签
        //它们都有data-id属性,获取完成之后就没事了
        var pageId = getPageId(item);
        closeTabByPageId(pageId);
    };

    function closeTabByPageId(pageId) {
        var $title = findTabTitle(pageId);//有tab的标题
        var $tabPanel = findTabPanel(pageId);//装有iframe

        if ($title.hasClass("active")) {
            //要关闭的tab处于活动状态
            //要把active class传递给其它tab

            //优先传递给后面的tab,没有的话就传递给前一个
            var $nextTitle = $title.next();
            var activePageId;
            if ($nextTitle.size() > 0) {
                activePageId = getPageId($nextTitle);
            } else {
                activePageId = getPageId($title.prev());
            }

            setTimeout(function () {
                //某种bug，需要延迟执行
                activeTabByPageId(activePageId);
            }, 100);

        } else {
            //要关闭的tab不处于活动状态
            //直接移除就可以了,不用传active class

        }

        $title.remove();
        $tabPanel.remove();
        // scrollToTab($('.menu_tab.active')[0]);

    }

    function closeTabOnly(pageId) {
        var $title = findTabTitle(pageId);//有tab的标题
        var $tabPanel = findTabPanel(pageId);//装有iframe
        $title.remove();
        $tabPanel.remove();
    }

    tab.closeCurrentTab = function () {
        var pageId = getActivePageId();
        if (canRemoveTab(pageId)) {
            closeTabByPageId(pageId);
        }
    };

    function refreshTabById(pageId) {
        var options;
        for (var i = 0; i < optionsList.length; i++) {
            if (optionsList[i].id == pageId) {
                options = optionsList[i];
                break;
            }

        }
        if (!options) return;
        //刷新iframe
        if (options.isIframe) {
            var $iframe = findTabById(pageId);
            var url = $iframe.attr('src');

            if (url.indexOf(top.document.domain) < 0) {
                $iframe.attr("src", url);// 跨域状况下，重新设置url
            } else {
                $iframe[0].contentWindow.location.reload(true);//带参数刷新
            }

            blockUI({
                target: '#tab-content',
                boxed: true,
                message: '加载中......'//,
                // animate: true
            });
        } else {
            //加载远程请求返回的页面
            if (options.url) {
                //因为html模板只需加载一次，重新请求数据即可
                if (options.callback && options.pageData) {
                    //重置一些变量
                    if (options.pageData.reset)
                        options.pageData.reset();
                    options.pageData.afterRender(options.pageData.modelId);
                }

            }
        }

    }

    tab.refreshTab = function () {
        //刷新当前tab
        var pageId = getActivePageId();
        refreshTabById(pageId);
    };

    function getTabUrlById(pageId) {
        var $iframe = findTabById(pageId);
        return $iframe[0].contentWindow.location.href;
    }

    function getTabUrl(element) {
        var pageId = getPageId(element);
        getTabUrlById(pageId);
    }


    /**
     * 编辑tab的标题
     * @param pageId
     * @param title
     */
    function editTabTitle(pageId, title) {
        var $title = findTabTitle(pageId);//有tab的标题
        var $span = $title.children("span.page_tab_title");
        $span.text(title);
    }

//计算多个jq对象的宽度和
    var calSumWidth = function (element) {
        var width = 0;
        $(element).each(function () {
            width += $(this).outerWidth(true);
        });
        return width;
    };
    //滚动到指定选项卡
    var scrollToTab = function (element) {
        //element是tab(a标签),装有标题那个
        //div.content-tabs > div.page-tabs-content
        var marginLeftVal = calSumWidth($(element).prevAll()),//前面所有tab的总宽度
            marginRightVal = calSumWidth($(element).nextAll());//后面所有tab的总宽度
        //一些按钮(向左,向右滑动)的总宽度
        var tabOuterWidth = calSumWidth($(".content-tabs").children().not(".menuTabs"));
        // tab(a标签)显示区域的总宽度
        var visibleWidth = $(".content-tabs").outerWidth(true) - tabOuterWidth;
        //将要滚动的长度
        var scrollVal = 0;
        if ($(".page-tabs-content").outerWidth() < visibleWidth) {
            //所有的tab都可以显示的情况
            scrollVal = 0;
        } else if (marginRightVal <= (visibleWidth - $(element).outerWidth(true) - $(element).next().outerWidth(true))) {
            //向右滚动
            //marginRightVal(后面所有tab的总宽度)小于可视区域-(当前tab和下一个tab的宽度)
            if ((visibleWidth - $(element).next().outerWidth(true)) > marginRightVal) {
                scrollVal = marginLeftVal;
                var tabElement = element;
                while ((scrollVal - $(tabElement).outerWidth()) > ($(".page-tabs-content").outerWidth() - visibleWidth)) {
                    scrollVal -= $(tabElement).prev().outerWidth();
                    tabElement = $(tabElement).prev();
                }
            }
        } else if (marginLeftVal > (visibleWidth - $(element).outerWidth(true) - $(element).prev().outerWidth(true))) {
            //向左滚动
            scrollVal = marginLeftVal - $(element).prev().outerWidth(true);
        }
        //执行动画
        $('.page-tabs-content').animate({
            marginLeft: 0 - scrollVal + 'px'
        }, "fast");
        /*
                //滚动按钮可见性控制
                var marginLeftVal = Math.abs(parseInt($('.page-tabs-content').css('margin-left')));
                var tabOuterWidth = calSumWidth($(".content-tabs").children().not(".menuTabs"));
                var visibleWidth = $(".content-tabs").outerWidth(true) - tabOuterWidth;
                if ($(".page-tabs-content").width() < visibleWidth) {
                    $('.tabLeft').hide();
                    $('.tabRight').hide();
                }else{
                    $('.tabLeft').show();
                    $('.tabRight').show();
                }*/
    };
    //滚动条滚动到左边
    var scrollTabLeft = function () {
        var marginLeftVal = Math.abs(parseInt($('.page-tabs-content').css('margin-left')));
        var tabOuterWidth = calSumWidth($(".content-tabs").children().not(".menuTabs"));
        var visibleWidth = $(".content-tabs").outerWidth(true) - tabOuterWidth;
        var scrollVal = 0;
        if ($(".page-tabs-content").width() < visibleWidth) {
            return false;
        } else {
            var tabElement = $(".menu_tab:first");
            var offsetVal = 0;
            while ((offsetVal + $(tabElement).outerWidth(true)) <= marginLeftVal) {
                offsetVal += $(tabElement).outerWidth(true);
                tabElement = $(tabElement).next();
            }
            offsetVal = 0;
            if (calSumWidth($(tabElement).prevAll()) > visibleWidth) {
                while ((offsetVal + $(tabElement).outerWidth(true)) < (visibleWidth) && tabElement.length > 0) {
                    offsetVal += $(tabElement).outerWidth(true);
                    tabElement = $(tabElement).prev();
                }
                scrollVal = calSumWidth($(tabElement).prevAll());
            }
        }
        $('.page-tabs-content').animate({
            marginLeft: 0 - scrollVal + 'px'
        }, "fast");
    };
    //滚动条滚动到右边
    var scrollTabRight = function () {
        var marginLeftVal = Math.abs(parseInt($('.page-tabs-content').css('margin-left')));
        var tabOuterWidth = calSumWidth($(".content-tabs").children().not(".menuTabs"));
        var visibleWidth = $(".content-tabs").outerWidth(true) - tabOuterWidth;
        var scrollVal = 0;
        if ($(".page-tabs-content").width() < visibleWidth) {
            return false;
        } else {
            var tabElement = $(".menu_tab:first");
            var offsetVal = 0;
            while ((offsetVal + $(tabElement).outerWidth(true)) <= marginLeftVal) {
                offsetVal += $(tabElement).outerWidth(true);
                tabElement = $(tabElement).next();
            }
            offsetVal = 0;
            while ((offsetVal + $(tabElement).outerWidth(true)) < (visibleWidth) && tabElement.length > 0) {
                offsetVal += $(tabElement).outerWidth(true);
                tabElement = $(tabElement).next();
            }
            scrollVal = calSumWidth($(tabElement).prevAll());
            if (scrollVal > 0) {
                $('.page-tabs-content').animate({
                    marginLeft: 0 - scrollVal + 'px'
                }, "fast");
            }
        }
    };

    tab.closeLeft = function () {
        $('.page-tabs-content').find('.active').prevAll().each(function () {
            var $a = $(this);
            var pageId = getPageId($a);
            if (canRemoveTab(pageId)) {
                closeTabOnly(pageId);
            }
        });
    };
    tab.closeRight = function () {
        $('.page-tabs-content').find('.active').nextAll().each(function () {
            var $a = $(this);
            var pageId = getPageId($a);
            if (canRemoveTab(pageId)) {
                closeTabOnly(pageId);
            }
        });
    };
    //关闭其他选项卡
    tab.closeOtherTabs = function (isAll) {
        if (isAll) {
            //关闭全部
            $('.page-tabs-content').children("[" + pageIdField + "]").find('.fa-remove').parents('a').each(function () {
                var $a = $(this);
                var pageId = getPageId($a);
                closeTabOnly(pageId);

                // tab.closeTab($a);
                /*$('#' + $(this).data('id')).remove();
                 $(this).remove();*/
            });
            var firstChild = $(".page-tabs-content").children().eq(0); //选中那些删不掉的第一个菜单
            if (firstChild) {
                //激活这个选项卡
                activeTabByPageId(getPageId(firstChild));

                /*$('#' + firstChild.data('id')).addClass('active');
                 firstChild.addClass('active');*/
            }
        } else {
            //除此之外全部删除
            $('.page-tabs-content').children("[" + pageIdField + "]").find('.fa-remove').parents('a').not(".active").each(function () {
                var $a = $(this);
                var pageId = getPageId($a);
                closeTabOnly(pageId);

                // tab.closeTab($a);
                /*$('#' + $(this).data('id')).remove();
                 $(this).remove();*/
            });

        }
    };

    //激活Tab,通过id
    function activeTabByPageId(pageId) {
        $(".menu_tab").removeClass("active");
        $("div[role='tabpanel']").removeClass("active");
        //激活TAB
        var $title = findTabTitle(pageId).addClass('active');
        findTabPanel(pageId).addClass("active");
        scrollToTab($title[0]);
    }

    //tab右键菜单管理
    var context = (function () {

        var options = {
            fadeSpeed: 100,
            filter: function ($obj) {
                // Modify $obj, Do not return
            },
            above: 'auto',
            left: 'auto',
            preventDoubleContext: true,
            compress: false
        };

        function initialize(opts) {

            options = $.extend({}, options, opts);

            $(document).on('click', function () {
                $('.dropdown-context').fadeOut(options.fadeSpeed, function () {
                    $('.dropdown-context').css({display: ''}).find('.drop-left').removeClass('drop-left');
                });
            });
            if (options.preventDoubleContext) {
                $(document).on('contextmenu', '.dropdown-context', function (e) {
                    e.preventDefault();
                });
            }
            $(document).on('mouseenter', '.dropdown-submenu', function () {
                var $sub = $(this).find('.dropdown-context-sub:first'),
                    subWidth = $sub.width(),
                    subLeft = $sub.offset().left,
                    collision = (subWidth + subLeft) > window.innerWidth;
                if (collision) {
                    $sub.addClass('drop-left');
                }
            });

        }

        function updateOptions(opts) {
            options = $.extend({}, options, opts);
        }

        function buildMenu(data, id, subMenu) {
            var subClass = (subMenu) ? ' dropdown-context-sub' : '',
                compressed = options.compress ? ' compressed-context' : '',
                $menu = $('<ul class="dropdown-menu dropdown-context' + subClass + compressed + '" id="dropdown-' + id + '"></ul>');

            return buildMenuItems($menu, data, id, subMenu);
        }

        function buildMenuItems($menu, data, id, subMenu, addDynamicTag) {
            var linkTarget = '';
            for (var i = 0; i < data.length; i++) {
                if (typeof data[i].divider !== 'undefined') {
                    var divider = '<li class="divider';
                    divider += (addDynamicTag) ? ' dynamic-menu-item' : '';
                    divider += '"></li>';
                    $menu.append(divider);
                } else if (typeof data[i].header !== 'undefined') {
                    var header = '<li class="nav-header';
                    header += (addDynamicTag) ? ' dynamic-menu-item' : '';
                    header += '">' + data[i].header + '</li>';
                    $menu.append(header);
                } else if (typeof data[i].menu_item_src !== 'undefined') {
                    var funcName;
                    if (typeof data[i].menu_item_src === 'function') {
                        if (data[i].menu_item_src.name === "") { // The function is declared like "foo = function() {}"
                            for (var globalVar in window) {
                                if (data[i].menu_item_src == window[globalVar]) {
                                    funcName = globalVar;
                                    break;
                                }
                            }
                        } else {
                            funcName = data[i].menu_item_src.name;
                        }
                    } else {
                        funcName = data[i].menu_item_src;
                    }
                    $menu.append('<li class="dynamic-menu-src" data-src="' + funcName + '"></li>');
                } else {
                    if (typeof data[i].href == 'undefined') {
                        data[i].href = 'javascript:;';
                    }
                    if (typeof data[i].target !== 'undefined') {
                        linkTarget = ' target="' + data[i].target + '"';
                    }
                    if (typeof data[i].subMenu !== 'undefined') {
                        var sub_menu = '<li class="dropdown-submenu';
                        sub_menu += (addDynamicTag) ? ' dynamic-menu-item' : '';
                        sub_menu += '"><a tabindex="-1" href="' + data[i].href + '">' + data[i].text + '</a></li>'
                        $sub = (sub_menu);
                    } else {
                        var element = '<li';
                        element += (addDynamicTag) ? ' class="dynamic-menu-item"' : '';
                        element += '><a tabindex="-1" href="' + data[i].href + '"' + linkTarget + '>';
                        if (typeof data[i].icon !== 'undefined')
                            element += '<span class="glyphicon ' + data[i].icon + '"></span> ';
                        element += data[i].text + '</a></li>';
                        $sub = $(element);
                    }
                    if (typeof data[i].action !== 'undefined') {
                        $action = data[i].action;
                        $sub
                            .find('a')
                            .addClass('context-event')
                            .on('click', createCallback($action));
                    }
                    $menu.append($sub);
                    if (typeof data[i].subMenu != 'undefined') {
                        var subMenuData = buildMenu(data[i].subMenu, id, true);
                        $menu.find('li:last').append(subMenuData);
                    }
                }
                if (typeof options.filter == 'function') {
                    options.filter($menu.find('li:last'));
                }
            }
            return $menu;
        }

        function addContext(selector, data) {
            if (typeof data.id !== 'undefined' && typeof data.data !== 'undefined') {
                var id = data.id;
                $menu = $('body').find('#dropdown-' + id)[0];
                if (typeof $menu === 'undefined') {
                    $menu = buildMenu(data.data, id);
                    $('body').append($menu);
                }
            } else {
                var d = new Date(),
                    id = d.getTime(),
                    $menu = buildMenu(data, id);
                $('body').append($menu);
            }

            //右键事件
            $(selector).on('contextmenu', function (e) {
                e.preventDefault();
                e.stopPropagation();

                rightClickEvent = e;
                currentContextSelector = $(this);

                $('.dropdown-context:not(.dropdown-context-sub)').hide();

                $dd = $('#dropdown-' + id);

                $dd.find('.dynamic-menu-item').remove(); // Destroy any old dynamic menu items
                $dd.find('.dynamic-menu-src').each(function (idx, element) {
                    var menuItems = window[$(element).data('src')]($(selector));
                    $parentMenu = $(element).closest('.dropdown-menu.dropdown-context');
                    $parentMenu = buildMenuItems($parentMenu, menuItems, id, undefined, true);
                });

                if (typeof options.above == 'boolean' && options.above) {
                    $dd.addClass('dropdown-context-up').css({
                        top: e.pageY - 20 - $('#dropdown-' + id).height(),
                        left: e.pageX - 13
                    }).fadeIn(options.fadeSpeed);
                } else if (typeof options.above == 'string' && options.above == 'auto') {
                    $dd.removeClass('dropdown-context-up');
                    var autoH = $dd.height() + 12;
                    if ((e.pageY + autoH) > $('html').height()) {
                        $dd.addClass('dropdown-context-up').css({
                            top: e.pageY - 20 - autoH,
                            left: e.pageX - 13
                        }).fadeIn(options.fadeSpeed);
                    } else {
                        $dd.css({
                            top: e.pageY + 10,
                            left: e.pageX - 13
                        }).fadeIn(options.fadeSpeed);
                    }
                }

                if (typeof options.left == 'boolean' && options.left) {
                    $dd.addClass('dropdown-context-left').css({
                        left: e.pageX - $dd.width()
                    }).fadeIn(options.fadeSpeed);
                } else if (typeof options.left == 'string' && options.left == 'auto') {
                    $dd.removeClass('dropdown-context-left');
                    var autoL = $dd.width() - 12;
                    if ((e.pageX + autoL) > $('html').width()) {
                        $dd.addClass('dropdown-context-left').css({
                            left: e.pageX - $dd.width() + 13
                        });
                    }
                }
            });
        }

        function destroyContext(selector) {
            $(document).off('contextmenu', selector).off('click', '.context-event');
        }

        return {
            init: initialize,
            settings: updateOptions,
            attach: addContext,
            destroy: destroyContext
        };
    })();
    var createCallback = function (func) {
        return function (event) {
            func(event, currentContextSelector, rightClickEvent)
        };
    };

    $(function () {
        var $tabs = $(".menuTabs");
        //点击选项卡的时候就激活tab
        $tabs.on("click", ".menu_tab", function () {
            var pageId = getPageId(this);
            activeTabByPageId(pageId);
        });

        //双击选项卡刷新页面
        $tabs.on("dblclick", ".menu_tab", function () {
            // console.log("dbclick");
            var pageId = getPageId(this);
            refreshTabById(pageId);
        });

        //选项卡右键菜单
        function findTabElement(target) {
            var $ele = $(target);
            if (!$ele.is("a")) {
                $ele = $ele.parents("a.menu_tab");
            }
            return $ele;
        }

        context.init({
            preventDoubleContext: false,//不禁用原始右键菜单
            compress: true//元素更少的padding
        });
        context.attach('.page-tabs-content', [
            {
                text: '刷新',
                action: function (e, $selector, rightClickEvent) {
                    //e是点击菜单的事件
                    //$selector就是＄（".page-tabs-content")
                    //rightClickEvent就是右键打开菜单的事件

                    var pageId = getPageId(findTabElement(rightClickEvent.target));
                    refreshTabById(pageId);

                }
            },
            {
                text: "在新窗口打开",
                action: function (e, $selector, rightClickEvent) {
                    var pageId = getActivePageId();
                    var options;
                    for (var i = 0; i < optionsList.length; i++) {
                        if (optionsList[i].id == pageId) {
                            options = optionsList[i];
                            break;
                        }
                    }
                    if (options.isIframe) {
                        var pageId = getPageId(findTabElement(rightClickEvent.target));
                        var url = getTabUrlById(pageId);
                        window.open(url);
                    }
                }
            },
            {
                text: "关闭当前",
                action: function (e, $selector, rightClickEvent) {
                    tab.closeCurrentTab();
                }
            },
            {
                text: "关闭全部",
                action: function (e, $selector, rightClickEvent) {
                    tab.closeOtherTabs(true);
                }
            },
            {
                text: "关闭非当前",
                action: function (e, $selector, rightClickEvent) {
                    tab.closeOtherTabs();
                }
            },
            {
                text: "关闭左边所有",
                action: function (e, $selector, rightClickEvent) {
                    tab.closeLeft();
                }
            },
            {
                text: "关闭右边所有",
                action: function (e, $selector, rightClickEvent) {
                    tab.closeRight();
                }
            }
        ]);
        /* $('.tabReload').click(function () {
             tab.refreshTab();
         });
         $('.tabCloseCurrent').click(function () {
             tab.closeCurrentTab();
         });
         $('.tabCloseAll').click(function () {
             tab.closeOtherTabs(true);
         });
         $('.tabCloseOther').click(function () {
             tab.closeOtherTabs();
         });*/
        $('.tabLeft').click(function () {
            scrollTabLeft();
        });
        $('.tabRight').click(function () {
            scrollTabRight();
        });
        $('.fullscreen').click(function () {
            handleFullScreen();
        });
        $(document).on('click', '.page_tab_close', function () {
            tab.closeTab(this);
        });
    });
    return tab;
});