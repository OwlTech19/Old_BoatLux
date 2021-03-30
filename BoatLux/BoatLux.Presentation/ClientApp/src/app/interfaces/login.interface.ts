export interface RequestLogin {
    email: string;
    password: string;
}

export interface ResponseLogin {
    id: number;
    name: string;
    token: string;
}