#!/usr/bin/env bun

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const MAX_LINES = 400;
const SRC_DIR = "./src";

// Archivos y carpetas que deben ignorarse
const IGNORE_PATTERNS = [
  "node_modules",
  ".next",
  ".git",
  "database.types.ts", // Archivo generado automáticamente por Supabase
  "next-env.d.ts", // Archivo generado por Next.js
];

// Extensiones de archivos a verificar
const FILE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

interface FileInfo {
  path: string;
  lines: number;
}

/**
 * Verifica si un archivo o carpeta debe ser ignorado
 */
function shouldIgnore(filePath: string): boolean {
  const fileName = filePath.split("/").pop() || "";
  const pathParts = filePath.split("/");

  return IGNORE_PATTERNS.some((pattern) => {
    // Verificar si el patrón coincide con el nombre del archivo
    if (fileName === pattern) return true;
    // Verificar si alguna parte de la ruta coincide
    if (pathParts.includes(pattern)) return true;
    return false;
  });
}

/**
 * Verifica si un archivo tiene una extensión válida
 */
function hasValidExtension(filePath: string): boolean {
  return FILE_EXTENSIONS.some((ext) => filePath.endsWith(ext));
}

/**
 * Cuenta las líneas de un archivo
 */
async function countLines(filePath: string): Promise<number> {
  try {
    const content = await readFile(filePath, "utf-8");
    // Contar líneas (incluyendo la última línea aunque no termine en \n)
    const lines = content.split("\n").length;
    return lines;
  } catch (error) {
    process.stderr.write(
      `Error leyendo archivo ${filePath}: ${String(error)}\n`,
    );
    return 0;
  }
}

/**
 * Recorre recursivamente el directorio y encuentra archivos con más de MAX_LINES líneas
 */
async function checkFiles(
  dir: string,
  files: FileInfo[] = [],
): Promise<FileInfo[]> {
  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relativePath = fullPath.replace(/^\.\//, "");

      // Ignorar archivos y carpetas según los patrones
      if (shouldIgnore(relativePath)) {
        continue;
      }

      if (entry.isDirectory()) {
        // Recursión para subdirectorios
        await checkFiles(fullPath, files);
      } else if (entry.isFile() && hasValidExtension(fullPath)) {
        // Contar líneas del archivo
        const lines = await countLines(fullPath);
        if (lines > MAX_LINES) {
          files.push({ path: relativePath, lines });
        }
      }
    }
  } catch (error) {
    process.stderr.write(`Error accediendo a ${dir}: ${String(error)}\n`);
  }

  return files;
}

/**
 * Función principal
 */
async function main() {
  try {
    const files = await checkFiles(SRC_DIR);

    if (files.length > 0) {
      process.stderr.write(
        `\n⚠️  WARNING: Se encontraron ${files.length} archivo(s) con más de ${MAX_LINES} líneas:\n`,
      );
      files.forEach((file) => {
        process.stderr.write(`  ${file.path} (${file.lines} líneas)\n`);
      });
      process.stderr.write("\n");
      process.exit(1);
    }
    // Si no hay archivos con más de 400 líneas, no mostrar nada
  } catch (error) {
    process.stderr.write(`Error ejecutando el script: ${String(error)}\n`);
    process.exit(1);
  }
}

main();
