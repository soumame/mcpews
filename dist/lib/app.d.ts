/// <reference types="node" />
/// <reference types="node" />
import { EventEmitter } from 'node:stream';
import { CommandResponseFrame, EventFrame, ServerSession, WSServer } from './server.js';
import { CancelablePromise } from 'p-event';
import { IncomingMessage } from 'http';
export declare class AppSession {
    session: ServerSession;
    constructor(session: ServerSession);
    enableEncryption(): Promise<boolean>;
    isEncrypted(): boolean;
    on(eventName: 'Disconnect', listener: () => void): this;
    on(eventName: string, listener: (frame: EventFrame) => void): this;
    once(eventName: 'Disconnect', listener: () => void): this;
    once(eventName: string, listener: (frame: EventFrame) => void): this;
    off(eventName: 'Disconnect', listener: () => void): this;
    off(eventName: string, listener: (this: this, frame: EventFrame) => void): this;
    addListener(eventName: 'Disconnect', listener: () => void): this;
    addListener(eventName: string, listener: (frame: EventFrame) => void): this;
    removeListener(eventName: 'Disconnect', listener: () => void): this;
    removeListener(eventName: string, listener: (this: this, frame: EventFrame) => void): this;
    waitForEvent(eventName: string, timeout?: number, filter?: (frame: EventFrame) => boolean): CancelablePromise<EventFrame<import("./protocol.js").EventBody>>;
    command(commandLine: string | string[], timeout?: number): CancelablePromise<CommandResponseFrame>;
    commandLegacy(commandName: string, overload: string, input: Record<string, unknown>, timeout?: number): CancelablePromise<CommandResponseFrame>;
    disconnect(force?: boolean, timeout?: number): CancelablePromise<void>;
}
export declare class WSApp extends EventEmitter {
    server: WSServer;
    protected sessions: Set<AppSession>;
    constructor(port: number, handleSession?: (connection: AppSessionConnection) => void);
    forEachSession(f: (session: AppSession) => void): Promise<void>;
    mapSession<R>(f: (session: AppSession) => R): Promise<Awaited<R>[]>;
    waitForSession(timeout?: number): CancelablePromise<AppSessionConnection>;
    close(): void;
}
export interface AppSessionConnection {
    app: WSApp;
    session: AppSession;
    request: IncomingMessage;
}
export interface WSAppEventMap {
    session: (connection: AppSessionConnection) => void;
}
export interface WSApp {
    on(eventName: 'session', listener: (connection: AppSessionConnection) => void): this;
    once(eventName: 'session', listener: (connection: AppSessionConnection) => void): this;
    off(eventName: 'session', listener: (connection: AppSessionConnection) => void): this;
    addListener(eventName: 'session', listener: (connection: AppSessionConnection) => void): this;
    removeListener(eventName: 'session', listener: (connection: AppSessionConnection) => void): this;
    emit(eventName: 'session', connection: AppSessionConnection): boolean;
}
