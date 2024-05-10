/// <reference types="node" />
import { EventEmitter } from 'node:events';
import type { WebSocket } from 'ws';
import { Version } from './version.js';
import { Encryption } from './encrypt.js';
import { Header, Message } from './protocol.js';
export interface Frame<P extends string = string, B = unknown, H extends Header<P> = Header<P>> {
    session: Session;
    message: Message<B, H>;
    header: H;
    body: B;
    purpose: P;
    requestId: string;
    version: Version;
}
export type Handler<This extends Session, P extends string = string, F extends Frame<P> = Frame<P>> = (this: This, frame: F) => boolean | undefined;
export declare class Session extends EventEmitter {
    socket: WebSocket;
    version: Version;
    encrypted: boolean;
    encryption: Encryption | null;
    private responserMap;
    private handlerMap;
    constructor(socket: WebSocket, version?: Version);
    isEncrypted(): boolean;
    sendMessage(message: object): void;
    sendFrame(purpose: string, body: unknown, requestId?: string, extraHeaders?: Record<string, unknown>): void;
    hasResponser(requestId: string): boolean;
    /**
     * Do not specify the type of frame in responser if you want to validate the frame.
     */
    setResponser<F extends Frame = Frame>(requestId: string, responser: Handler<this, string, F>): void;
    clearResponser(requestId: string): boolean;
    hasHandler(purpose: string): boolean;
    /**
     * Do not specify the type of frame in handler if you want to validate the frame.
     */
    setHandler<P extends string, F extends Frame<P> = Frame<P>>(purpose: P, handler: Handler<this, P, F>): void;
    clearHandler(purpose: string): boolean;
    setEncryption(encryption: Encryption | null): void;
}
export interface SessionEventMap {
    customFrame: (frame: Frame) => void;
    disconnect: (session: this) => void;
    encryptionEnabled: (session: this) => void;
    error: (err: Error) => void;
    message: (frame: Frame) => void;
}
export interface Session extends EventEmitter {
    on(eventName: 'customFrame', listener: (frame: Frame) => void): this;
    once(eventName: 'customFrame', listener: (frame: Frame) => void): this;
    off(eventName: 'customFrame', listener: (frame: Frame) => void): this;
    addListener(eventName: 'customFrame', listener: (frame: Frame) => void): this;
    removeListener(eventName: 'customFrame', listener: (frame: Frame) => void): this;
    emit(eventName: 'customFrame', frame: Frame): boolean;
    on(eventName: 'disconnect', listener: (session: this) => void): this;
    once(eventName: 'disconnect', listener: (session: this) => void): this;
    off(eventName: 'disconnect', listener: (session: this) => void): this;
    addListener(eventName: 'disconnect', listener: (session: this) => void): this;
    removeListener(eventName: 'disconnect', listener: (session: this) => void): this;
    emit(eventName: 'disconnect', session: this): boolean;
    on(eventName: 'encryptionEnabled', listener: (session: this) => void): this;
    once(eventName: 'encryptionEnabled', listener: (session: this) => void): this;
    off(eventName: 'encryptionEnabled', listener: (session: this) => void): this;
    addListener(eventName: 'encryptionEnabled', listener: (session: this) => void): this;
    removeListener(eventName: 'encryptionEnabled', listener: (session: this) => void): this;
    emit(eventName: 'encryptionEnabled', session: this): boolean;
    on(eventName: 'error', listener: (err: Error) => void): this;
    once(eventName: 'error', listener: (err: Error) => void): this;
    off(eventName: 'error', listener: (err: Error) => void): this;
    addListener(eventName: 'error', listener: (err: Error) => void): this;
    removeListener(eventName: 'error', listener: (err: Error) => void): this;
    emit(eventName: 'error', err: Error): boolean;
    on(eventName: 'message', listener: (frame: Frame) => void): this;
    once(eventName: 'message', listener: (frame: Frame) => void): this;
    off(eventName: 'message', listener: (frame: Frame) => void): this;
    addListener(eventName: 'message', listener: (frame: Frame) => void): this;
    removeListener(eventName: 'message', listener: (frame: Frame) => void): this;
    emit(eventName: 'message', frame: Frame): boolean;
}
