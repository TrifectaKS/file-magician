<template>
  <div class="dropzone" @dragover.prevent="onDragOver" @dragleave.prevent="onDragLeave" @drop.prevent="onDrop"
    @click="openFileDialog" :class="{ 'dragover': isDragOver }">
    <p>Drag & drop files here, or click to select files</p>
    <input type="file" multiple ref="fileInput" @change="onFileChange" style="display: none" />
    <button @click="openFileDialog">Select Files</button>
  </div>

  <ul v-if="filesData.length">
    <li v-for="(file, index) in filesData" :key="index">
      {{ file.name }} ({{ formatSize(file.sizeBytes) }})
    </li>
  </ul>
</template>

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
function formatSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i]
}
</script>

<style scoped>
.dropzone {
  border: 2px dashed #aaa;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  margin-bottom: 1rem;
  user-select: none;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.dropzone.dragover {
  background-color: #eef6ff;
  border-color: #3b82f6;
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
</style>
