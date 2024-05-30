// 使用 Window 组件参数变量类型声明
export declare namespace WindowCom {
    // 传给弹出窗口 Window 组件的底部按钮类型声明
    type btnType = {
        type: 'primary' | 'success' | 'warning' | 'danger' | 'info'
        text: string
        click: (e?: any) => void | undefined
    }
    // 传给弹出窗口 Window 组件的 props 参数类型声明
    type windowConfigType = {
        show: boolean;
        buttons: btnType[];
        showCancel: boolean;
    }
}


// BlogDetail 博客预览页面类型声明
export declare namespace BlogDetailVue {
    // 预览的博客数据类型声明
    interface blogType {
        blogId: number;
        title: string;
        editorType: number;
        content: string;
        markdownContent: string;
        [key: string]: any;  // 索引签名类型，表示除了必需以上属性，还可以包含其它任意多个属性
    }

    // 获取预览博客数据函数类型声明
    // 使用了 async 的函数，返回类型必须用 Promise 封装，声明 Promise<void>，
    // async函数里可以 return undefined，但不能 return null
    // 普通函数声明返回 void，实际可以无返回，可以 return undefined 和 return null
    type showDetail = (blogId: number) => Promise<void> | Promise<undefined>
}