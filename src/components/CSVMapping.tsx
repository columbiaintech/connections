"use client";
// TODO: displays uploaded csv columns in table format, allows user to ignore, delete (and maybe technically create) columns

import {parse} from 'papaparse';
import React, {useState, useEffect, useCallback} from "react";
import {fetchColumns} from "@/app/actions/updateData";

type ColumnMap = {
    csvColumn: string;
    dbColumn: string|null;
}

export default function CSVMapping({file}: {file: File}) {
    const [columns, setColumns] = useState<string[]>([]);
    const [dbColumns, setDbColumns] = useState<string[]>([]);
    const [columnMapping, setColumnMapping] = useState<ColumnMap[]>([]);

    useEffect(() => {
        const getColumns = async () => {
            const columns = await fetchColumns();
            setDbColumns(columns);
        }
        getColumns();
    }, []);

    useEffect(() => {
        if (file) {
            parse(file, {
                header: true,
                preview: 1,
                complete: (results) => {
                    if (results.data && results.data.length > 0) {
                        const csvColumns = results.meta.fields || [];
                        setColumns(csvColumns);

                        const mapping = csvColumns.map(csvCol => {
                            const exactMatch = dbColumns.find(dbCol =>
                                dbCol.toLowerCase() === csvCol.toLowerCase());

                            if (!exactMatch) {
                                const similarMatch = dbColumns.find(dbCol =>
                                    dbCol.toLowerCase().includes(csvCol.toLowerCase()) ||
                                    csvCol.toLowerCase().includes(dbCol.toLowerCase()));

                                return {csvColumn: csvCol, dbColumn: similarMatch || null};
                            }

                            return {csvColumn: csvCol, dbColumn: exactMatch};
                        });

                        setColumnMapping(mapping);
                    }
                },
            });
        }
    }, [file]);


    const handleColumnMappingChange = (csvColumn: string, dbColumn: string | null) => {
        setColumnMapping(prev =>
            prev.map(map =>
                map.csvColumn === csvColumn ? {...map, dbColumn} : map
            )
        );
    };

    const handleProcessFile = async () => {
        parse(file, {
            header: true,
            complete: async (results) => {
                const {data} = results;

                const mappedData = data.map((row: any) => {
                    const newRow: any = {};

                    columnMapping.forEach(map => {
                        if (map.dbColumn && row[map.csvColumn]) {
                            newRow[map.dbColumn] = row[map.csvColumn];
                        }
                    });

                    return newRow;
                });
                await updateData(mappedData);
            }
        });
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Column Mapping</h3>
                <p className="text-sm text-gray-600 mb-4">
                    We've automatically mapped CSV columns to database fields. Please review and adjust if needed.
                </p>

                <div className="space-y-3">
                    {columnMapping.map(({csvColumn, dbColumn}) => (
                        <div key={csvColumn} className="flex items-center gap-4">
                            <span className="w-1/2 p-1 text-sm">{csvColumn}</span>
                            <select
                                value={dbColumn || ''}
                                onChange={(e) => handleColumnMappingChange(csvColumn, e.target.value)}
                                className="w-1/3 border rounded p-1 block w-full rounded-md border-gray-300 shadow-sm text-xs focus"
                            >
                                <option value="">--</option>
                                {dbColumns.map(col => (
                                    <option key={col} value={col}>
                                        {col}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleProcessFile}
                    className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {'Process CSV File'}
                </button>
            </div>
        </div>
    );
}