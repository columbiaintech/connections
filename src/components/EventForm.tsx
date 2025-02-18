"use client";
import styles from "../app/styles/Home.module.css"
import DatePicker from "./DatePicker"
// TODO: get event details as textinput: event name, location, date, time

interface EventFormProps {
    eventName: string;
}

function EventForm(props: EventFormProps) {
    return (
        <div>
            <form className={styles.eventForm}>
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
            <DatePicker/>
            </form>
        </div>
    );
};
export default EventForm;