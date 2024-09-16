import ExperimentalCycles "mo:base/ExperimentalCycles";

import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";
import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";
import Error "mo:base/Error";
import Float "mo:base/Float";
import HashMap "mo:base/HashMap";
import Hash "mo:base/Hash";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Trie "mo:base/Trie";

actor {
    // Types
    type ChatMessage = {
        role: Text;
        content: Text;
    };

    type FileContent = {
        content: Text;
        lastModified: Int;
    };

    type SearchResult = {
        title: Text;
        body: Text;
    };

    type ImageData = {
        #url: Text;
        #base64: Text;
    };

    // State variables
    private stable var chatHistory : [ChatMessage] = [];
    private stable var fileContents : [(Text, FileContent)] = [];
    private stable var storedSearches : [(Text, [SearchResult])] = [];
    private stable var storedImages : [(Text, ImageData)] = [];
    private stable var undoHistory : [(Text, Text)] = [];
    private stable var currentModel : Text = "openai/o1-mini-2024-09-12";

    private var fileContentsMap = HashMap.fromIter<Text, FileContent>(fileContents.vals(), 10, Text.equal, Text.hash);
    private var storedSearchesMap = HashMap.fromIter<Text, [SearchResult]>(storedSearches.vals(), 10, Text.equal, Text.hash);
    private var storedImagesMap = HashMap.fromIter<Text, ImageData>(storedImages.vals(), 10, Text.equal, Text.hash);
    private var undoHistoryMap = HashMap.fromIter<Text, Text>(undoHistory.vals(), 10, Text.equal, Text.hash);

    // Helper functions
    private func addChatMessage(role: Text, content: Text) {
        let newMessage : ChatMessage = { role = role; content = content };
        chatHistory := Array.append(chatHistory, [newMessage]);
    };

    // Public functions
    public query func getChatHistory() : async [ChatMessage] {
        chatHistory
    };

    public func addMessage(role: Text, content: Text) : async () {
        addChatMessage(role, content);
    };

    public func addFile(filepath: Text, content: Text) : async Result.Result<(), Text> {
        let fileContent : FileContent = {
            content = content;
            lastModified = Time.now();
        };
        fileContentsMap.put(filepath, fileContent);
        #ok(())
    };

    public query func getFileContent(filepath: Text) : async Result.Result<FileContent, Text> {
        switch (fileContentsMap.get(filepath)) {
            case (null) { #err("File not found") };
            case (?content) { #ok(content) };
        }
    };

    public func editFile(filepath: Text, newContent: Text) : async Result.Result<(), Text> {
        switch (fileContentsMap.get(filepath)) {
            case (null) { #err("File not found") };
            case (?oldContent) {
                undoHistoryMap.put(filepath, oldContent.content);
                let updatedContent : FileContent = {
                    content = newContent;
                    lastModified = Time.now();
                };
                fileContentsMap.put(filepath, updatedContent);
                #ok(())
            };
        }
    };

    public func createNewFile(filepath: Text, content: Text) : async Result.Result<(), Text> {
        switch (fileContentsMap.get(filepath)) {
            case (?_) { #err("File already exists") };
            case (null) {
                let fileContent : FileContent = {
                    content = content;
                    lastModified = Time.now();
                };
                fileContentsMap.put(filepath, fileContent);
                #ok(())
            };
        }
    };

    // Store search results
    public func storeSearch(_query : Text, results : [SearchResult]) : async () {
        storedSearchesMap.put(_query, results);
    };

    public query func getStoredSearch(_query: Text) : async ?[SearchResult] {
        storedSearchesMap.get(_query)
    };

    public func storeImage(key: Text, imageData: ImageData) : async () {
        storedImagesMap.put(key, imageData);
    };

    public query func getStoredImage(key: Text) : async ?ImageData {
        storedImagesMap.get(key)
    };

    public func clearMemory() : async () {
        fileContentsMap := HashMap.fromIter<Text, FileContent>([].vals(), 10, Text.equal, Text.hash);
        storedSearchesMap := HashMap.fromIter<Text, [SearchResult]>([].vals(), 10, Text.equal, Text.hash);
        storedImagesMap := HashMap.fromIter<Text, ImageData>([].vals(), 10, Text.equal, Text.hash);
        undoHistoryMap := HashMap.fromIter<Text, Text>([].vals(), 10, Text.equal, Text.hash);
    };

    public func resetAll() : async () {
        chatHistory := [];
        fileContentsMap := HashMap.fromIter<Text, FileContent>([].vals(), 10, Text.equal, Text.hash);
        storedSearchesMap := HashMap.fromIter<Text, [SearchResult]>([].vals(), 10, Text.equal, Text.hash);
        storedImagesMap := HashMap.fromIter<Text, ImageData>([].vals(), 10, Text.equal, Text.hash);
        undoHistoryMap := HashMap.fromIter<Text, Text>([].vals(), 10, Text.equal, Text.hash);
    };

    public func undoEdit(filepath: Text) : async Result.Result<(), Text> {
        switch (undoHistoryMap.get(filepath)) {
            case (null) { #err("No undo history for this file") };
            case (?oldContent) {
                switch (fileContentsMap.get(filepath)) {
                    case (null) { #err("File not found") };
                    case (?currentContent) {
                        let updatedContent : FileContent = {
                            content = oldContent;
                            lastModified = Time.now();
                        };
                        fileContentsMap.put(filepath, updatedContent);
                        undoHistoryMap.delete(filepath);
                        #ok(())
                    };
                }
            };
        }
    };

    public query func getCurrentModel() : async Text {
        currentModel
    };

    public func changeModel(newModel: Text) : async () {
        currentModel := newModel;
    };

    // System functions
    system func preupgrade() {
        fileContents := Iter.toArray(fileContentsMap.entries());
        storedSearches := Iter.toArray(storedSearchesMap.entries());
        storedImages := Iter.toArray(storedImagesMap.entries());
        undoHistory := Iter.toArray(undoHistoryMap.entries());
    };

    system func postupgrade() {
        fileContents := [];
        storedSearches := [];
        storedImages := [];
        undoHistory := [];
    };
}