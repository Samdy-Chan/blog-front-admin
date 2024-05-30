// 个人信息修改表单数据模型对象接口定义
interface IFormData {
    userId: number | null;
    nickName: string;
    avatar: string;
    phone: string;
    editorType: number;
    profession: string;
    introduction: string;
    [K: string]: any;
}

// 获取个人信息函数类型定义
export type FGetUserInfo = (userId: number) => Promise<void>

// API 接口对象类型定义
export interface IApi {
    getUserInfo: string;
    updateUserInfo: string;
    updatePassword: string;
}

// 修改密码表单数据模型对象接口定义
export interface IFormPassData {
    password: string;
    rePassword: string;
}

// 修改个人信息函数类型定义
export type FSaveMyInfo = (userId: number) => void