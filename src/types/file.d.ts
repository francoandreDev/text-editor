export type TFileHandles = {
    handle: FileSystemFileHandle | null;
    name: string | null;
    blob: Blob | null;
}[]

export type TFilesWrapper = {
    current: {
        handle: FileSystemFileHandle | null;
        name: string | null;
        blob: Blob | null;
    } | null;
};