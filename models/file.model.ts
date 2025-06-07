export interface FileModel {
    name: string;
    nameTruncated: string;
    sizeBytes: number;
    converted: boolean;
    converting: boolean;
    convertProgress: number;
    targetType: string;
    data: File;
}