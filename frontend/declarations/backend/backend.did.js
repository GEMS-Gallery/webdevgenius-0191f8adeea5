export const idlFactory = ({ IDL }) => {
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const ChatMessage = IDL.Record({ 'content' : IDL.Text, 'role' : IDL.Text });
  const FileContent = IDL.Record({
    'content' : IDL.Text,
    'lastModified' : IDL.Int,
  });
  const Result_1 = IDL.Variant({ 'ok' : FileContent, 'err' : IDL.Text });
  const ImageData = IDL.Variant({ 'url' : IDL.Text, 'base64' : IDL.Text });
  const SearchResult = IDL.Record({ 'title' : IDL.Text, 'body' : IDL.Text });
  return IDL.Service({
    'addFile' : IDL.Func([IDL.Text, IDL.Text], [Result], []),
    'addMessage' : IDL.Func([IDL.Text, IDL.Text], [], []),
    'changeModel' : IDL.Func([IDL.Text], [], []),
    'clearMemory' : IDL.Func([], [], []),
    'createNewFile' : IDL.Func([IDL.Text, IDL.Text], [Result], []),
    'editFile' : IDL.Func([IDL.Text, IDL.Text], [Result], []),
    'getChatHistory' : IDL.Func([], [IDL.Vec(ChatMessage)], ['query']),
    'getCurrentModel' : IDL.Func([], [IDL.Text], ['query']),
    'getFileContent' : IDL.Func([IDL.Text], [Result_1], ['query']),
    'getStoredImage' : IDL.Func([IDL.Text], [IDL.Opt(ImageData)], ['query']),
    'getStoredSearch' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(IDL.Vec(SearchResult))],
        ['query'],
      ),
    'resetAll' : IDL.Func([], [], []),
    'storeImage' : IDL.Func([IDL.Text, ImageData], [], []),
    'storeSearch' : IDL.Func([IDL.Text, IDL.Vec(SearchResult)], [], []),
    'undoEdit' : IDL.Func([IDL.Text], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
