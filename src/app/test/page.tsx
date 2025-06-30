import Image from "next/image";

export default function Test(){
    return(

        <div className="bg-style4 bg-cover bg-no-repeat bg-center grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-sourceSans3)]">
            <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">

                <div className="flex items-center gap-2">
                    <Image
                    className="dark:invert"
                    src="/Vector.svg"
                    alt="Connections logo mark"
                    width={55}
                    height={38}
                    priority
                />

                    <div className="text-5xl font-[family-name:var(--font-sourceSans3)] font-semibold">Connections</div>
                    <Image
                        className="dark:invert"
                        src="/connections.svg"
                        alt="Connections logo mark"
                        width={55}
                        height={38}
                        priority
                    />

                </div>

                <div className="flex items-center gap-2">
                <a className="text-s bg-rose-100 rounded-sm px-2 cursor-pointer hover:bg-rose-200 font-[family-name:var(--font-fragment-mono)]">Test</a>
                </div>

                <div className="flex items-center gap-2">
                    <a className="text-s border-2 border-solid border-rose rounded-sm px-2 cursor-pointer font-[family-name:var(--font-fragment-mono)]">Test</a>
                </div>

                <div className="flex items-center gap-2">
                    <a className="text-s bg-teal-100 text-teal rounded-sm px-2 cursor-pointer hover:bg-teal-200 font-[family-name:var(--font-fragment-mono)]">Test</a>
                </div>

                <div className="flex items-center gap-2">
                    <a className="text-s bg-mustard-100 rounded-sm px-2 cursor-pointer hover:bg-mustard-200 font-[family-name:var(--font-fragment-mono)]">Test</a>
                </div>
                <div className="flex items-center gap-2">
                    <a className="text-s border-2 border-solid border-mustard rounded-sm px-2 cursor-pointer font-[family-name:var(--font-fragment-mono)]">Test</a>
                </div>

                <div className="flex items-center gap-2">
                    <a className="text-s bg-blue-100 rounded-sm px-2 cursor-pointer hover:bg-blue-200 font-[family-name:var(--font-fragment-mono)]">Test</a>
                </div>
                <div className="flex items-center gap-2">
                    <a className="text-s border-2 border-solid border-blue rounded-sm px-2 cursor-pointer font-[family-name:var(--font-fragment-mono)]">Test</a>
                </div>


                <div className="text-4xl font-[family-name:var(--font-sourceSans3)]">Heading</div>
                <div className="text-2xl font-[family-name:var(--font-fragment-mono)]">Subheading</div>
                <div className="text-xl font-[family-name:var(--font-sourceSans3)]">Body</div>
                <div className="text-md font-[family-name:var(--font-fragment-mono)]">Utility / code</div>

            </main>
            <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
                <a
                    className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                    href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Image
                        aria-hidden
                        src="/connections.svg"
                        alt="Globe icon"
                        width={16}
                        height={16}
                    />
                    More Tiny Little Community apps →
                </a>
            </footer>
        </div>

    )
}