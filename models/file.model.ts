export interface FileModel {
    name: string;
    sizeBytes: number;
    converted: boolean;
    converting: boolean;
    convertProgress: number;
    targetType: string;
    data: File; //this expects import
}