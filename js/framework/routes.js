/**
 * 定义系统路由信息
 */
define(['jquery', 'common','index'], function ($, common,index) {
    var routes = {
        404: {
            title: '系统出错了'
        }
    };

    function getResource(parentid) {
        for (var i = 0; i < sysNavMenusObj.length; i++) {
            var obj = sysNavMenusObj[i];
            if (obj.resourceid == parentid) {
                return obj;
            }
        }
    }

    var sysNavMenusObj = index.sysNavMenus;
    if (sysNavMenusObj && sysNavMenusObj.length > 0) {
        for (var i = 0; i < sysNavMenusObj.length; i++) {
            var obj = sysNavMenusObj[i];
            if (obj.routeUrl && obj.type ==1) {
                routes[obj.routeUrl] = obj;
                if (obj.parentid)
                    obj.parent = getResource(obj.parentid).routeUrl;
            }
        }
    }
    routes.sysNavMenus = sysNavMenusObj;
    return routes;
});