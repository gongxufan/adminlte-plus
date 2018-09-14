define(['dialog', 'common', 'knockout', 'knockout-mapping', 'jquery', 'datatables.net', 'dataTables.select', 'dataTables.responsive', 'responsive.bootstrap'
        , 'jquery.ztree.excheck', 'jquery.ztree.exedit', 'jquery.ztree.exhide'],
    function (dialog, common, ko, mapping, $) {
        //mapping插件为单独的导出对象
        ko.mapping = mapping;

        function tenant() {
            var that = this;
            this.table = null;
            //已分配的人员
            this.allocated = ko.observable(0);
            this.appAllocated = ko.observable(0);
            this.filterHumans = ko.observable(false);
            this.popTitle = ko.observable('');
            //人员关联的岗位过滤
            this.filterHumans.subscribe(function (newValue) {
                var treeObj = common.tree.getTreeObj('human-tree-list-tenant');
                if (newValue) {
                    if (treeObj) {
                        treeObj.getNodesByFilter(function (node) {
                            //未选中的人员节点隐藏
                            if (node.id.indexOf('u') == -1 && node.id.indexOf('r') == -1 && !node.checked) {
                                treeObj.hideNode(node);
                            }
                        });
                    }
                } else {
                    if (treeObj) {
                        treeObj.getNodesByFilter(function (node) {
                            if (node.isHidden) {
                                treeObj.showNode(node);
                            }
                        });
                    }
                }
            });
            //重置为空状态，新增操作
            this.clearTenantInfo = function () {
                ko.mapping.fromJS({
                    tenantid: '',
                    tenantname: '',
                    tenantdesc: '',
                    typeid: '',
                    createtime: '',
                    displayorder: '',
                }, that.tenantInfo);
                //分配人员清空
                that.tenantInfo.humanList([]);
                that.tenantInfo.appList([]);
                //初始化租户类型
                that.tenantInfo.typeid(common.dic.tenantTypeData[0].typeid);
            };
            this.initTenantInfo = function () {
                that.tenantInfo = ko.mapping.fromJS({
                    tenantid: '',
                    tenantname: '',
                    tenantdesc: '',
                    typeid: '',
                    createtime: '',
                    displayorder: '',
                    humanList: [],
                    appList: []
                });
                //初始化租户类型
                that.typeList = ko.observableArray(common.dic.tenantTypeData);
                that.tenantInfo.typeid(common.dic.tenantTypeData[0].typeid);
            };
            //页面加载前初始化操作
            this.init = function () {
                this.initTenantInfo();
            };

            //页面渲染完毕
            this.afterRender = function (modelId) {
                this.initUI(modelId);
            };
            this.addTenant = function () {
                //配置的人员数据
                var treeObj = common.tree.getTreeObj('human-tree-list-tenant');
                var checkedData = treeObj.getCheckedNodes(true);
                var humanList = [];
                if (checkedData && checkedData.length > 0) {
                    for (var i = 0; i < checkedData.length; i++) {
                        var obj = checkedData[i];
                        if (obj.id.indexOf('u') != -1 || obj.id.indexOf('r') != -1)
                            continue;
                        humanList.push({humanid: obj.id});
                    }
                }
                //应用数据
                treeObj = common.tree.getTreeObj('tenant-app-tree-list');
                var appData = treeObj.getCheckedNodes(true);
                var appList = [];
                if (appData && appData.length > 0) {
                    for (var i = 0; i < appData.length; i++) {
                        var obj = appData[i];
                        appList.push({appid: obj.id});
                    }
                }
                var tenant = ko.mapping.toJS(that.tenantInfo);
                //人员去重
                tenant.humanList = common.distinctArray(humanList, "humanid");
                tenant.appList = appList;
                $.ajax({
                    url: 'tenant/addTenant',
                    data: JSON.stringify(tenant),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    method: "post",
                    success: function (response) {
                        if (common.dealResponse(response)) {
                            dialog.successTips('租户添加成功');
                            $("#modal-add-tenant").modal('hide');
                            that.table.order([[1, 'asc']])
                                .draw(false);
                        }
                    }
                });
            };
            this.delTenant = function () {
                //获取选择的行数据
                var selectedRows = that.table.rows({selected: true}).data();
                if (!selectedRows || selectedRows.length == 0) {
                    dialog.errorTips('请勾选需要删除的租户数据');
                    return;
                }
                var ids = [];
                for (var i = 0; i < selectedRows.length; i++) {
                    var obj = selectedRows[i];
                    ids.push(obj.tenantid);
                }
                dialog.confirm({msg: '删除租户的同时会解除其关联的人员和应用列表!', title: '删除租户'}).on(function (e) {
                    if (e) {
                        $.post('tenant/delTenant', {tenantIds: ids.join(',')}, function (response) {
                            if (common.dealResponse(response)) {
                                dialog.successTips('租户删除成功');
                                that.table.order([[1, 'asc']])
                                    .draw(false);
                            }
                        });
                    }
                });

            };
            this.buildTenantTable = function () {
                if (that.table && $('#tenant-list-table').children().length > 0) that.table.ajax.reload()
                else
                    that.table = $('#tenant-list-table').on('init.dt', function () {
                        //hacker　除去checkbox列的排序选项
                        $("th.select-checkbox").removeClass('sorting_asc');
                    }).DataTable({
                            order: [[1, 'asc']],
                            /* responsive: true,*/
                            columnDefs: [{
                                orderable: false,
                                className: 'select-checkbox',
                                targets: 0
                            }, {
                                orderable: false,
                                targets: 7
                            }],
                            select: {
                                style: 'multi',
                                items: 'row'
                            },
                            processing: true,
                            serverSide: true,
                            autoWidth: true,
                            dom: '<"toolbar">frtip',
                            ajax: {
                                'url': 'json/queryTenantData.json',
                                'type': 'POST'
                            },
                            columns: [
                                {title: "<input type='checkbox' id='tenantCheckAll' 　/>", data: null, "defaultContent": ""},
                                {title: "租户标识", data: "tenantid"},
                                {title: "租户名称", data: "tenantname"},
                                {title: "租户描述", data: "tenantdesc"},
                                {
                                    title: "租户类型", data: function (row, type, val, meta) {
                                        var typeid = row.typeid;
                                        if (typeid == 1)
                                            return "<span style='color: green;font-weight: bold'>超级管理员租户</span>";
                                        if (typeid == 2)
                                            return "<span style='color: blue;font-weight: bold'>管理员租户</span>";
                                        if (typeid == 3)
                                            return "<span style='color: gray;font-weight: bold'>普通用户租户</span>";
                                    }
                                },
                                {title: "创建时间", data: "createtime"},
                                {title: "显示次序", data: "displayorder"},
                                {
                                    title: "操作",
                                    data: null,
                                    "defaultContent": "<a id='editTenant' title='租户配置' style='cursor: pointer'><i class=\"fa fa-pencil-square-o\" aria-hidden=\"true\"></i></a>"
                                }
                            ],
                            language: common.lang
                        }
                    );
                $("div.toolbar").html(" <div class=\"btn-group pull-right\" style='padding-left: 10px'>" +
                    "                            <button id='addTenantBtn' type=\"button\" class=\"btn btn-sm btn-primary\" data-toggle=\"modal\" data-target=\"#modal-add-tenant\">新增</button>" +
                    "                            <button id='delTenantBtn' type=\"button\" class=\"btn btn-sm btn-danger\">删除</button>" +
                    "                        </div>");
                //取消选择行
                that.table.on('deselect.dt', function (e, dt, type, indexes) {
                    if (type == 'row') {
                        $("#tenantCheckAll").removeAttr("checked");
                    }
                }).on('select.dt', function (e, dt, type, indexes) {//选择行
                    if (type == 'row') {
                        var selectedRows = that.table.rows({selected: true}).data();
                        var all = that.table.rows().data();
                        if (selectedRows.length == all.length)
                            $("#tenantCheckAll").prop("checked", "checked");
                    }
                })
            };
            /**
             * 选中当前租户已分配人员
             * @param selectedHumans
             */
            this.loadTenantHumans = function (selectedHumans) {
                if (selectedHumans)
                    that.allocated(selectedHumans.length);
                else
                    that.allocated(0);
                var treeObj = common.tree.getTreeObj('human-tree-list-tenant');
                treeObj.checkAllNodes(false);
                //已分配人员节点checked
                treeObj.getNodesByFilter(function (node) {
                    //排除部门和岗位节点
                    if (node.id.indexOf('u') == -1 && node.id.indexOf('r') == -1 && selectedHumans) {
                        for (var k = 0; k < selectedHumans.length; k++) {
                            var s = selectedHumans[k];
                            if (s.humanid == node.id) {
                                treeObj.checkNode(node, true, true);
                                break;
                            }
                        }
                    }
                });
            };
            //重新加载已分配应用
            this.loadTenantApp = function (selectedApp) {
                if (selectedApp)
                    that.appAllocated(selectedApp.length);
                else
                    that.appAllocated(0);
                var treeObj = common.tree.getTreeObj('tenant-app-tree-list');
                treeObj.checkAllNodes(false);
                //已分配人员节点checked
                treeObj.getNodesByFilter(function (node) {
                    //排除部门和岗位节点
                    if (node.id.indexOf('u') == -1 && node.id.indexOf('r') == -1 && selectedApp) {
                        for (var k = 0; k < selectedApp.length; k++) {
                            var s = selectedApp[k];
                            if (s.appid == node.id) {
                                treeObj.checkNode(node, true, false);
                                break;
                            }
                        }
                    }
                });
            };
            //重置租户分配的人员
            this.resetTenantHumans = function (tenant) {
                that.loadTenantHumans(JSON.parse(ko.mapping.toJSON(tenant.tenantInfo.humanList())));
                that.loadTenantApp(JSON.parse(ko.mapping.toJSON(tenant.tenantInfo.appList())))
            };
            this.reloadTenantRel = function (humanList, appList) {
                that.loadTenantHumans(humanList);
                that.loadTenantApp(appList);
            };
            this.initEvent = function (eventEle) {
                //全选
                eventEle.on('click', '#tenantCheckAll', function () {
                    var rows = that.table.rows();
                    if (this.checked) {
                        rows.select();
                        var data = that.table.rows({selected: true}).data();
                        console.log(data[0]);
                    } else {
                        rows.deselect();
                        var data = that.table.rows({selected: true}).data();
                        console.log(data[0]);
                    }
                });
                //添加租户
                eventEle.on('click', '#addTenantBtn', function () {
                    that.clearTenantInfo();
                    that.popTitle('新增租户');
                    //每次打开编辑都要把树节点显示出来
                    that.filterHumans(false);
                    that.reloadTenantRel(null, null);
                    that.allocated(0);
                });
                //删除租户
                eventEle.on('click', '#delTenantBtn', function () {
                    that.delTenant();
                });
                //编辑租户弹层
                eventEle.on('click', '#editTenant', function () {
                    var data = that.table.row($(this).parents('tr')).data();
                    that.popTitle('编辑租户');
                    //租户类型匹配
                    that.tenantInfo.typeid(data.typeid);
                    //每次打开编辑都要把树节点显示出来
                    that.filterHumans(false);
                    //租户进本信息赋值
                    ko.mapping.fromJS(data, that.tenantInfo);
                    //分配人员
                    var humanList = data.humanList;
                    that.reloadTenantRel(humanList, data.appList);
                    $("#modal-add-tenant").modal('show');
                });
            };
            this.unCheckHumanNode = function (humanId) {
                var $tree =  $.fn.zTree.getZTreeObj("human-tree-list-tenant");
                $tree.getNodesByFilter(function (node) {
                    if(node.id == humanId){
                        $tree.checkNode(node,false);
                    }
                });
            };
            this.loadHumanTree = function () {
                $.get('json/queryAllHumanTree.json', function (response) {
                    var nodes = response.data;
                    if (nodes) {
                        $.fn.zTree.init($("#human-tree-list-tenant"), {
                            view: {
                                selectedMulti: true
                            },
                            check: {
                                enable: true
                            },
                            data: {
                                simpleData: {
                                    enable: true
                                }
                            },
                            edit: {
                                enable: false
                            },
                            callback: {
                                onCheck: function (event, treeId, treeNode) {
                                    var nums = that.allocated();
                                    //部门和岗位check时需要遍历其下的所有子节点
                                    var ids = [];
                                    if (treeNode.checked) {
                                        //选中单位或者岗位节点，其下的所有人员节点全部选中
                                        if (treeNode.id.indexOf('u') != -1 || treeNode.id.indexOf('r') != -1) {
                                            common.tree.getChildren(ids, treeNode);
                                            //人员去重，不同岗位配置相同的人员
                                            ids = common.distinctSimpleArray(ids);
                                            for (var i = 0; i < ids.length; i++) {
                                                if (ids[i].indexOf('u') == -1 && ids[i].indexOf('r') == -1) {
                                                    nums++;
                                                }
                                            }
                                            that.allocated(nums);
                                        } else {
                                            that.allocated(nums + 1);
                                        }
                                    } else {
                                        //取消单位或者岗位节点选中，其下的所有人员节点全部取消选中
                                        if (treeNode.id.indexOf('u') != -1 || treeNode.id.indexOf('r') != -1) {
                                            common.tree.getChildren(ids, treeNode);
                                            //人员去重，不同岗位配置相同的人员
                                            ids = common.distinctSimpleArray(ids);
                                            for (var i = 0; i < ids.length; i++) {
                                                if (ids[i].indexOf('u') == -1 && ids[i].indexOf('r') == -1) {
                                                    //一个人员取消选中，关联所有其他岗位节点下人员联动取消选中
                                                    that.unCheckHumanNode(ids[i]);
                                                    nums--;
                                                }
                                            }
                                            that.allocated(nums);
                                        } else {
                                            that.unCheckHumanNode(treeNode.id);
                                            nums--;
                                        }
                                            that.allocated(nums - 1 >= 0 ? nums : 0);
                                    }
                                }
                            }
                        }, response.data);
                        common.tree.fuzzySearch('human-tree-list-tenant', '#findHuman-tenant', true, true);
                    }
                });
            };
            //构建系统界面
            this.initUI = function (modelId) {
                this.initEvent($('div[data-model="' + modelId + '"]'));
                this.buildTenantTable();
                this.loadHumanTree();
                this.loadApp();
            };
            this.loadApp = function () {
                $.get('json/queryAppDataTree.json', function (response) {
                    $.fn.zTree.init($("#tenant-app-tree-list"), {
                        view: {
                            selectedMulti: false
                        },
                        data: {
                            simpleData: {
                                enable: true
                            }
                        },
                        check: {
                            enable: true
                        },
                        edit: {
                            enable: false
                        },
                        callback: {
                            onCheck: function (event, treeId, treeNode) {
                                var nums = that.appAllocated();
                                if (treeNode.checked) {
                                    that.appAllocated(nums + 1);
                                } else {
                                    var left = nums - 1;
                                    that.appAllocated(left >= 0 ? left : 0);
                                }
                            },
                            beforeCheck: function (treeId, treeNode) {
                                //部门节点无法check
                                if (treeNode.id.indexOf('u') != -1)
                                    return false;
                            }
                        }
                    }, response.data);
                });
            }
        }

        //export
        return new tenant();
    })
;
