import Logo from "./Logo";


export default function Navbar() {
    return (

        <div className="max-w-xl px-4 sm:px-0 mx-auto text-base pt-4 w-full">
        <div className="flex items-center gap-2 justify-between">

            <div className="flex items-center">
                <Logo/>
                <div className="align-top">
                    <div className="text-4xl text-gray-700 font-[family-name:var(--font-sourceSans3)] font-semibold">Connections</div>
                    <div className="text-l text-gray-600 font-[family-name:var(--font-sourceSans3)]">A Tiny Little Community App</div>
                </div>
            </div>


            <div className="flex-right">
                <button className="text-s bg-sea-600 hover:bg-sea-500 text-white rounded-sm px-2 py-1 cursor-pointer font-[family-name:var(--font-fragment-mono)]">
                {'Log In'}
            </button>
            </div>
        </div>
        </div>
    )
}
