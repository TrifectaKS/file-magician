<template>
  <div class="dropzone" @dragover.prevent="onDragOver" @dragleave.prevent="onDragLeave" @drop.prevent="onDrop"
    @click="openFileDialog" :class="{ 'dragover': isDragOver }">
    <div v-if="filesData.length == 0" class="dropzone-text">
      <img src="/upload.svg" />
      <span class="dropzone-text-main">Drag a file</span>
      <span class="dropzone-text-secondary">or click to select one.</span>
    </div>
    <div v-else class="dropzone-list">
      <ul v-if="filesData.length">
        <li v-for="(file, index) in filesData" :key="index">
          <div class="dropzone-list-item">
            <div class="dropzone-list-item-name">
              <span class="cancel-icon" @click.stop="remove(file)">X</span> {{ file.nameTruncated }}
            </div>
            <div v-if="!file.converting && file.converted">
              <button class="download-button" @click.stop="download(file)">Download</button>
            </div>
            <div v-else-if="!file.converting && !file.converted">
              <select @click.stop v-model="file.targetType">
                <option disabled value="">Convert to...</option>
                <option v-for="type in file.availableTypes" :value="type">
                  {{ type.toUpperCase() }}
                </option>
              </select>
            </div>
            <div v-else-if="file.converting">
              <span>Converting...</span>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <input type="file" multiple ref="fileInput" @change="onFileChange" style="display: none" />
  </div>

  <button class="convert-button" @click="convert">Convert</button>
</template>


<style scoped>
.cancel-icon {
  color: red;
  padding-right: 1vh;
}

.dropzone {
  border: 2px dashed #5E625A;
  width: 50vw;
  min-height: 15vh;
  height: fit-content;
  text-align: center;
  align-content: center;
  cursor: pointer;
  margin-bottom: 1rem;
  user-select: none;
  border-radius: 20px;
  transition: background-color 0.3s ease;
  background-color: #1B2426;
}

.dropzone.dragover {
  background-color: #3D4546;
  border-color: #3D4546;
}

.dropzone-text {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dropzone-text-main {
  font-weight: bold;
  color: #5E625A;
}

.dropzone-text-secondary {
  font-style: italic;
  color: #5E625A;
}

.dropzone-list {
  color: #FAF4D3;
}

.dropzone-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 5vh;
}

.dropzone-list-item-name {
  text-align: left;
}

ul {
  list-style-type: none;
  padding-left: 0;
}

li {
  margin: 5px 0;
  font-family: monospace;
}

button {
  cursor: pointer;
}

.convert-button {
  width: 50vw;
  height: 10vh;
  background-color: #004643;
  border: none;
  color: #FAF4D3;
  border-radius: 20px;
}

.download-button {
  width: 141px;
  height: 33px;
  background-color: red;
  border: none;
  color: #FAF4D3;
  border-radius: 20px;
}

select {
  color: #FAF4D3;
  background-color: #2c3e50;
  padding: 8px 36px 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>


<script setup lang="ts">
import { ref } from 'vue'
import type { FileModel } from '~/models/file.model'
import { getPossibleExtensions, loadFFmpeg, loadFile } from '~/services/ffmpeg.service';

if (import.meta.client) {
  await loadFFmpeg();
}

// Refs
const filesData = ref<FileModel[]>([])
const isDragOver = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

// Events
function onDragOver(): void {
  isDragOver.value = true
}

function onDragLeave(): void {
  isDragOver.value = false
}

function onDrop(event: DragEvent): void {
  isDragOver.value = false
  if (event.dataTransfer?.files) {
    addFiles(event.dataTransfer.files)
  }
}

function onFileChange(event: Event): void {
  const target = event.target as HTMLInputElement
  if (target?.files) {
    addFiles(target.files)
  }
}

function remove(file: FileModel): void {
  filesData.value = filesData.value.filter(f => f !== file);
}

function download(file: FileModel): void {

}


function openFileDialog(): void {
  fileInput.value?.click()
}

// File handling
async function addFiles(fileList: FileList): Promise<void> {
  const arr = Array.from(fileList)
  const mapped = arr.map(file => ({
    name: file.name,
    nameTruncated: truncateFilename(file.name, 10),
    sizeBytes: file.size,
    fileType: file.type || 'unknown',
    file: file,
    converted: false,
    converting: false,
    convertProgress: 0,
    targetType: '',
    data: file,
    availableTypes: [] as string[]
  }))
  filesData.value.push(...mapped)

  for (const f of filesData.value) {
    const p = await loadFile(f);
    f.fileType = p ?? '';

    const detectedFormat = p;
    const fallbackExtension = getExtensionFromFileName(f.name);

    f.availableTypes = getPossibleExtensions(detectedFormat ?? fallbackExtension);
  }
}

function getValidFiles(): FileModel[] {
  return filesData.value.filter(x => x.targetType != null && x.targetType != undefined && x.targetType.trim() !== "");
}

async function convert(): Promise<void> {
  const validFiles = getValidFiles()
  validFiles.forEach(x => x.converted = true);
}

// Utils
function truncateFilename(filename: string, maxBaseLength: number): string {
  const dotIndex = filename.lastIndexOf('.');

  if (dotIndex === -1) {
    return (filename.length > maxBaseLength
      ? filename.slice(0, maxBaseLength)
      : filename) + '...';
  }

  const name = filename.slice(0, dotIndex);
  const ext = filename.slice(dotIndex);

  if (name.length <= maxBaseLength) {
    return filename;
  }

  return name.slice(0, maxBaseLength) + '~' + ext;
}

function getExtensionFromFileName(fileName: string): string {
  const match = fileName.match(/\.([^.]+)$/);
  return match ? match[1].toLowerCase() : '';
}
</script>
