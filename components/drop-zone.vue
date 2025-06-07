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
            <div>
              <span class="cancel-icon">X</span> {{ file.nameTruncated }}
            </div>
            <button>download</button>
              <select @click.stop v-model="file.targetType" id="convertTo">
                <option disabled value="">Convert to...</option>
                <option value="mp3">MP3</option>
                <option value="mp4">MP4</option>
                <option value="jpeg">JPEG</option>
              </select>
            
          </div>
        </li>
      </ul>
    </div>
    <input type="file" multiple ref="fileInput" @change="onFileChange" style="display: none" />
  </div>

  <button class="convert-button">Convert</button>
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
  padding-left: 5vh;
  padding-right: 5vh;
  justify-content: space-between;
  align-items: center;
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
  margin-top: 10px;
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

select {
  color: white;                     /* Text color */
  background-color: #2c3e50;        /* Main background */
  padding: 8px 36px 8px 12px;       /* Right padding leaves space for arrow */
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

</style>


<script setup lang="ts">
import { ref } from 'vue'
import type { FileModel } from '~/models/file.model'

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

function openFileDialog(): void {
  fileInput.value?.click()
}

// File handling
function addFiles(fileList: FileList): void {
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
  }))
  filesData.value.push(...mapped)
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

function formatSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i]
}
</script>
