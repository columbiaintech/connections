"use client";
import styles from "../app/styles/Home.module.css"
import DatePicker from "./DatePicker"
import CSVUpload from "@/components/CSVUpload";
import React from "react";
import {useCallback, useState, FormEvent} from "react";
import {parse} from 'papaparse';
import {updateEvent} from "@/app/actions/updateData";
import {ColumnMap} from "@/components/CSVMapping";
import {useRouter} from "next/navigation";
// TODO: get event details as textinput: event name, location, date, time

interface EventFormProps {
    dbColumns: string[];
}

interface EventData{
    eventName: string;
    eventDate: Date | null;
    mappedData: Record<string, any>[];
}

function EventForm({dbColumns}: EventFormProps) {
    const [eventName, setEventName] = useState('');
    const [eventDate, setEventDate] = useState<Date | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [columnMapping, setColumnMapping] = useState<ColumnMap[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleFileUpload = (file: File) => {
        setFile(file);
    }

    const handleMappingUpdate = (mapping: ColumnMap[]) => {
        setColumnMapping(mapping);
    }

    const handleDateChange = (date: Date) => {
        setEventDate(date);
    };

    async function handleSubmit(event:FormEvent<HTMLFormElement>){
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        try{
            console.log("Submitting event with:", { eventName, eventDate, file, columnMapping });
            if (!eventName) console.error("❌ Missing event name");
            if (!eventDate) console.error("❌ Missing event date");
            if (!file) console.error("❌ Missing uploaded file");
            if (columnMapping.length === 0) console.error("❌ No column mapping");

            if(!file||!eventName||!eventDate){
                throw new Error('Please fill out all fields');
            }

            if (columnMapping.length === 0) {
                throw new Error("Please map at least one column.");
            }


            const processFile = (): Promise<Record<string, any>[]> => {
                return new Promise((resolve, reject)=>{
                    parse(file, {
                        header: true,
                        skipEmptyLines: true,
                        complete: (results) => {
                            const {data} = results;
                            if (!data.length) {
                                return reject(new Error("Uploaded file is empty."));
                            }

                            const mappedData = data.map((row: any) => {
                                const newRow: Record<string, any> ={};
                                columnMapping.forEach(map => {
                                    if (map.csvColumn && row[map.csvColumn] !== undefined) {
                                        newRow[map.dbColumn] = row[map.csvColumn];
                                    }
                                });
                                return newRow;
                            });
                            if (mappedData.length === 0) {
                                return reject(new Error("No valid data found after processing."));
                            }

                            resolve(mappedData);
                        },
                        error: (error) => reject(error),
                    });

                });
            };
            const mappedData = await processFile();
            const result = await updateEvent({eventName, eventDate, mappedData});
            if (result?.event?.event_id){
                router.push(`/events/${result.event.event_id}`);
            }else {
                throw new Error("Failed to create event. Please try again.");
            }

        } catch(error){
            setError(error.message)
            console.error(error)
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div>
            <form className={styles.eventForm} onSubmit={handleSubmit}>
                <textarea name="eventName" value={eventName} onChange={(e)=>setEventName(e.target.value)}
                          spellCheck="false"
                          autoCapitalize="words"
                    onInput={(e) => {
                        e.target.style.height = '';
                        e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                          className="font-[family-name:var(--font-geist-mono)] text-3xl"
                          placeholder={"Event Name"}
                />
                <DatePicker selected={eventDate} value={eventDate} onChange={handleDateChange}/>
                <CSVUpload dbColumns={dbColumns} onFileUpload={handleFileUpload} onMappingUpdate={handleMappingUpdate}/>
                <button
                    disabled={isLoading}
                    type="submit"
                    className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Creating Event...':'Create Event'}
                </button>

            </form>
            {error && <p className="text-red-500">{error}</p>}

        </div>
    );
}
export default EventForm;