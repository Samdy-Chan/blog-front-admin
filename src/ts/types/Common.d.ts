// 后端接口返回的数据类型定义
export interface IRetResult {
    data: any;
    status: string;
    code: number,
    info: string;
}

// 自定义对话框组件 Dialog 的 buttons 属性按钮数组类型定义
type TDialogBtns = {
    type: 'primary' | 'success' | 'warning' | 'danger' | 'info';
    text: string;
    click: (e?: MouseEvent, ...args: any) => unknown;
}

// 自定义对话框组件 Dialog 属性传递对象类型定义
export interface IDialogConfig {
    title: string;
    show: boolean;
    showCancel: boolean;
    showClose: boolean;
    buttons: TDialogBtns[];
    // Dialog对话框组件取消按钮事件函数
    btnCancel: (e?: MouseEvent, ...args: any) => unknown;
}