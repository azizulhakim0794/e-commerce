export interface User {
    id: string;
    name: string;
    username: string;
    email: string;
    profile_pic?: string | null;
    is_admin?: boolean;
    cart_quantity?:number;
    phone_number?:string
}

export interface Access_Token {
  token_type: string

}