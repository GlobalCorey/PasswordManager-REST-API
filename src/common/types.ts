import express = require('express');
import { Document } from 'mongoose';

export interface Token{
    userId: string;
    accessToken: string; 
    refreshToken: string;
}
export interface IUserData {
    userId: string,
    email: string
}
export interface IUser extends Document {
    email: string,
    password: string,
    refreshTokens: string[]
}
export interface IAccount extends Document {
    userID: string,
    name: string,
    password: string
}
export interface IRequest extends express.Request{
    userData: IUserData,
    headers: {
        authorization: string
    },
    query: {
        id: string
    },
    body: {
        refreshToken: string
        email: string,
        password: string,
        account: {
            name: string,
            password: string
        }
    }
}