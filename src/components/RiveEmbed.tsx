"use client";

import { useRive } from '@rive-app/react-canvas';

export default function RiveEmbed() {
    const { rive, RiveComponent } = useRive({
        src: "/untitled.riv", // Sample Rive file
        stateMachines: "State Machine 1",
        autoplay: true
    });
    const handleMouseEnter = () => {
        if (rive) {
            rive.reset();
            rive.play();
        }
    };
    return (
        <div
            className='cursor-pointer relative w-[100px] h-[200px]'
            onMouseEnter={handleMouseEnter}
        >
            <RiveComponent />
        </div>
    );
}