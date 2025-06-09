import type { FileData } from "@ffmpeg/ffmpeg";

export interface FileModel {
    name: string;
    nameTruncated: string;
    nameNoExtension: string;
    sizeBytes: number;
    converted: boolean;
    converting: boolean;
    targetType: string;
    data: File;
    fileType: string;
    availableTypes: string[];
    resultData: FileData | null;
}