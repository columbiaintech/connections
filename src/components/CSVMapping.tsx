"use client";
// displays uploaded csv columns in table format,
// ignores columns marked "--"
// assuming no need to edit rows - maybe add edit button to modify csv before processing?

import {parse} from 'papaparse';
import React, {useState, useEffect, useCallback} from "react";
import {stringSimilarity} from "string-similarity-js";

interface CSVMappingProps{
    file: File;
    dbColumns: string[];
}

type ColumnMap = {
    csvColumn: string | null;
    dbColumn: string;
    matchConfidence?: number;
}

export default function CSVMapping({ file, dbColumns, onMappingUpdate }: CSVMappingProps) {
    const [csvColumns, setCsvColumns] = useState<string[]>([]);
    const [columnMapping, setColumnMapping] = useState<ColumnMap[]>([]);

    useEffect(() => {
        if (file && dbColumns.length>0) {
            parse(file, {
                header: true,
                skipEmptyLines: true,
                preview: 1,
                complete: (results) => {
                    if (results.data && results.data.length > 0) {
                        const csvCols = results.meta.fields || [];
                        setCsvColumns(csvCols);

                        const mapping = dbColumns.map(dbCol => {
                            let bestMatch = null;
                            let highestSimilarity = 0;

                            csvCols.forEach(csvCol=>{
                                const similarity = stringSimilarity(
                                    csvCol.toLowerCase().replace(/[^\w\s]/g, ''),
                                    dbCol.toLowerCase().replace(/[^\w\s]/g, ''));
                                if(similarity>highestSimilarity){
                                    highestSimilarity = similarity;
                                    bestMatch = csvCol;
                                }
                            });

                            if(highestSimilarity>0.8){
                                return {
                                    csvColumn: bestMatch,
                                    dbColumn: dbCol,
                                    matchConfidence: highestSimilarity

                                };
                            }
                            else if(highestSimilarity>0.5){
                                return {
                                    csvColumn: bestMatch,
                                    dbColumn: dbCol,
                                    matchConfidence: highestSimilarity

                                };
                            }
                            return {csvColumn: null, dbColumn: dbCol, matchConfidence: 0};
                        });

                        setColumnMapping(mapping);
                    }
                },
            });
        }
    }, [file, dbColumns]);

    const handleColumnMappingChange = (dbColumn: string, csvColumn: string | null) => {
        setColumnMapping(prev =>
            prev.map(map =>
                map.dbColumn === dbColumn ? {...map, csvColumn} : map
            )
        );
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Column Mapping</h3>
                <p className="text-sm text-gray-600 mb-4">
                    We've automatically mapped CSV columns to database fields. Please review and adjust if needed.
                </p>

                <div className="flex items-center">
                <span className="w-1/2 p-1 font-medium">Database Fields</span>
                <span className="w-1/2 p-1 font-medium">CSV Fields</span>
                </div>
                <div className="space-y-3  ">
                    {columnMapping.map(({csvColumn, dbColumn, matchConfidence}) => (
                        <div key={dbColumn} className="flex items-center gap-4">
                            <span className="w-1/2 p-1 text-sm">{dbColumn}</span>
                            <select
                                value={csvColumn || ''}
                                onChange={(e) => handleColumnMappingChange(dbColumn, e.target.value || null)}
                                className={`w-1/2 border rounded p-1 block rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500 ${
                                    matchConfidence && matchConfidence > 0.8 ? '' :
                                        matchConfidence && matchConfidence > 0.5 ? 'bg-yellow-50 border-yellow-300' :
                                            'bg-red-50 border-red-300'
                                }`}
                            >
                                <option value="">--</option>
                                {csvColumns.map(col => (
                                    <option key={col} value={col}>
                                        {col}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}