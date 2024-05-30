function chgObjPropname(obj) {
    // 判断对象类型
    // if (obj instanceof Array)  // 数组判断准确，但函数判断也为 Object:   f instanceof Object  === true

    // 第一推荐：这种判断准确，但繁琐 '[object Array]'
    // if (Object.prototype.toString.call(obj) === '[object Array]')

    // 这种第二推荐：f.constructor === Function ，不等于 Object；arr.constructor === Array，不等于 Object
    // if (arr.constructor === Array)

    if (obj.constructor === Array) {  // 如果数组元素是对象
        obj.forEach((item, index, arr) => {
            // 如果数组元素不是对象，返回 false
            if (item.constructor !== Object) return false

            for (let [k, v] of Object.entries(item)) {
                // 调用 setHumpName 函数，将对象键名转为驼峰名
                setHumpName(item, k, v)
            }

        })
    }

    function setHumpName(obj, keyName, value) {
        let arr_keyName = keyName.split('_')
        if (arr_keyName.length === 2) {
            // arr_keyName[1][0] 表示如 nick_name 的 name 的第一个字符 n，
            // arr_keyName[1].substring(1) 表示 ame
            let newKeyName = arr_keyName[0] + arr_keyName[1][0].toUpperCase() + arr_keyName[1].substring(1)
            // 先删除旧属性
            // Reflect.deleteProperty(obj, keyName)
            delete obj.keyName

            // 再用新属性名赋值
            obj[newKeyName] = value
            // Reflect.defineProperty(obj, newKeyName, { value: value })

        } else {  //如果不止一个下线分隔，如 cate_name_id，则递归自调用函数处理
            setHumpName(obj, arr_keyName[1], value)
        }

    }
}