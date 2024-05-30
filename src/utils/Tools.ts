// 导入 message 消息提示函数
import Message from './Message.js'

export function chkFile(file) {
    if (file.size <= 0) {
        return Message.error('文件异常或已损坏，请重新选择')
    }

    // 获取上传文件的扩展名，判断只能上传指定格式的图片
    const fileExtname = file.name
        .substring(file.name.lastIndexOf('.') + 1)
        .toLowerCase()
    const allowExtname = ['png', 'jpg', 'jpeg', 'gif', 'bmp']

    if (!allowExtname.includes(fileExtname)) {
        const allowExtnameStr = allowExtname.join('、')
        return Message.error(`只允许上传 ${allowExtnameStr} 格式的图片文件`)
    } else if (file.size > 2 * 1024 * 1024) {
        return Message.error('文件大小不能大于2M，请重新选择')
    }

    return true
}


// 去除 html 标签，提取纯文本内容处理函数
export function removeHtmlTag(content) {
    return content.replace(/<[^>]+>|&gt;|&lt;/g, '')
}


/**
 * @name buildParentChildObj
 * @desc 构建父子记录对象（支持递归深层次）
 * @param {object[]} arrData            -   源数组对象（返回的库表记录）数据
 * @param {string} id                   -   记录ID字段名
 * @param {string} parentId             -   记录的父ID字段名
 * @param {string} childrenList         -   存放存在的子记录列表的属性名
 * @param {any} retCondition            -   可以指定返回父记录ID为null还是指定值的记录
 * @returns {object[]}
 */
export function buildParentChildObj(
    arrData: object[],
    id: string,
    parentId: string,
    childrenList: string = 'children',
    retCondition: any = null
): object[] {
    // 深拷贝原数据进行操作，不改变原数据
    const newData: object[] = JSON.parse(JSON.stringify(arrData))

    // 循环父子记录，将子记录添加进父记录的 childrenList 属性中
    return newData.filter((parentItem: object) => {
        // 查找存在的子记录
        let SonData: object[] = newData.filter((sonItem: object) => sonItem[parentId] == parentItem[id])
        // 如果找到子记录，存放到父记录的 childrenList 变量指定的属性中（默认为 children）
        SonData.length ? parentItem[childrenList] = SonData : null
        // 只返回指定条件的记录，默认 parentItem[parentId] = null 的记录（即外层只包含父记录）
        return parentItem[parentId] === retCondition
    })
}


/**
 * @name deleteObjInArray   -   递归查找和删除数组对象里的某个对象
 * @param blogId 
 * @param arrObj 
 * @returns 
 */
export function deleteObjInArray(blogId: number, arrObj: any[]): object {
    // 定义找到的对象的存储变量
    let findObj = {}

    recurFindObj(arrObj)
    // 递归查找函数
    function recurFindObj(arrObj: any[]): void {
        arrObj.some((item, index) => {
            if (item.blogId !== blogId && item.children) {
                recurFindObj(item.children)
            }
            if (item?.blogId == blogId) {
                arrObj.splice(index, 1)
                findObj = item
                return true
            }
        })
    }
    return findObj
}


// 将带下划线的对象键名替换为驼峰键名
export function keyToHump(obj) {
    let objStr = JSON.stringify(obj)
    objStr = objStr.replace(/((({")|(,"))(\w*)":)/g, (all, item) => {
        return all.replace(/\_(\w)/g, (all2, item2) => {
            // console.log(all, item, all2, item2.toUpperCase())
            return item2.toUpperCase()
        })
    })

    return JSON.parse(objStr)
}


// 将驼峰对象键名替换为下划线键名
export function keyToLine(obj) {
    let objStr = JSON.stringify(obj)
    objStr = objStr.replace(/((({")|(,"))(\w*)":)/g, (all, item) => {
        return all.replace(/([A-Z])/g, (all2, item2) => {
            // console.log(all, item, all2, '_' + item2.toLowerCase())
            return '_' + item2.toLowerCase()
        })
    })

    return JSON.parse(objStr)
}