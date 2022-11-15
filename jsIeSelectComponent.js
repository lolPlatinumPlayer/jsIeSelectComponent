
/**
 * 创建一个下拉框
 * @params {object} config
 * @params {HTMLElement} config.container 容器
 * @params {optionData[]} config.optionList 数据源
 * @params {string} config.placeholder 下拉框默认显示的文本
 * @params {jsStyle} config.jsStyle js部分控制的样式
 * @returns {select} select
 */
function createSelect(p) {

    // 将入参存入变量
    var placeholder = p.placeholder||'请选择'
    var bodyData = p.optionList
    var style = {
        width:p.jsStyle&&p.jsStyle.width||100,
        optionHeight:p.jsStyle&&p.jsStyle.optionHeight||40,
    }

    var selectDom = document.createElement('div')
    selectDom.classList.add('jsIeSelect')
    selectDom.style.width=style.width+'px'

    var toggleDom=document.createElement('div')
    var textDom = document.createElement('span')
    var arrowDom = document.createElement('span')
    textDom.classList.add('jsIeSelectToggleText','placeholder')
    textDom.innerText = placeholder
    arrowDom.classList.add('jsIeSelectArrow')
    arrowDom.innerText = '↓'
    toggleDom.classList.add('jsIeSelectToggle')
    toggleDom.style.height=toggleDom.style.lineHeight=style.optionHeight+'px'
    toggleDom.appendChild(textDom)
    toggleDom.appendChild(arrowDom)
    selectDom.appendChild(toggleDom)

    var body= window.body = createSelectBody(bodyData, style)
    selectDom.appendChild(body.dom)

    toggleDom.onclick=toggle
    var privateState={
        isShowBody:false
    }
    function toggle(){
        privateState.isShowBody=!privateState.isShowBody
        body.dom.style.opacity=privateState.isShowBody?1:0
        arrowDom.innerText = privateState.isShowBody?'↑':'↓'
    }
    p.container.appendChild(selectDom)

    var select = {
        dom: selectDom,
        _callbackCollection: {
            optionClick: []
        },
        listenOptionClick: function (callback) {
            this._callbackCollection.optionClick.push(callback)
        },
    }

    // 在option点击事件后做些什么
    body.optionListList.forEach(function(optionList){
        optionList.list.forEach(function(option){
            option.listenClick(function(optionData){
                select._callbackCollection.optionClick.forEach(function(callback){
                    toggle()
                    textDom.innerText = optionData.label
                    textDom.classList.remove('placeholder')
                    callback(optionData)
                })
            })
        })
    })

    return select
}

/**
 * 下拉框的数据源
 * @typedef {object} optionData
 * @params {string} label
 * @params {*} value
 * @params {optionData[]} children
 */

/**
 * 用js控制的样式
 * @typedef {object} jsStyle
 * @params {number} [width=100] 下拉框的宽度
 * @params {number} [optionHeight=40] 下拉框一项有多高
 */

/**
 * 下拉框实例
 * @typedef {object} select
 * @params {HTMLElement} dom
 * @params {listenOptionClick} listenOptionClick 监听选项的点击事件。回调的参数为数据源中对应选项的部分
 */

/**
 * 给选项的点击事件增加监听函数
 * @typedef {function} listenOptionClick
 * @params {function} listener 监听函数。有一个参数，为数据源中对应选项的部分
 * @instance
 * @memberof select
 */



function createSelectBody(bodyData, style) {

    var optionListList = []

    createBodyChildren(bodyData, 0,0)
    function createBodyChildren(optionListData, level,upperRowNum) {
        var optionList = createOptionList(optionListData, style, level,upperRowNum)
        optionListList.push(optionList)
        optionListData.forEach(function (optionData,idx) {
            if (typeof optionData.children === 'object') { // 判断是否是数组
                // console.log( level + 1,upperRowNum+idx)
                createBodyChildren(optionData.children, level + 1,upperRowNum+idx)
            }
        })
    }

    var bodyDom = document.createElement('div')
    bodyDom.classList.add('jsIeSelectBody')
    bodyDom.style.opacity=0

    optionListList.forEach(function (optionList) {
        bodyDom.appendChild(optionList.dom)
    })

    return {
        dom: bodyDom,
        optionListList:optionListList,
    }
}

function createOptionList(optionListData, style,level,upperRowNum) {

    var optionListDom = document.createElement('div')
    optionListDom.classList.add('jsIeSelectOptionList')

    optionListDom.style.left=level*style.width+'px'
    optionListDom.style.top=upperRowNum*style.optionHeight+'px'

    var optionList=[]
    optionListData.forEach(function(optionData){
        var option=createOption(optionData,style)
        optionListDom.appendChild(option.dom)
        optionList.push(option)
    })

    return {
        dom: optionListDom,
        list:optionList,
    }
}

function createOption(optionData, style,) {

    var optionDom = document.createElement('div')
    optionDom.classList.add('jsIeSelectOption')
    optionDom.innerText=optionData.label
    
    optionDom.style.height=optionDom.style.lineHeight=style.optionHeight+'px'

    var option= {
        dom: optionDom,
        _callbackCollection: {
            click: []
        },
        listenClick: function (callback) {
            this._callbackCollection.click.push(callback)
        },
    }

    optionDom.onclick=function onOptionClick(){
        option._callbackCollection.click.forEach(function(callback){
            callback(optionData)
        })
    }

    return option
}