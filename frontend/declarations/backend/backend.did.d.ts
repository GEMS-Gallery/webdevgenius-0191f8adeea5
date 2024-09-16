import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface ChatMessage { 'content' : string, 'role' : string }
export interface FileContent { 'content' : string, 'lastModified' : bigint }
export type ImageData = { 'url' : string } |
  { 'base64' : string };
export type Result = { 'ok' : null } |
  { 'err' : string };
export type Result_1 = { 'ok' : FileContent } |
  { 'err' : string };
export interface SearchResult { 'title' : string, 'body' : string }
export interface _SERVICE {
  'addFile' : ActorMethod<[string, string], Result>,
  'addMessage' : ActorMethod<[string, string], undefined>,
  'changeModel' : ActorMethod<[string], undefined>,
  'clearMemory' : ActorMethod<[], undefined>,
  'createNewFile' : ActorMethod<[string, string], Result>,
  'editFile' : ActorMethod<[string, string], Result>,
  'getChatHistory' : ActorMethod<[], Array<ChatMessage>>,
  'getCurrentModel' : ActorMethod<[], string>,
  'getFileContent' : ActorMethod<[string], Result_1>,
  'getStoredImage' : ActorMethod<[string], [] | [ImageData]>,
  'getStoredSearch' : ActorMethod<[string], [] | [Array<SearchResult>]>,
  'resetAll' : ActorMethod<[], undefined>,
  'storeImage' : ActorMethod<[string, ImageData], undefined>,
  'storeSearch' : ActorMethod<[string, Array<SearchResult>], undefined>,
  'undoEdit' : ActorMethod<[string], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
