"use client";

import { useRef, useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/components/providers/ToastProvider";
import Modal from "@/app/components/Modal";

function ArrowUpIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  );
}

function ArrowDownIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

function DocumentIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

type ImportType = "productos" | "clientes" | "zonas";

interface ImportResult {
  message: string;
  creados: number;
  actualizados: number;
  errores: string[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  tipo: ImportType;
  onSuccess: () => void;
}

const LABELS: Record<ImportType, string> = {
  productos: "Productos",
  clientes: "Clientes",
  zonas: "Zonas Logísticas",
};

export default function ImportModal({ open, onClose, tipo, onSuccess }: Props) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  function handleClose() {
    setFile(null);
    setResult(null);
    onClose();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setResult(null);
  }

  async function handleDownloadTemplate() {
    setDownloadingTemplate(true);
    try {
      await api.descargarPlantilla(tipo);
      toast("Plantilla descargada", "success");
    } catch {
      toast("Error al descargar la plantilla", "error");
    } finally {
      setDownloadingTemplate(false);
    }
  }

  async function handleImport() {
    if (!file) return;
    setImporting(true);
    setResult(null);
    try {
      let res: ImportResult;
      if (tipo === "productos") res = await api.importarProductos(file);
      else if (tipo === "clientes") res = await api.importarClientes(file);
      else res = await api.importarZonas(file);

      setResult(res);

      if (res.creados > 0 || res.actualizados > 0) {
        toast(res.message, "success");
        onSuccess();
      } else if (res.errores.length > 0) {
        toast("Importación con errores. Revisá los detalles.", "error");
      } else {
        toast("No se importó ningún registro.", "error");
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : "Error al importar", "error");
    } finally {
      setImporting(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title={`Importar ${LABELS[tipo]} desde CSV`}>
      <div className="space-y-4">
        {/* Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Subí un archivo <strong>.csv</strong> con la estructura correcta. Podés descargar la plantilla para ver el formato esperado.
          </p>
        </div>

        {/* Descargar plantilla */}
        <button
          onClick={handleDownloadTemplate}
          disabled={downloadingTemplate}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          <ArrowDownIcon />
          {downloadingTemplate ? "Descargando..." : `Descargar plantilla CSV de ${LABELS[tipo]}`}
        </button>

        {/* Selección de archivo */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            className="hidden"
            onChange={handleFileChange}
          />
          {file ? (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <DocumentIcon className="w-5 h-5 text-blue-500" />
              <span className="font-medium">{file.name}</span>
              <span className="text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          ) : (
            <div>
              <DocumentIcon className="w-8 h-8 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Hacé clic para seleccionar un archivo <strong>.csv</strong>
              </p>
            </div>
          )}
        </div>

        {/* Resultado */}
        {result && (
          <div className="space-y-2">
            <div className="flex gap-3 text-sm">
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded">
                ✓ {result.creados} creados
              </span>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded">
                ↺ {result.actualizados} actualizados
              </span>
              {result.errores.length > 0 && (
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded">
                  ✗ {result.errores.length} errores
                </span>
              )}
            </div>
            {result.errores.length > 0 && (
              <div className="max-h-32 overflow-y-auto bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                {result.errores.map((e, i) => (
                  <p key={i} className="text-xs text-red-600 dark:text-red-400">{e}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cerrar
          </button>
          <button
            onClick={handleImport}
            disabled={!file || importing}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            <ArrowUpIcon />
            {importing ? "Importando..." : "Importar"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
