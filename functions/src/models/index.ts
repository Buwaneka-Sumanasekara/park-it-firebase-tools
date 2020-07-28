interface UserRoleModel{
    id:number,
    name:string
}

interface UserModel{
    id:string,
    email?:string,
    name:string,
    user_role:UserRoleModel
}

interface ArUsersModel{
    [key:string]:UserModel
}


interface CompanyModal {
    id?:string,
    name:string,
    crdate?:string|Object,
    crby:UserModel,
    access?:ArUsersModel,
}


export{
    UserRoleModel,UserModel,CompanyModal,ArUsersModel
}