"use client";

import { useRive } from '@rive-app/react-canvas';

export default function Logo() {
    const { rive, RiveComponent } = useRive({
        src: "/untitled.riv",
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
        <div className="flex items-center">
            <div
                className='cursor-pointer relative w-[75px] h-[75px]'
                onMouseEnter={handleMouseEnter}
            >
                <RiveComponent />
            </div>
        </div>

    );
}