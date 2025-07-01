"use client";
import styles from "../app/styles/Home.module.css"
import DatePicker from "./DatePicker"
import CSVUpload from "@/components/CSVUpload";
import React from "react";
import {useCallback, useState, FormEvent} from "react";
import {parse} from 'papaparse';
import {createEvent} from "@/app/actions/updateData";
import {ColumnMap} from "@/components/CSVMapping";
import {useRouter} from "next/navigation";
// TODO: get event details as textinput: event name, location, date, time

interface EventFormProps {
    dbColumns: string[];
    groupId: string | null;
    groupList: { group_id: string; group_name: string }[];
}

interface EventData{
    eventName: string;
    eventDate: Date | null;
    mappedData: Record<string, any>[];
}

function EventForm({dbColumns, groupId, groupList}: EventFormProps) {
    const [eventName, setEventName] = useState('');
    const [eventDate, setEventDate] = useState<Date | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [columnMapping, setColumnMapping] = useState<ColumnMap[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedGroupId, setSelectedGroupId] = useState(groupId || '');
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
            const result = await createEvent({groupId: selectedGroupId || null, eventName, eventDate, mappedData});
            if (result?.event?.event_id){
                const eventId = result?.event?.event_id;
                router.push(`/events/${eventId}`);
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
        <div className=" max-w-xl px-4 sm:px-0 mx-auto text-base w-full">
            <form className="card-white shadow-sm sm:rounded-lg text-gray-800 px-6 py-6 flex flex-col gap-4 items-start max-w-full"  onSubmit={handleSubmit}>
                <textarea name="eventName" value={eventName} onChange={(e)=>setEventName(e.target.value)}
                          spellCheck="false"
                          autoCapitalize="words"
                    onInput={(e) => {
                        e.target.style.height = '';
                        e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                          className="ps-2 w-full font-[family-name:var(--font-sourceSans3)] text-3xl rounded-sm border border-steel/15 rounded focus-visible:outline-4 focus-visible:outline-offset-1 focus-visible:outline-steel-100/50 focus-visible:ring-2"
                          placeholder={"Event Name"}
                />
                {groupList && groupList.length > 0 && (
                    <div className="w-full">
                        <label htmlFor="group-select" className="block text-sm font-medium mb-1">
                            Group
                        </label>
                        <select
                            id="group-select"
                            className="w-full border border-steel/15 rounded focus-visible:outline-4 focus-visible:outline-offset-1 focus-visible:outline-steel/15 focus-visible:ring-2 rounded p-2 mb-4"
                            value={selectedGroupId}
                            onChange={(e) => setSelectedGroupId(e.target.value)}
                        >
                            <option value="">Select a group</option>
                            {groupList.map((group) => (
                                <option key={group.group_id} value={group.group_id}>
                                    {group.group_name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                <DatePicker selected={eventDate} value={eventDate} onChange={handleDateChange}/>
                <CSVUpload dbColumns={dbColumns} onFileUpload={handleFileUpload} onMappingUpdate={handleMappingUpdate}/>
                <button
                    type="submit"
                    className="
                          text-s text-white rounded-sm px-2 py-1
                          flex items-center gap-4
                          justify-center
                          rounded-lg border border-sea-600
                          bg-gradient-to-r from-sea-600 to-sea
                          hover:opacity-90
                            shadow-[0_2px_0] shadow-sea

                          transition-all duration-200 ease-in-out
                          cursor-pointer font-[family-name:var(--font-fragment-mono)]"
                >
                    {isLoading ? 'Creating Event...':'Create Event'}
                </button>
                {error && <p className="text-red-500">{error}</p>}

            </form>

        </div>
    );
}
export default EventForm;