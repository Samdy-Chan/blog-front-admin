// 定义匹配校验规则
const regs = {
    phone: /^1[3-9](\d{9})$/,
    password: /^\w{8,16}$/,
}

// 定义校验函数
const verify = (rule, value, reg, callback) => {
    if (value) {
        if (reg.test(value)) {
            callback()
        } else {
            callback(new Error(rule.message))
        }
    } else {
        callback()
    }
}

// 导出定义的各个校验对象函数
export default {
    phone: (rule, value, callback) => {
        return verify(rule, value, regs.phone, callback)
    },
    password: (rule, value, callback) => {
        return verify(rule, value, regs.password, callback)
    },
}