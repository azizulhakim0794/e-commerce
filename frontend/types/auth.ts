export interface User {
    id: string;
    name: string;
    username: string;
    email: string;
    cart_quantity?:number;
    phone_number?:string
}

export interface Access_Token {
  token_type: string

}