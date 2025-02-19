"use client";
import styles from "../app/styles/Home.module.css"
import DatePicker from "./DatePicker"
import CSVUpload from "@/components/CSVUpload";
import React from "react";
import {useCallback, useState} from "react";
import {parse} from 'papaparse';
// TODO: get event details as textinput: event name, location, date, time

interface EventFormProps {
    eventName: string;
    eventDate: Date | null;
    file: File | null;
    csvColumns: string[];
    dbColumns: string[];

}

interface ColumnMap{
    csvColumn: string | null;
    dbColumn: string;
}

function EventForm({dbColumns}: EventFormProps) {
    const [eventName, setEventName] = useState('');
    const [eventDate, setEventDate] = useState<Date | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [columnMap, setColumnMap] = useState<ColumnMap[]>([]);

    const handleFileUpload = (file: File) => {
        setFile(file);
    }

    const handleMappingUpdate = (mapping: ColumnMap[]) => {
        setColumnMap(mapping);
    }

    const handleSubmit = async ()=>{
        try {
            parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: async (results) => {
                    const {data} = results;
                    const mappedData = data.map((row: any) => {
                        const newRow: any = {};
                        columnMap.forEach(map => {
                            if (map.csvColumn && row[map.csvColumn] !== undefined) {
                                newRow[map.dbColumn] = row[map.csvColumn];
                            }
                        });
                        return newRow;
                    });
                    await updateData({eventName, eventDate, mappedData});
                }
            });
        } catch(e){
            console.error('Could not process file.', e);
        }
    };

    return (
        <div>
            <form className={styles.eventForm} onSubmit={(e)=>e.preventDefault()}>
                <textarea name="eventName"
                          spellCheck="false"
                          autoCapitalize="words"
                    onInput={(e) => {
                        e.target.style.height = '';
                        e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                          className="font-[family-name:var(--font-geist-mono)] text-3xl"
                          placeholder={"Event Name"}
                />
                <DatePicker selected={eventDate}/>
                <CSVUpload dbColumns={dbColumns} onFileUpload={handleFileUpload} onMappingUpdate={handleMappingUpdate}/>
            </form>
            <button
                onClick={handleSubmit}
                className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {'Create Event'}
            </button>

        </div>
    );
};
export default EventForm;