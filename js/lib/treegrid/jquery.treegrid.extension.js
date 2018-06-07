(function ($) {
    ;

    function initData(target, options, data) {
        //构造表头
        if (options.customTHead === true) {
            // 复杂表头在html中手动创建
        } else {
            //表头不需要重建
            if(target.find('thead').length == 0){
                var thr = $('<tr></tr>');
                $.each(options.columns, function (i, item) {
                    var th = $('<th style="padding:10px;"></th>');
                    th.html(item.title);
                    thr.append(th);
                });
                var thead = $('<thead></thead>');
                thead.append(thr);
                target.append(thead);
            }
        }

        //构造表体
        var tbody = $('<tbody></tbody>');
        var rootNode = target.getRootNodes(data);
        $.each(rootNode, function (i, item) {
            var tr = $('<tr></tr>');
            if (options.customTrClass !== null) {
                $.each(options.customClassTrIDs, function (index, id) {
                    if (item[options.id] === id) {
                        tr.addClass(options.customTrClass);
                        return false;
                    }
                });
            }
            tr.click(function () {
                $(this).siblings().removeClass('selected');
                $(this).toggleClass('selected');
            });
            var id = item[options.id];
            tr.addClass('treegrid-' + id);
            tr.attr('id','treegrid-'+id);
            $.each(options.columns, function (index, column) {
                var td = $('<td></td>');
                if (column.textAlign !== undefined && column.textAlign !== null) {
                    td.attr('align', column.textAlign);
                }
                if (column.defaultText) {
                    td.html(column.defaultText);
                } else {
                    var icon = '<span><i class="fa ' + options.parentIconClass + '" aria-hidden="true"  style="padding-right: 5px"></i></span>';
                    if (options.noIcon === true) icon = '';
                    var field;
                    if( typeof column.field === 'function'){
                        field = column.field(item);
                    }else{
                        field = item[column.field];
                    }
                    if (index == 0)
                        field = icon + field;
                }
                td.html(field);
                tr.append(td);
            });
            tbody.append(tr);
            target.getChildNodes(data, item, id, tbody);
        });
        target.append(tbody);
        if (!data || data.length == 0) {
            tbody.append('<tr style="text-align: center"><td colspan="' + options.columns.length + '">没有数据</td></tr>');
            return;
        }
        target.treegrid({
            expanderExpandedClass: options.expanderExpandedClass,
            expanderCollapsedClass: options.expanderCollapsedClass
        });
        if (!options.expandAll) {
            target.treegrid('collapseAll');
        }
        //有叶子节点的子节点图标修改为根节点一样
        if (options.noIcon !== true) {
            $(".treegrid-expander.glyphicon").each(function () {
                var $i = $(this).next().find('i').eq(0);
                if ($i.hasClass(options.childIconClass))
                    $i.removeClass(options.childIconClass).addClass(options.parentIconClass);
            });
        }
        if(options.success && typeof options.success === 'function')
            options.success();
    }

    $.fn.treegridData = function (options, param) {
        var target;
        //如果是调用方法
        if (typeof options == 'string') {
            return $.fn.treegridData.methods[options](this, param);
        }

        //如果是初始化组件
        options = $.extend({}, $.fn.treegridData.defaults, options || {});
        target = $(this);
        target.options = options;
        //得到根节点
        target.getRootNodes = function (data) {
            var result = [];
            $.each(data, function (index, item) {
                if (!item[options.parentColumn]) {
                    result.push(item);
                }
            });
            return result;
        };
        //递归获取子节点并且设置子节点
        target.getChildNodes = function (data, parentNode, parentIndex, tbody) {
            $.each(data, function (i, item) {
                if (item[options.parentColumn] == parentNode[options.id]) {
                    var tr = $('<tr></tr>');
                    if (options.customTrClass !== null) {
                        $.each(options.customClassTrIDs, function (index, id) {
                            if (item[options.id] === id) {
                                tr.addClass(options.customTrClass);
                                return;
                            }
                        });
                    }
                    tr.click(function () {
                        $(this).siblings().removeClass('selected');
                        $(this).toggleClass('selected');
                    });
                    var id = item[options.id];
                    var nowParentIndex = (parentIndex + id);
                    //防止出现ParentIndex冲突
                    tr.addClass('treegrid-nowParentIndex-' + nowParentIndex);
                    tr.addClass('treegrid-parent-' + parentIndex);
                    tr.attr('id','treegrid-'+id);
                    $.each(options.columns, function (index, column) {
                        var td = $('<td></td>');
                        if (column.textAlign !== undefined && column.textAlign !== null) {
                            td.attr('align', column.textAlign);
                        }
                        if (column.defaultText) {
                            td.html(column.defaultText);
                        } else {
                            var field;
                            if( typeof column.field === 'function'){
                                field = column.field(item);
                            }else{
                                field = item[column.field];
                            }
                            var icon = '<span><i class="fa ' + options.childIconClass + '" aria-hidden="true" style="padding-right: 5px"></i></span>';
                            if (options.noIcon === true) icon = '';
                            if (index == 0)
                                field = icon + field;
                            td.html(field);
                        }
                        tr.append(td);
                    });
                    tbody.append(tr);
                    target.getChildNodes(data, item, nowParentIndex, tbody)

                }
            });
        };
        target.addClass('table');
        if (options.striped) {
            target.addClass('table-striped');
        }
        if (options.bordered) {
            target.addClass('table-bordered');
        }
        if (options.url) {
            $.get(options.url, options.ajaxParams, function (data) {
                target.options.data = data;
                initData(target, target.options, data);
            });
        }
        else {
            //也可以通过defaults里面的data属性通过传递一个数据集合进来对组件进行初始化.
            initData(target, target.options, options.data);
        }
        return target;
    };

    $.fn.treegridData.methods = {
        getAllNodes: function (target, data) {
            return target.treegrid('getAllNodes');
        },
        getData :function (target) {
            return target.options.data;
        },
        reDraw: function (target) {
            target.children('tbody').html('');
            return target.treegridData(target.options);
        },
        getSelectedNode: function (target) {
            var selected = target.find('tr.selected');
            if(selected.length > 0){
                var id = selected.attr('id').split('-')[1];
                for (var i = 0; i < target.options.data.length; i++) {
                    var obj = target.options.data[i];
                    if(obj.resourceid == id){
                        return obj;
                    }
                }
            }
        }
    };

    $.fn.treegridData.defaults = {
        tableid: 'treeGrid',            // 表id
        id: 'id',                       // id列名
        parentColumn: 'pId',            // 父ID列名
        data: [],                       // 构造table的数据集合
        type: "POST ",                  // 请求数据的ajax类型
        url: null,                      // 请求数据的ajax的url
        ajaxParams: {},                 // 请求数据的ajax的data属性
        expandColumn: null,             // 在哪一列上面显示展开按钮
        expandAll: true,                // 是否全部展开
        striped: false,                 // 是否各行渐变色
        bordered: false,                // 是否显示边框
        noIcon: false,                  // 是否需要显示（父子行标记）图标
        parentIconClass: "fa-folder",   // 父行图标类（应使用fa图标，缺省时使用"fa-folder"）
        childIconClass: "fa-file-o",    // 子行图标类（应使用fa图标，缺省时使用"fa-file-o"）
        customTHead: false,             // 复杂表头，手动创建
        customTrClass: null,            // 自定义行样式类
        customClassTrIDs: [],           // 自定义样式类的行id列表
        columns: [],
        expanderExpandedClass: 'glyphicon glyphicon-chevron-down',//展开的按钮的图标
        expanderCollapsedClass: 'glyphicon glyphicon-chevron-right'//缩起的按钮的图标

    };
})(jQuery);