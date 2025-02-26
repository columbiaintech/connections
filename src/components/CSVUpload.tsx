"use client";
// csv dropzone - passes csv to CSVMapping component
// TODO: add success/error messages after upload attempt

import React, {useCallback, useState} from "react";
import {useDropzone} from "react-dropzone";
import CSVMapping, {ColumnMap} from "@/components/CSVMapping";

interface CSVUploadProps {
    dbColumns: string[];
    onFileUpload: (file: File) => void;
    onMappingUpdate: (mapping: ColumnMap[]) => void;
}

function CSVUpload({ dbColumns, onFileUpload, onMappingUpdate }: CSVUploadProps) {
    const [file, setFile] = useState<File | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setFile(file);
        onFileUpload(file);
    }, [onFileUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.ms-excel': ['.csv']
        },
        maxFiles: 1
    });

    return (
        <div className="w-full max-w-2xl mx-auto font-[family-name:var(--font-fragment-mono)]">
            <h3 className="text-lg font-medium mb-3 text-gray-700">Upload CSV</h3>
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-sea bg-sea-200' : 'border-rose-300 hover:border-rose-500'
                }`}
            >
                <input {...getInputProps()} />
                <div className="mx-auto h-12 w-12 text-gray-700" />
                <p className="mt-1 text-sm text-gray-700">
                    Drag and drop your CSV file here, or click to select a file</p>
                <p className="mt-1 text-xs text-gray-500">Only CSV files are accepted</p>
            </div>
            {file &&(
                <CSVMapping file={file} dbColumns={dbColumns} onMappingUpdate={onMappingUpdate}/>
            )}
        </div>
    );
}
export default CSVUpload;