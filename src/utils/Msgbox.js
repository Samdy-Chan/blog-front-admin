// 封装消息框提示函数

import { ElMessageBox } from "element-plus";

// 方法一：回调函数形式
/* 
const confirm = (content, okCallback = () => { }, title = "提示", cancelCallback = () => { }) => {
    ElMessageBox.confirm(content, title, {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
    })
        .then(okCallback)
        .catch(cancelCallback)
}
 */


// 方法二：先用 Promise 包装，再用 async + await 同步形式返回，返回 confirm 或 cancel，由后续判断执行
// 先用 Promise 包装
function confirmPromise(content, title, iconType, showCloseIcon) {
    return new Promise((resolve, reject) => {
        ElMessageBox.confirm(content, title, {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: iconType,
            showClose: showCloseIcon,  // 是否显示右上角关闭按钮，默认为 true
            closeOnClickModal: false,  // 是否允许点击遮罩层关闭对话框，confirmBox默认为true，alertBox默认为false
            customClass: 'msgbox-wrap',  // 提示内容是否可以在模板字符串或\n换行在.vue文件中设置的样式名，.msgbox-wrap{white-space: pre-line;} 表示允许换行
        })
            .then(confirm => {  // 如果点击了[确定]，返回字符串 confirm = 'confirm'
                resolve('confirm')
            })
            .catch(cancel => {  // 如果点击了[取消]，返回字符串 cancel = 'cancel'
                reject('cancel')
            })
    })
}


// ElMessageBox.alert() 的封装函数
function alertPromise(content, title, iconType, showCloseIcon) {
    return new Promise((resolve, reject) => {
        ElMessageBox.alert(content, title, {
            confirmButtonText: "确定",
            type: iconType,
            showClose: showCloseIcon,  // 是否显示右上角关闭按钮，默认为 true
            closeOnClickModal: false,  // 是否允许点击遮罩层关闭对话框，confirmBox默认为true，alertBox默认为false
            customClass: 'msgbox-wrap',  // 提示内容是否可以在模板字符串或\n换行在.vue文件中设置的样式名，.msgbox-wrap{white-space: pre-line;} 表示允许换行
        })
            .then(confirm => {  // 如果点击了[确定]，返回字符串 confirm = 'confirm'
                resolve('confirm')
            })
            .catch(cancel => {  // 如果点击了右上角x关闭图标，返回字符串 cancel = 'cancel'
                reject('cancel')
            })
    })
}

// 再用 async + await 同步形式返回，这样主程序中就不用再加.catch()捕获取消那么麻烦，
// 但主程序一样要用 async + await 方式调用：async()=>{ let res = await proxy.Msgbox.confirm('提示内容','标题')}
const Msgbox = {
    confirm: async (content, title = '提示', iconType = 'warning', showCloseIcon = false) => {
        let res = await confirmPromise(content, title, iconType, showCloseIcon).catch(cancel => cancel)
        return res
    },
    alert: async (content, title = '提示', iconType = 'warning', showCloseIcon = false) => {
        let res = await alertPromise(content, title, iconType, showCloseIcon).catch(cancel => cancel)
        return res
    }
}

export default Msgbox
