/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { WebSocket, WebSocketServer } from 'ws';
import { MinecraftCommandVersion, Version } from './version.js';
import { Frame, Session, SessionEventMap } from './base.js';
import { IncomingMessage } from 'http';
import { Duplex } from 'stream';
import { ChatEventBody, ChatEventFrameType, CommandResponseBody, DataFrameHeader, EncryptResponseBody, EncryptionMode, ErrorBody, EventBody, EventHeader, EventResponsePurposes, MinecraftAgentActionResponseHeader, MinecraftAgentActionType, MinecraftBlockData, MinecraftDataType, MinecraftItemData, MinecraftMobData, ResponsePurpose } from './protocol.js';
export type CommandResponseFrame<B extends CommandResponseBody = CommandResponseBody> = Frame<ResponsePurpose.Command, B>;
export type ErrorFrame = Frame<ResponsePurpose.Error, ErrorBody>;
export declare class ClientError extends Error {
    frame: ErrorFrame;
    requestId: string;
    statusCode?: number;
    statusMessage?: string;
    constructor(frame: ErrorFrame);
}
export type EventFrameBase<B extends EventBody = EventBody> = Frame<EventResponsePurposes, B, EventHeader>;
export interface EventFrame<B extends EventBody = EventBody> extends EventFrameBase<B> {
    eventName: string;
}
export type AgentActionResponseFrameBase<B = unknown> = Frame<ResponsePurpose.AgentAction, B, MinecraftAgentActionResponseHeader>;
export interface AgentActionResponseFrame<B = unknown> extends AgentActionResponseFrameBase<B> {
    action: MinecraftAgentActionType;
    actionName: string;
    commandResponse?: CommandResponseFrame;
}
export type ChatEventFrameBase = Frame<ResponsePurpose.ChatMessage, ChatEventBody, EventHeader<ResponsePurpose.ChatMessage>>;
export interface ChatEventFrame extends ChatEventFrameBase {
    eventName: string;
    chatMessage: string;
    chatType: ChatEventFrameType;
    sender: string;
    receiver: string;
}
export type DataFrameBase<Name extends string = string, ReturnType = unknown> = Frame<ResponsePurpose.Data, ReturnType, DataFrameHeader<Name>>;
export interface DataFrame<Name extends string, ReturnType> extends DataFrameBase<Name, ReturnType> {
    dataType: Name;
}
export type EncryptResponseFrameBase = Frame<ResponsePurpose.EncryptConnection, EncryptResponseBody>;
type SemVer = string | [number, number, number];
export type CommandVersion = MinecraftCommandVersion | SemVer;
export declare class ServerSession extends Session {
    server: WSServer;
    exchangingKey: boolean;
    private eventListeners;
    private chatResponsers;
    constructor(server: WSServer, socket: WebSocket);
    enableEncryption(callback?: (session: this) => void): boolean;
    enableEncryption(mode?: EncryptionMode, callback?: (session: this) => void): boolean;
    subscribeRaw(eventName: string): void;
    subscribe<B extends EventBody = EventBody>(eventName: string, callback: (frame: EventFrame<B>) => void): void;
    unsubscribeRaw(eventName: string): void;
    unsubscribe<B extends EventBody = EventBody>(eventName: string, callback: (frame: EventFrame<B>) => void): void;
    sendCommandRaw(requestId: string, command: string | string[], version?: CommandVersion): void;
    sendCommand<B extends CommandResponseBody = CommandResponseBody>(command: string | string[], callback?: (frame: CommandResponseFrame<B>) => void): `${string}-${string}-${string}-${string}-${string}`;
    sendCommandLegacyRaw(requestId: string, commandName: string, overload: string, input: Record<string, unknown>): void;
    sendCommandLegacy<B extends CommandResponseBody = CommandResponseBody>(commandName: string, overload: string, input: Record<string, unknown>, callback?: (frame: CommandResponseFrame<B>) => void): `${string}-${string}-${string}-${string}-${string}`;
    sendAgentCommandRaw(requestId: string, agentCommand: string | string[], version?: CommandVersion): void;
    sendAgentCommand<B = unknown>(command: string | string[], callback?: (frame: AgentActionResponseFrame<B>) => void): `${string}-${string}-${string}-${string}-${string}`;
    cancelCommandRequest(requestId: string): boolean;
    subscribeChatRaw(requestId: string, sender?: string | null, receiver?: string | null, message?: string | null): void;
    subscribeChat(sender?: string | null, receiver?: string | null, message?: string | null, callback?: (frame: ChatEventFrame) => void): `${string}-${string}-${string}-${string}-${string}`;
    unsubscribeChatRaw(requestId?: string): void;
    unsubscribeChat(requestId: string): void;
    unsubscribeChatAll(): void;
    fetchDataRaw(requestId: string, dataType: string): void;
    fetchData(dataType: MinecraftDataType.Block, callback?: (frame: DataFrame<MinecraftDataType.Block, MinecraftBlockData[]>) => void): string;
    fetchData(dataType: MinecraftDataType.Item, callback?: (frame: DataFrame<MinecraftDataType.Item, MinecraftItemData[]>) => void): string;
    fetchData(dataType: MinecraftDataType.Mob, callback?: (frame: DataFrame<MinecraftDataType.Mob, MinecraftMobData[]>) => void): string;
    fetchData<Name extends string, ReturnType>(dataType: Name, callback?: (frame: DataFrame<Name, ReturnType>) => void): string;
    sendEncryptionRequest(requestId: string, mode: EncryptionMode | number, publicKey: string, salt: string): void;
    disconnect(force?: boolean): void;
}
export interface ServerSessionEventMap extends SessionEventMap {
    event: (frame: EventFrame) => void;
    commandResponse: (frame: CommandResponseFrame) => void;
    clientError: (error: ClientError) => void;
}
export interface ServerSession {
    on(eventName: 'event', listener: (frame: EventFrame) => void): this;
    once(eventName: 'event', listener: (frame: EventFrame) => void): this;
    off(eventName: 'event', listener: (frame: EventFrame) => void): this;
    addListener(eventName: 'event', listener: (frame: EventFrame) => void): this;
    removeListener(eventName: 'event', listener: (frame: EventFrame) => void): this;
    emit(eventName: 'event', frame: EventFrame): boolean;
    on(eventName: 'commandResponse', listener: (frame: CommandResponseFrame) => void): this;
    once(eventName: 'commandResponse', listener: (frame: CommandResponseFrame) => void): this;
    off(eventName: 'commandResponse', listener: (frame: CommandResponseFrame) => void): this;
    addListener(eventName: 'commandResponse', listener: (frame: CommandResponseFrame) => void): this;
    removeListener(eventName: 'commandResponse', listener: (frame: CommandResponseFrame) => void): this;
    emit(eventName: 'commandResponse', frame: CommandResponseFrame): boolean;
    on(eventName: 'clientError', listener: (error: ClientError) => void): this;
    once(eventName: 'clientError', listener: (error: ClientError) => void): this;
    off(eventName: 'clientError', listener: (error: ClientError) => void): this;
    addListener(eventName: 'clientError', listener: (error: ClientError) => void): this;
    removeListener(eventName: 'clientError', listener: (error: ClientError) => void): this;
    emit(eventName: 'clientError', error: ClientError): boolean;
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
export interface ClientConnection {
    server: WSServer;
    session: ServerSession;
    request: IncomingMessage;
}
export declare class WSServer extends WebSocketServer {
    protected sessions: Set<ServerSession>;
    version: Version;
    constructor(port: number, handleClient?: (client: ClientConnection) => void);
    handleUpgrade(request: IncomingMessage, socket: Duplex, upgradeHead: Buffer, callback: (client: WebSocket, request: IncomingMessage) => void): void;
    completeUpgrade(extensions: Record<string, unknown>, key: string, protocols: Set<string>, req: IncomingMessage, socket: Duplex, head: Buffer, cb: (client: WebSocket, request: IncomingMessage) => void): void;
    broadcastCommand(command: string, callback: (frame: CommandResponseFrame) => void): void;
    broadcastSubscribe(eventName: string, callback: (frame: EventFrame) => void): void;
    broadcastUnsubscribe(eventName: string, callback: (frame: EventFrame) => void): void;
    disconnectAll(force?: boolean): void;
}
export interface WSServerEventMap {
    client: (client: ClientConnection) => void;
}
export interface WSServer {
    on(eventName: 'client', listener: (client: ClientConnection) => void): this;
    once(eventName: 'client', listener: (client: ClientConnection) => void): this;
    off(eventName: 'client', listener: (client: ClientConnection) => void): this;
    addListener(eventName: 'client', listener: (client: ClientConnection) => void): this;
    removeListener(eventName: 'client', listener: (client: ClientConnection) => void): this;
    emit(eventName: 'client', client: ClientConnection): boolean;
    on(event: string | symbol, listener: (...args: any[]) => void): this;
    once(event: string | symbol, listener: (...args: any[]) => void): this;
    off(event: string | symbol, listener: (...args: any[]) => void): this;
    addListener(event: string | symbol, listener: (...args: any[]) => void): this;
    removeListener(event: string | symbol, listener: (...args: any[]) => void): this;
    emit(event: string | symbol, ...args: any[]): boolean;
}
export {};
